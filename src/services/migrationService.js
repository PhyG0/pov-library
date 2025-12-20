import { db } from './firebase';
import {
    collection,
    getDocs,
    addDoc,
    query,
    orderBy,
    Timestamp
} from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { LEGACY_COLLECTION_NAME } from './povService';

const SLOTS_COLLECTION = 'slots';
const MATCHES_SUBCOLLECTION = 'matches';
const POVS_SUBCOLLECTION = 'povs';

const isFirebaseAvailable = () => !!db;

/**
 * Backup existing POV data to localStorage
 */
export async function backupExistingData() {
    try {
        if (!isFirebaseAvailable()) {
            console.warn('Firebase not available, skipping backup');
            return null;
        }

        const q = query(collection(db, LEGACY_COLLECTION_NAME), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);

        const backupData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            date: doc.data().date instanceof Timestamp
                ? doc.data().date.toDate().toISOString()
                : doc.data().date,
            createdAt: doc.data().createdAt instanceof Timestamp
                ? doc.data().createdAt.toDate().toISOString()
                : doc.data().createdAt
        }));

        // Save to localStorage
        const backupKey = `eclipse_backup_${Date.now()}`;
        localStorage.setItem(backupKey, JSON.stringify(backupData));

        console.log(`Backed up ${backupData.length} POVs to ${backupKey}`);

        // Also download as JSON file
        const dataStr = JSON.stringify(backupData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = `pov_backup_${new Date().toISOString().split('T')[0]}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();

        return backupData;
    } catch (error) {
        console.error('Backup failed:', error);
        toast.error(`Backup Error: ${error.message}`);
        return null;
    }
}

/**
 * Migrate existing POVs to the new hierarchical structure
 * Creates a "Legacy Uploads" slot and groups POVs by date into matches
 */
export async function migrateToHierarchical() {
    try {
        if (!isFirebaseAvailable()) {
            toast.error('Firebase not available. Cannot perform migration.');
            return { success: false, message: 'Firebase not available' };
        }

        // First, backup existing data
        console.log('Starting migration...');
        const backupData = await backupExistingData();

        if (!backupData || backupData.length === 0) {
            console.log('No data to migrate');
            return { success: true, message: 'No data to migrate', migrated: 0 };
        }

        // Create "Legacy Uploads" slot
        const legacySlotRef = await addDoc(collection(db, SLOTS_COLLECTION), {
            name: 'Legacy Uploads',
            description: 'POVs migrated from old structure',
            date: new Date().toISOString(),
            createdAt: Timestamp.now()
        });

        console.log(`Created Legacy Uploads slot: ${legacySlotRef.id}`);

        // Group POVs by date
        const povsGroupedByDate = {};
        backupData.forEach(pov => {
            const dateKey = pov.date ? new Date(pov.date).toISOString().split('T')[0] : 'unknown';
            if (!povsGroupedByDate[dateKey]) {
                povsGroupedByDate[dateKey] = [];
            }
            povsGroupedByDate[dateKey].push(pov);
        });

        let totalMigrated = 0;
        let matchNumber = 1;

        // Create matches for each date group
        for (const [dateKey, povs] of Object.entries(povsGroupedByDate)) {
            // Create match
            const matchRef = await addDoc(
                collection(db, SLOTS_COLLECTION, legacySlotRef.id, MATCHES_SUBCOLLECTION),
                {
                    matchNumber: matchNumber,
                    description: `Migrated POVs from ${dateKey}`,
                    createdAt: Timestamp.now()
                }
            );

            console.log(`Created match ${matchNumber} for date ${dateKey}`);

            // Add POVs to this match
            for (const pov of povs) {
                await addDoc(
                    collection(
                        db,
                        SLOTS_COLLECTION,
                        legacySlotRef.id,
                        MATCHES_SUBCOLLECTION,
                        matchRef.id,
                        POVS_SUBCOLLECTION
                    ),
                    {
                        playerName: pov.playerName,
                        title: pov.title,
                        videoId: pov.videoId,
                        date: pov.date,
                        createdAt: pov.createdAt ? Timestamp.fromDate(new Date(pov.createdAt)) : Timestamp.now()
                    }
                );
                totalMigrated++;
            }

            matchNumber++;
        }

        console.log(`Migration complete! Migrated ${totalMigrated} POVs into ${matchNumber - 1} matches`);

        toast.success(`Migration complete! ${totalMigrated} POVs migrated.`);

        return {
            success: true,
            message: `Migrated ${totalMigrated} POVs into ${matchNumber - 1} matches`,
            migrated: totalMigrated,
            slotId: legacySlotRef.id
        };

    } catch (error) {
        console.error('Migration failed:', error);
        toast.error(`Migration Error: ${error.message}`);
        return {
            success: false,
            message: error.message,
            migrated: 0
        };
    }
}

/**
 * Validate migration - check if hierarchical structure has data
 */
export async function validateMigration() {
    try {
        if (!isFirebaseAvailable()) {
            return { valid: false, message: 'Firebase not available' };
        }

        const slotsSnapshot = await getDocs(collection(db, SLOTS_COLLECTION));

        let totalSlots = slotsSnapshot.size;
        let totalMatches = 0;
        let totalPOVs = 0;

        for (const slotDoc of slotsSnapshot.docs) {
            const matchesSnapshot = await getDocs(
                collection(db, SLOTS_COLLECTION, slotDoc.id, MATCHES_SUBCOLLECTION)
            );
            totalMatches += matchesSnapshot.size;

            for (const matchDoc of matchesSnapshot.docs) {
                const povsSnapshot = await getDocs(
                    collection(
                        db,
                        SLOTS_COLLECTION,
                        slotDoc.id,
                        MATCHES_SUBCOLLECTION,
                        matchDoc.id,
                        POVS_SUBCOLLECTION
                    )
                );
                totalPOVs += povsSnapshot.size;
            }
        }

        console.log('Migration validation:', {
            totalSlots,
            totalMatches,
            totalPOVs
        });

        return {
            valid: totalPOVs > 0,
            totalSlots,
            totalMatches,
            totalPOVs,
            message: `Found ${totalSlots} slots, ${totalMatches} matches, ${totalPOVs} POVs`
        };
    } catch (error) {
        console.error('Validation failed:', error);
        return {
            valid: false,
            message: error.message
        };
    }
}
