// API endpoint: POST /api/create-test-event
import admin from 'firebase-admin';

// Initialize Firebase Admin (only once)
let initError = null;

if (!admin.apps.length) {
    try {
        const privateKey = process.env.FIREBASE_PRIVATE_KEY
            ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/\\\\n/g, '\n')
            : undefined;

        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: privateKey,
            })
        });
    } catch (error) {
        console.error('Firebase admin initialization error', error);
        initError = error;
    }
}

let db;

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (initError) {
        return res.status(500).json({
            success: false,
            error: 'Firebase Initialization Failed',
            details: initError.message
        });
    }

    // Initialize DB if not already done
    if (!db) {
        try {
            db = admin.firestore();
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: 'Firestore Initialization Failed',
                details: error.message
            });
        }
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const eventData = {
            title: "Dubai Jazz Festival 2025",
            description: "Experience an unforgettable night of live jazz music featuring international and local artists. Join us for an evening of smooth melodies, great food, and amazing atmosphere under the Dubai skyline.",
            venue: "Dubai Media City Amphitheatre",
            startDate: new Date('2025-12-15T19:00:00').toISOString(),
            minPrice: "150",
            currency: "AED",
            image: "https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg",
            referralUrl: "https://platinumlist.net/event-tickets/jazz-festival-dubai",
            status: "on sale",
            featured: true,
            posted: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            source: 'api_endpoint'
        };

        console.log('[CREATE-TEST-EVENT] Creating test event...');
        const docRef = await db.collection('events').add(eventData);
        console.log('[CREATE-TEST-EVENT] ✅ Event created:', docRef.id);

        return res.status(200).json({
            success: true,
            eventId: docRef.id,
            eventTitle: eventData.title,
            message: 'Test event created successfully! Now run your Make.com scenario.'
        });

    } catch (error) {
        console.error('[CREATE-TEST-EVENT ERROR]', error);
        return res.status(500).json({
            success: false,
            error: error.message,
            details: 'Check Vercel logs for more information'
        });
    }
}
