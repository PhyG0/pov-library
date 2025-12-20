import { db } from './firebase';
import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    deleteDoc,
    updateDoc,
    doc,
    query,
    orderBy,
    Timestamp,
    writeBatch
} from 'firebase/firestore';
import { toast } from 'react-hot-toast';

const COLLECTION_NAME = 'slots';
const LOCAL_STORAGE_KEY = 'eclipse_slots';

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
const getLocalSlots = () => {
    try {
        const data = localStorage.getItem(LOCAL_STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error reading slots from localStorage:', error);
        return [];
    }
};

const saveLocalSlots = (slots) => {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(slots));
    } catch (error) {
        console.error('Error saving slots to localStorage:', error);
    }
};

/**
 * Create a new slot
 */
export async function createSlot(slotData) {
    const newSlot = {
        ...slotData,
        createdAt: new Date().toISOString(),
        id: Date.now().toString() // Temporary ID
    };

    // Always save to localStorage first as backup/offline mode
    const localSlots = getLocalSlots();
    localSlots.push(newSlot);
    saveLocalSlots(localSlots);

    if (isFirebaseAvailable()) {
        try {
            const docRef = await withTimeout(
                addDoc(collection(db, COLLECTION_NAME), {
                    ...slotData,
                    createdAt: Timestamp.now()
                }),
                10000
            );

            return { ...slotData, id: docRef.id, createdAt: new Date().toISOString() };
        } catch (error) {
            console.error('Firebase slot creation failed:', error);
            toast.error(`Firebase Error: ${error.message}`);
            console.warn('Using local storage fallback');
            return newSlot;
        }
    } else {
        return newSlot;
    }
}

/**
 * Get all slots with match and POV counts
 */
export async function getAllSlots() {
    if (isFirebaseAvailable()) {
        try {
            const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
            const querySnapshot = await withTimeout(getDocs(q), 10000);

            const slots = await Promise.all(
                querySnapshot.docs.map(async (slotDoc) => {
                    const slotData = slotDoc.data();

                    // Get match count
                    let matchCount = 0;
                    let povCount = 0;

                    try {
                        const matchesSnapshot = await getDocs(
                            collection(db, COLLECTION_NAME, slotDoc.id, 'matches')
                        );
                        matchCount = matchesSnapshot.size;

                        // Get total POV count across all matches
                        for (const matchDoc of matchesSnapshot.docs) {
                            const povsSnapshot = await getDocs(
                                collection(db, COLLECTION_NAME, slotDoc.id, 'matches', matchDoc.id, 'povs')
                            );
                            povCount += povsSnapshot.size;
                        }
                    } catch (error) {
                        console.error('Error counting matches/POVs:', error);
                    }

                    return {
                        id: slotDoc.id,
                        ...slotData,
                        date: slotData.date instanceof Timestamp
                            ? slotData.date.toDate().toISOString()
                            : slotData.date,
                        createdAt: slotData.createdAt instanceof Timestamp
                            ? slotData.createdAt.toDate().toISOString()
                            : slotData.createdAt,
                        matchCount,
                        povCount
                    };
                })
            );

            return slots;
        } catch (error) {
            console.error('Firebase fetch slots failed:', error);
            toast.error(`Firebase Connection Error: ${error.message}`);
            console.warn('Using local storage fallback');
            return getLocalSlots();
        }
    } else {
        return getLocalSlots();
    }
}

/**
 * Get slot by ID
 */
export async function getSlotById(slotId) {
    if (isFirebaseAvailable()) {
        try {
            const docRef = doc(db, COLLECTION_NAME, slotId);
            const docSnap = await withTimeout(getDoc(docRef), 10000);

            if (docSnap.exists()) {
                const slotData = docSnap.data();
                return {
                    id: docSnap.id,
                    ...slotData,
                    date: slotData.date instanceof Timestamp
                        ? slotData.date.toDate().toISOString()
                        : slotData.date,
                    createdAt: slotData.createdAt instanceof Timestamp
                        ? slotData.createdAt.toDate().toISOString()
                        : slotData.createdAt
                };
            } else {
                throw new Error('Slot not found');
            }
        } catch (error) {
            console.error('Firebase fetch slot failed:', error);
            toast.error(`Error fetching slot: ${error.message}`);

            // Fallback to local storage
            const localSlots = getLocalSlots();
            const slot = localSlots.find(s => s.id === slotId);
            if (slot) return slot;
            throw error;
        }
    } else {
        const localSlots = getLocalSlots();
        const slot = localSlots.find(s => s.id === slotId);
        if (slot) return slot;
        throw new Error('Slot not found');
    }
}

/**
 * Update a slot
 */
export async function updateSlot(slotId, updates) {
    // Update localStorage
    const localSlots = getLocalSlots();
    const index = localSlots.findIndex(s => s.id === slotId);
    if (index !== -1) {
        localSlots[index] = { ...localSlots[index], ...updates };
        saveLocalSlots(localSlots);
    }

    if (isFirebaseAvailable()) {
        try {
            const docRef = doc(db, COLLECTION_NAME, slotId);
            await withTimeout(updateDoc(docRef, updates), 10000);
        } catch (error) {
            console.error('Firebase update slot failed:', error);
            toast.error(`Update Error: ${error.message}`);
        }
    }
}

/**
 * Delete a slot and all its nested data (matches and POVs)
 */
export async function deleteSlot(slotId) {
    // Delete from localStorage
    const localSlots = getLocalSlots();
    const filtered = localSlots.filter(s => s.id !== slotId);
    saveLocalSlots(filtered);

    if (isFirebaseAvailable()) {
        try {
            // Get all matches in this slot
            const matchesSnapshot = await getDocs(
                collection(db, COLLECTION_NAME, slotId, 'matches')
            );

            // Use batch operations for efficiency
            const batch = writeBatch(db);

            // Delete all POVs in all matches
            for (const matchDoc of matchesSnapshot.docs) {
                const povsSnapshot = await getDocs(
                    collection(db, COLLECTION_NAME, slotId, 'matches', matchDoc.id, 'povs')
                );

                // Delete each POV and its comments
                for (const povDoc of povsSnapshot.docs) {
                    const commentsSnapshot = await getDocs(
                        collection(db, COLLECTION_NAME, slotId, 'matches', matchDoc.id, 'povs', povDoc.id, 'comments')
                    );

                    // Delete comments
                    commentsSnapshot.docs.forEach(commentDoc => {
                        batch.delete(commentDoc.ref);
                    });

                    // Delete POV
                    batch.delete(povDoc.ref);
                }

                // Delete match
                batch.delete(matchDoc.ref);
            }

            // Delete slot
            batch.delete(doc(db, COLLECTION_NAME, slotId));

            await withTimeout(batch.commit(), 15000);
        } catch (error) {
            console.error('Firebase delete slot failed:', error);
            toast.error(`Delete Error: ${error.message}`);
        }
    }
}
