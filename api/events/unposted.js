// API endpoint: GET /api/events/unposted
import admin from 'firebase-admin';

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
    admin.initializeApp({
        projectId: 'studio-1436622267-3c444'
    });
}

const db = admin.firestore();

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const limit = parseInt(req.query.limit) || 5;

        // Get unposted events
        const eventsSnapshot = await db.collection('events')
            .where('posted', '==', false)
            .where('status', '==', 'on sale')
            .orderBy('featured', 'desc')
            .limit(limit)
            .get();

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
                date: data.startDate
            });
        });

        return res.status(200).json({
            success: true,
            count: events.length,
            events: events
        });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
