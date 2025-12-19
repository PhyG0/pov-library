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

const COLLECTION_NAME = 'povs';
const LOCAL_STORAGE_KEY = 'eclipse_povs';
const COMMENTS_STORAGE_KEY = 'eclipse_comments';

// Helper to check if Firebase is available
const isFirebaseAvailable = () => !!db;

// Helper to wrap promise with timeout
const withTimeout = (promise, ms = 5000) => {
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
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return [];
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
 * Create a new POV
 */
export async function createPOV(povData) {
    const newPOV = {
        ...povData,
        createdAt: new Date().toISOString(),
        id: Date.now().toString() // Temporary ID
    };

    // Always save to localStorage first as backup/offline mode
    const localPovs = getLocalPOVs();
    localPovs.push(newPOV);
    saveLocalPOVs(localPovs);

    if (isFirebaseAvailable()) {
        try {
            // Try Firebase with a timeout
            // We don't wait for this if we want optimistic UI, but for now let's wait with timeout
            // to get the real ID if possible.
            const docRef = await withTimeout(
                addDoc(collection(db, COLLECTION_NAME), {
                    ...povData,
                    createdAt: Timestamp.now()
                }),
                10000 // 10 second timeout for creation
            );

            return { ...povData, id: docRef.id };
        } catch (error) {
            console.error('Firebase creation failed:', error);
            toast.error(`Firebase Error: ${error.message}`);
            console.warn('Using local storage fallback');
            // Fallback to the local POV we already created
            return newPOV;
        }
    } else {
        return newPOV;
    }
}

/**
 * Get all POVs
 */
export async function getAllPOVs() {
    if (isFirebaseAvailable()) {
        try {
            const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
            const querySnapshot = await withTimeout(getDocs(q), 10000);

            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                // Convert Firestore Timestamp to ISO string
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
            return getLocalPOVs();
        }
    } else {
        return getLocalPOVs();
    }
}

/**
 * Delete a POV
 */
export async function deletePOV(povId) {
    // Always delete from local storage
    const povs = getLocalPOVs();
    const filtered = povs.filter(pov => pov.id !== povId);
    saveLocalPOVs(filtered);

    if (isFirebaseAvailable()) {
        try {
            await withTimeout(deleteDoc(doc(db, COLLECTION_NAME, povId)), 10000);
        } catch (error) {
            console.error('Firebase deletion failed:', error);
            toast.error(`Firebase Delete Error: ${error.message}`);
            // Suppress error since we handled it locally
        }
    }
}

/**
 * Delete multiple POVs
 */
export async function deleteBulkPOVs(povIds) {
    const promises = povIds.map(id => deletePOV(id));
    await Promise.all(promises);
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
 * Get POVs for a specific player
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
export async function addComment(povId, text) {
    const commentData = {
        text,
        createdAt: new Date().toISOString(),
        author: 'Anonymous',
        id: Date.now().toString()
    };

    // Save to local storage first
    const allComments = getLocalComments();
    if (!allComments[povId]) {
        allComments[povId] = [];
    }
    allComments[povId].push(commentData);
    saveLocalComments(allComments);

    if (isFirebaseAvailable()) {
        try {
            await withTimeout(
                addDoc(collection(db, COLLECTION_NAME, povId, 'comments'), {
                    text,
                    createdAt: Timestamp.now(),
                    author: 'Anonymous'
                }),
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
export async function getComments(povId) {
    if (isFirebaseAvailable()) {
        try {
            const q = query(
                collection(db, COLLECTION_NAME, povId, 'comments'),
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
            return (allComments[povId] || []).sort((a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
            );
        }
    } else {
        // Local only
        const allComments = getLocalComments();
        return (allComments[povId] || []).sort((a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
        );
    }
}
