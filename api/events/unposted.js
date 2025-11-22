// API endpoint: GET /api/events/unposted
import admin from 'firebase-admin';

// Initialize Firebase Admin (only once)
// Initialize Firebase Admin (only once)
let initError = null;

// Initialize Firebase Admin (only once)
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
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (initError) {
        return res.status(500).json({
            success: false,
            error: 'Firebase Initialization Failed',
            details: initError.message,
            stack: initError.stack
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

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const limit = parseInt(req.query.limit) || 5;

        console.log(`[UNPOSTED API] Fetching up to ${limit} unposted events...`);

        // Get unposted events
        const eventsSnapshot = await db.collection('events')
            .where('posted', '==', false)
            .where('status', '==', 'on sale')
            .limit(limit)
            .get();

        console.log(`[UNPOSTED API] Found ${eventsSnapshot.size} unposted events`);

        const events = [];
        eventsSnapshot.forEach(doc => {
            const data = doc.data();
            events.push({
                id: doc.id,
                title: data.title,
                description: data.description,
                image: data.image,
                price: data.minPrice,
                currency: data.currency,
                link: data.referralUrl,
                venue: data.venue,
                date: data.startDate,
                featured: data.featured || false
            });
        });

        // Sort by featured first, then by date (upcoming events first)
        events.sort((a, b) => {
            // Featured events come first
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;

            // Then sort by date (earliest first)
            const dateA = a.date ? new Date(a.date) : new Date('2099-12-31');
            const dateB = b.date ? new Date(b.date) : new Date('2099-12-31');
            return dateA - dateB;
        });

        console.log(`[UNPOSTED API] Returning ${events.length} events`);
        if (events.length > 0) {
            console.log(`[UNPOSTED API] First event: ${events[0].title}`);
        }

        return res.status(200).json({
            success: true,
            count: events.length,
            events: events,
            message: events.length === 0 ? 'No unposted events found' : `Found ${events.length} unposted events`
        });

    } catch (error) {
        console.error('[UNPOSTED API ERROR]', error);
        console.error('[UNPOSTED API ERROR] Stack:', error.stack);
        return res.status(500).json({
            success: false,
            error: error.message,
            details: 'Check Vercel logs for more information'
        });
    }
}
