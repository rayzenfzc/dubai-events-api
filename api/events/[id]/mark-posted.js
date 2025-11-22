// API endpoint: POST /api/events/[id]/mark-posted
import admin from 'firebase-admin';

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
    }
}

const db = admin.firestore();

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({
                success: false,
                error: 'Event ID is required'
            });
        }

        console.log(`[MARK-POSTED API] Marking event ${id} as posted...`);

        // Check if event exists
        const eventDoc = await db.collection('events').doc(id).get();

        if (!eventDoc.exists) {
            console.log(`[MARK-POSTED API] Event ${id} not found`);
            return res.status(404).json({
                success: false,
                error: 'Event not found'
            });
        }

        const eventData = eventDoc.data();
        console.log(`[MARK-POSTED API] Event found: ${eventData.title}`);

        await db.collection('events').doc(id).update({
            posted: true,
            postedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log(`[MARK-POSTED API] ✅ Successfully marked event ${id} as posted`);

        return res.status(200).json({
            success: true,
            eventId: id,
            eventTitle: eventData.title,
            message: 'Event marked as posted'
        });

    } catch (error) {
        console.error('[MARK-POSTED API ERROR]', error);
        console.error('[MARK-POSTED API ERROR] Stack:', error.stack);
        return res.status(500).json({
            success: false,
            error: error.message,
            details: 'Check Vercel logs for more information'
        });
    }
}
