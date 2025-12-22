import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
    measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase safely
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

// Simple map name helper (simplified version of utils/mapUtils.js)
const getMapName = (matchNumber) => {
    switch (matchNumber) {
        case 1: return 'Erangle';
        case 2: return 'Miramar';
        case 3: return 'Rondo';
        case 4: return 'Sanhok';
        case 5: return 'Other';
        default: return `Match ${matchNumber}`;
    }
};

export default async function handler(req, res) {
    const { path } = req.query; // We'll pass the full path via query param

    try {
        // 1. Fetch index.html
        const protocol = req.headers['x-forwarded-proto'] || 'https';
        const host = req.headers.host;
        const indexUrl = `${protocol}://${host}/index.html`;
        const indexRes = await fetch(indexUrl);

        if (!indexRes.ok) {
            throw new Error(`Failed to fetch index.html: ${indexRes.status}`);
        }

        let html = await indexRes.text();
        let title = 'Eclipse POV';
        let description = 'Team POV Management - Upload and organize YouTube gameplay recordings';

        // Parse path to determine what data to fetch
        // Format: /slots/:slotId/matches/:matchId/players/:playerName
        const parts = path ? path.split('/').filter(p => p) : [];

        // /slots/:slotId
        if (parts[0] === 'slots' && parts[1]) {
            const slotId = parts[1];
            const slotDoc = await getDoc(doc(db, 'slots', slotId));

            if (slotDoc.exists()) {
                const slot = slotDoc.data();
                title = `${slot.name} | Eclipse POV`;
                description = slot.description || `View matches for ${slot.name}`;

                if (parts[2] === 'matches' && parts[3]) {
                    const matchId = parts[3];
                    const matchDoc = await getDoc(doc(db, 'slots', slotId, 'matches', matchId));

                    if (matchDoc.exists()) {
                        const match = matchDoc.data();
                        const mapName = getMapName(match.matchNumber);

                        if (parts[4] === 'players' && parts[5]) {
                            // Player View
                            const playerName = decodeURIComponent(parts[5]);
                            const dateStr = slot.date ?
                                new Date(slot.date.seconds ? slot.date.seconds * 1000 : slot.date)
                                    .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                : '';

                            title = `${playerName} - ${slot.name} (${dateStr}) | Eclipse POV`;
                            description = `Watch ${playerName}'s POVs from ${slot.name} - ${dateStr}`;
                        } else {
                            // Match View
                            title = `${mapName} - ${slot.name} | Eclipse POV`;
                            description = `Match details and POVs for ${mapName} in ${slot.name}`;
                        }
                    }
                }
            }
        }

        // Inject Meta Tags
        // Replace generic title
        html = html.replace(
            /<title>.*?<\/title>/,
            `<title>${title}</title>\n    <meta property="og:title" content="${title}" />`
        );

        // Replace generic description
        html = html.replace(
            /<meta name="description" content=".*?"\s*\/?>/,
            `<meta name="description" content="${description}" />\n    <meta property="og:description" content="${description}" />`
        );

        // Add OG Type if missing
        const ogType = '<meta property="og:type" content="website" />';
        if (!html.includes('og:type')) {
            html = html.replace('</head>', `${ogType}\n</head>`);
        }

        res.setHeader('Content-Type', 'text/html');
        res.send(html);

    } catch (error) {
        console.error('Error generating meta tags:', error);
        res.status(500).send('Internal Server Error: Failed to generate preview.');
    }
}
