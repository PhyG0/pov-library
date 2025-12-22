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

const SLOTS_COLLECTION = 'slots';
const MATCHES_SUBCOLLECTION = 'matches';
const LOCAL_STORAGE_KEY = 'eclipse_matches';

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
const getLocalMatches = () => {
    try {
        const data = localStorage.getItem(LOCAL_STORAGE_KEY);
        return data ? JSON.parse(data) : {};
    } catch (error) {
        console.error('Error reading matches from localStorage:', error);
        return {};
    }
};

const saveLocalMatches = (matches) => {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(matches));
    } catch (error) {
        console.error('Error saving matches to localStorage:', error);
    }
};

/**
 * Create a new match in a slot
 */
export async function createMatch(slotId, matchData) {
    const newMatch = {
        ...matchData,
        createdAt: new Date().toISOString(),
        id: Date.now().toString() // Temporary ID
    };

    // Save to localStorage
    const localMatches = getLocalMatches();
    if (!localMatches[slotId]) {
        localMatches[slotId] = [];
    }
    localMatches[slotId].push(newMatch);
    saveLocalMatches(localMatches);

    if (isFirebaseAvailable()) {
        try {
            const docRef = await withTimeout(
                addDoc(collection(db, SLOTS_COLLECTION, slotId, MATCHES_SUBCOLLECTION), {
                    ...matchData,
                    createdAt: Timestamp.now()
                }),
                10000
            );

            return { ...matchData, id: docRef.id, createdAt: new Date().toISOString() };
        } catch (error) {
            console.error('Firebase match creation failed:', error);
            toast.error(`Firebase Error: ${error.message}`);
            console.warn('Using local storage fallback');
            return newMatch;
        }
    } else {
        return newMatch;
    }
}

/**
 * Get all matches in a slot with POV counts
 */
export async function getMatchesBySlot(slotId) {
    if (isFirebaseAvailable()) {
        try {
            const q = query(
                collection(db, SLOTS_COLLECTION, slotId, MATCHES_SUBCOLLECTION),
                orderBy('matchNumber', 'asc')
            );
            const querySnapshot = await withTimeout(getDocs(q), 10000);

            const matches = await Promise.all(
                querySnapshot.docs.map(async (matchDoc) => {
                    const matchData = matchDoc.data();

                    // Get POV count
                    let povCount = 0;
                    let players = [];

                    try {
                        const povsSnapshot = await getDocs(
                            collection(db, SLOTS_COLLECTION, slotId, MATCHES_SUBCOLLECTION, matchDoc.id, 'povs')
                        );
                        povCount = povsSnapshot.size;

                        // Get unique player names
                        const allPlayers = povsSnapshot.docs.map(doc => doc.data().playerName);
                        players = [...new Set(allPlayers)];
                    } catch (error) {
                        console.error('Error counting POVs:', error);
                    }

                    return {
                        id: matchDoc.id,
                        slotId,
                        ...matchData,
                        createdAt: matchData.createdAt instanceof Timestamp
                            ? matchData.createdAt.toDate().toISOString()
                            : matchData.createdAt,
                        povCount,
                        players
                    };
                })
            );

            return matches;
        } catch (error) {
            console.error('Firebase fetch matches failed:', error);
            toast.error(`Firebase Connection Error: ${error.message}`);
            console.warn('Using local storage fallback');

            const localMatches = getLocalMatches();
            return (localMatches[slotId] || []).map(match => ({ ...match, slotId }));
        }
    } else {
        const localMatches = getLocalMatches();
        return (localMatches[slotId] || []).map(match => ({ ...match, slotId }));
    }
}

/**
 * Get match by ID
 */
export async function getMatchById(slotId, matchId) {
    if (isFirebaseAvailable()) {
        try {
            const docRef = doc(db, SLOTS_COLLECTION, slotId, MATCHES_SUBCOLLECTION, matchId);
            const docSnap = await withTimeout(getDoc(docRef), 10000);

            if (docSnap.exists()) {
                const matchData = docSnap.data();
                return {
                    id: docSnap.id,
                    slotId,
                    ...matchData,
                    createdAt: matchData.createdAt instanceof Timestamp
                        ? matchData.createdAt.toDate().toISOString()
                        : matchData.createdAt
                };
            } else {
                throw new Error('Match not found');
            }
        } catch (error) {
            console.error('Firebase fetch match failed:', error);
            toast.error(`Error fetching match: ${error.message}`);

            // Fallback to local storage
            const localMatches = getLocalMatches();
            const match = (localMatches[slotId] || []).find(m => m.id === matchId);
            if (match) return { ...match, slotId };
            throw error;
        }
    } else {
        const localMatches = getLocalMatches();
        const match = (localMatches[slotId] || []).find(m => m.id === matchId);
        if (match) return { ...match, slotId };
        throw new Error('Match not found');
    }
}

/**
 * Update a match
 */
export async function updateMatch(slotId, matchId, updates) {
    // Update localStorage
    const localMatches = getLocalMatches();
    if (localMatches[slotId]) {
        const index = localMatches[slotId].findIndex(m => m.id === matchId);
        if (index !== -1) {
            localMatches[slotId][index] = { ...localMatches[slotId][index], ...updates };
            saveLocalMatches(localMatches);
        }
    }

    if (isFirebaseAvailable()) {
        try {
            const docRef = doc(db, SLOTS_COLLECTION, slotId, MATCHES_SUBCOLLECTION, matchId);
            await withTimeout(updateDoc(docRef, updates), 10000);
        } catch (error) {
            console.error('Firebase update match failed:', error);
            toast.error(`Update Error: ${error.message}`);
        }
    }
}

/**
 * Delete a match and all its POVs
 */
export async function deleteMatch(slotId, matchId) {
    // Delete from localStorage
    const localMatches = getLocalMatches();
    if (localMatches[slotId]) {
        localMatches[slotId] = localMatches[slotId].filter(m => m.id !== matchId);
        saveLocalMatches(localMatches);
    }

    if (isFirebaseAvailable()) {
        try {
            // Get all POVs in this match
            const povsSnapshot = await getDocs(
                collection(db, SLOTS_COLLECTION, slotId, MATCHES_SUBCOLLECTION, matchId, 'povs')
            );

            // Use batch operations
            const batch = writeBatch(db);

            // Delete all POVs and their comments
            for (const povDoc of povsSnapshot.docs) {
                const commentsSnapshot = await getDocs(
                    collection(db, SLOTS_COLLECTION, slotId, MATCHES_SUBCOLLECTION, matchId, 'povs', povDoc.id, 'comments')
                );

                // Delete comments
                commentsSnapshot.docs.forEach(commentDoc => {
                    batch.delete(commentDoc.ref);
                });

                // Delete POV
                batch.delete(povDoc.ref);
            }

            // Delete match
            batch.delete(doc(db, SLOTS_COLLECTION, slotId, MATCHES_SUBCOLLECTION, matchId));

            await withTimeout(batch.commit(), 15000);
        } catch (error) {
            console.error('Firebase delete match failed:', error);
            toast.error(`Delete Error: ${error.message}`);
        }
    }
}
