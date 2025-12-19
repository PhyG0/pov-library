import { initializeApp } from 'firebase/app';
import { getFirestore, initializeFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};


// Initialize Firebase
let app;
let db;

try {
    if (!firebaseConfig.apiKey) {
        console.warn('Firebase config missing! Check .env file.');
    } else {
        app = initializeApp(firebaseConfig);
        try {
            // Try explicit initialization with long polling to avoid timeouts
            db = initializeFirestore(app, {
                experimentalForceLongPolling: true,
                useFetchStreams: false // Sometimes needed for compatibility
            });
            console.log('Firebase initialized (Long Polling) with project:', firebaseConfig.projectId);
        } catch (e) {
            // Fallback if already initialized or error
            console.warn('Firestore fallback init:', e);
            db = getFirestore(app);
        }
    }
} catch (error) {
    console.error('Firebase initialization error:', error);
    // For development without Firebase, we'll use local storage
    console.warn('Running in offline mode - data will be stored locally');
}

export { db };
export default app;
