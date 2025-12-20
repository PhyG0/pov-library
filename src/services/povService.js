import { db } from './firebase';
import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    query,
    orderBy,
    Timestamp
} from 'firebase/firestore';
import { toast } from 'react-hot-toast';

const SLOTS_COLLECTION = 'slots';
const MATCHES_SUBCOLLECTION = 'matches';
const POVS_SUBCOLLECTION = 'povs';
const COMMENTS_SUBCOLLECTION = 'comments';

// Legacy collection name
const LEGACY_COLLECTION_NAME = 'povs';

const LOCAL_STORAGE_KEY = 'eclipse_povs_hierarchical';
const COMMENTS_STORAGE_KEY = 'eclipse_comments_hierarchical';

// Helper to check if Firebase is available
const isFirebaseAvailable = () => !!db;

// Helper to wrap promise with timeout
const withTimeout = (promise, ms = 10000) => {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            reject(new Error('Firebase operation timed out'));
        }, ms);

        promise
            .then((res) => {
                clearTimeout(timeoutId);
                resolve(res);
            })
            .catch((err) => {
                clearTimeout(timeoutId);
                reject(err);
            });
    });
};

// Local storage fallback functions
const getLocalPOVs = () => {
    try {
        const data = localStorage.getItem(LOCAL_STORAGE_KEY);
        return data ? JSON.parse(data) : {};
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return {};
    }
};

const saveLocalPOVs = (povs) => {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(povs));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
};

/**
 * Create a new POV in a specific match
 */
export async function createPOV(slotId, matchId, povData) {
    const newPOV = {
        ...povData,
        createdAt: new Date().toISOString(),
        id: Date.now().toString() // Temporary ID
    };

    // Always save to localStorage first as backup/offline mode
    const localPovs = getLocalPOVs();
    const matchKey = `${slotId}_${matchId}`;
    if (!localPovs[matchKey]) {
        localPovs[matchKey] = [];
    }
    localPovs[matchKey].push(newPOV);
    saveLocalPOVs(localPovs);

    if (isFirebaseAvailable()) {
        try {
            const docRef = await withTimeout(
                addDoc(
                    collection(db, SLOTS_COLLECTION, slotId, MATCHES_SUBCOLLECTION, matchId, POVS_SUBCOLLECTION),
                    {
                        ...povData,
                        createdAt: Timestamp.now()
                    }
                ),
                10000
            );

            return { ...povData, id: docRef.id, createdAt: new Date().toISOString() };
        } catch (error) {
            console.error('Firebase creation failed:', error);
            toast.error(`Firebase Error: ${error.message}`);
            console.warn('Using local storage fallback');
            return newPOV;
        }
    } else {
        return newPOV;
    }
}

/**
 * Get all POVs for a specific match
 */
export async function getPOVsByMatch(slotId, matchId) {
    if (isFirebaseAvailable()) {
        try {
            const q = query(
                collection(db, SLOTS_COLLECTION, slotId, MATCHES_SUBCOLLECTION, matchId, POVS_SUBCOLLECTION),
                orderBy('createdAt', 'desc')
            );
            const querySnapshot = await withTimeout(getDocs(q), 10000);

            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                slotId,
                matchId,
                ...doc.data(),
                date: doc.data().date instanceof Timestamp
                    ? doc.data().date.toDate().toISOString()
                    : doc.data().date,
                createdAt: doc.data().createdAt instanceof Timestamp
                    ? doc.data().createdAt.toDate().toISOString()
                    : doc.data().createdAt
            }));
        } catch (error) {
            console.error('Firebase fetch failed:', error);
            toast.error(`Firebase Connection Error: ${error.message}`);
            console.warn('Using local storage fallback');

            const localPovs = getLocalPOVs();
            const matchKey = `${slotId}_${matchId}`;
            return (localPovs[matchKey] || []).map(pov => ({ ...pov, slotId, matchId }));
        }
    } else {
        const localPovs = getLocalPOVs();
        const matchKey = `${slotId}_${matchId}`;
        return (localPovs[matchKey] || []).map(pov => ({ ...pov, slotId, matchId }));
    }
}

/**
 * Get ALL POVs across all slots and matches (flattened for global search/stats)
 */
export async function getAllPOVs() {
    if (isFirebaseAvailable()) {
        try {
            const allPOVs = [];

            // Get all slots
            const slotsSnapshot = await getDocs(collection(db, SLOTS_COLLECTION));

            for (const slotDoc of slotsSnapshot.docs) {
                const slotId = slotDoc.id;
                const slotData = slotDoc.data();

                // Get all matches in this slot
                const matchesSnapshot = await getDocs(
                    collection(db, SLOTS_COLLECTION, slotId, MATCHES_SUBCOLLECTION)
                );

                for (const matchDoc of matchesSnapshot.docs) {
                    const matchId = matchDoc.id;
                    const matchData = matchDoc.data();

                    // Get all POVs in this match
                    const povsSnapshot = await getDocs(
                        collection(db, SLOTS_COLLECTION, slotId, MATCHES_SUBCOLLECTION, matchId, POVS_SUBCOLLECTION)
                    );

                    povsSnapshot.docs.forEach(povDoc => {
                        const povData = povDoc.data();
                        allPOVs.push({
                            id: povDoc.id,
                            slotId,
                            slotName: slotData.name,
                            matchId,
                            matchNumber: matchData.matchNumber,
                            ...povData,
                            date: povData.date instanceof Timestamp
                                ? povData.date.toDate().toISOString()
                                : povData.date,
                            createdAt: povData.createdAt instanceof Timestamp
                                ? povData.createdAt.toDate().toISOString()
                                : povData.createdAt
                        });
                    });
                }
            }

            // Sort by creation date
            allPOVs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            return allPOVs;
        } catch (error) {
            console.error('Firebase fetch all POVs failed:', error);
            toast.error(`Firebase Connection Error: ${error.message}`);
            console.warn('Using local storage fallback');

            const localPovs = getLocalPOVs();
            const flattened = [];
            for (const [key, povs] of Object.entries(localPovs)) {
                const [slotId, matchId] = key.split('_');
                povs.forEach(pov => {
                    flattened.push({
                        ...pov,
                        slotId,
                        matchId
                    });
                });
            }
            return flattened;
        }
    } else {
        const localPovs = getLocalPOVs();
        const flattened = [];
        for (const [key, povs] of Object.entries(localPovs)) {
            const [slotId, matchId] = key.split('_');
            povs.forEach(pov => {
                flattened.push({
                    ...pov,
                    slotId,
                    matchId
                });
            });
        }
        return flattened;
    }
}

/**
 * Delete a POV
 */
export async function deletePOV(slotId, matchId, povId) {
    // Always delete from local storage
    const povs = getLocalPOVs();
    const matchKey = `${slotId}_${matchId}`;
    if (povs[matchKey]) {
        povs[matchKey] = povs[matchKey].filter(pov => pov.id !== povId);
        saveLocalPOVs(povs);
    }

    if (isFirebaseAvailable()) {
        try {
            await withTimeout(
                deleteDoc(doc(db, SLOTS_COLLECTION, slotId, MATCHES_SUBCOLLECTION, matchId, POVS_SUBCOLLECTION, povId)),
                10000
            );
        } catch (error) {
            console.error('Firebase deletion failed:', error);
            toast.error(`Firebase Delete Error: ${error.message}`);
        }
    }
}

/**
 * Get all unique player names
 */
export async function getAllPlayers() {
    const povs = await getAllPOVs();
    const playerSet = new Set(povs.map(pov => pov.playerName));
    return Array.from(playerSet).sort();
}

/**
 * Get POVs for a specific player (across all slots/matches)
 */
export async function getPOVsByPlayer(playerName) {
    const povs = await getAllPOVs();
    return povs.filter(pov => pov.playerName === playerName);
}

/**
 * Get statistics
 */
export async function getStatistics() {
    const povs = await getAllPOVs();

    // Total POVs
    const total = povs.length;

    // POVs per player
    const playerCounts = {};
    povs.forEach(pov => {
        playerCounts[pov.playerName] = (playerCounts[pov.playerName] || 0) + 1;
    });

    // Most active days
    const dateCounts = {};
    povs.forEach(pov => {
        const dateStr = new Date(pov.date).toLocaleDateString();
        dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
    });

    const mostActiveDays = Object.entries(dateCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([date, count]) => ({ date, count }));

    return {
        total,
        playerCounts,
        mostActiveDays
    };
}

// Local storage helpers for comments
const getLocalComments = () => {
    try {
        const data = localStorage.getItem(COMMENTS_STORAGE_KEY);
        return data ? JSON.parse(data) : {};
    } catch (error) {
        console.error('Error reading comments from localStorage:', error);
        return {};
    }
};

const saveLocalComments = (comments) => {
    try {
        localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(comments));
    } catch (error) {
        console.error('Error saving comments to localStorage:', error);
    }
};

/**
 * Add a comment to a POV
 */
export async function addComment(slotId, matchId, povId, text) {
    const commentData = {
        text,
        createdAt: new Date().toISOString(),
        author: 'Anonymous',
        id: Date.now().toString()
    };

    // Save to local storage first
    const allComments = getLocalComments();
    const povKey = `${slotId}_${matchId}_${povId}`;
    if (!allComments[povKey]) {
        allComments[povKey] = [];
    }
    allComments[povKey].push(commentData);
    saveLocalComments(allComments);

    if (isFirebaseAvailable()) {
        try {
            await withTimeout(
                addDoc(
                    collection(
                        db,
                        SLOTS_COLLECTION,
                        slotId,
                        MATCHES_SUBCOLLECTION,
                        matchId,
                        POVS_SUBCOLLECTION,
                        povId,
                        COMMENTS_SUBCOLLECTION
                    ),
                    {
                        text,
                        createdAt: Timestamp.now(),
                        author: 'Anonymous'
                    }
                ),
                10000
            );
        } catch (error) {
            console.error('Firebase comment failed:', error);
            toast.error(`Comment Error: ${error.message}`);
        }
    }

    return commentData;
}

/**
 * Get comments for a POV
 */
export async function getComments(slotId, matchId, povId) {
    if (isFirebaseAvailable()) {
        try {
            const q = query(
                collection(
                    db,
                    SLOTS_COLLECTION,
                    slotId,
                    MATCHES_SUBCOLLECTION,
                    matchId,
                    POVS_SUBCOLLECTION,
                    povId,
                    COMMENTS_SUBCOLLECTION
                ),
                orderBy('createdAt', 'desc')
            );
            const querySnapshot = await withTimeout(getDocs(q), 10000);

            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt instanceof Timestamp
                    ? doc.data().createdAt.toDate().toISOString()
                    : doc.data().createdAt
            }));
        } catch (error) {
            console.error('Firebase comments fetch failed:', error);
            toast.error(`Comments Error: ${error.message}`);

            // Fallback to local
            const allComments = getLocalComments();
            const povKey = `${slotId}_${matchId}_${povId}`;
            return (allComments[povKey] || []).sort((a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
            );
        }
    } else {
        // Local only
        const allComments = getLocalComments();
        const povKey = `${slotId}_${matchId}_${povId}`;
        return (allComments[povKey] || []).sort((a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
        );
    }
}

// Export legacy collection name for migration
export { LEGACY_COLLECTION_NAME };
