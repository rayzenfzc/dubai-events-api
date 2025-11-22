// API endpoint: GET /api/events/[id]/caption
import admin from 'firebase-admin';

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
    try {
        const privateKey = process.env.FIREBASE_PRIVATE_KEY
            ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
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

function generateCaption(event) {
    let caption = `🎉 ${event.title} \n\n`;

    if (event.venue) {
        caption += `📍 ${event.venue} \n`;
    }

    if (event.date) {
        const date = new Date(event.date);
        caption += `📅 ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} \n`;
    }

    if (event.price && event.price > 0) {
        caption += `💰 From ${event.price} ${event.currency} \n`;
    }

    caption += `\n🎫 Get your tickets now!\n`;
    caption += `🔗 ${event.link} \n\n`;
    caption += `#DubaiEvents #Dubai #UAE #ThingsToDo #DubaiLife #VisitDubai #MyDubai #DubaiNightlife #DubaiEntertainment`;

    return caption;
}

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
        const { id } = req.query;

        // Get event data
        const eventDoc = await db.collection('events').doc(id).get();

        if (!eventDoc.exists) {
            return res.status(404).json({
                success: false,
                error: 'Event not found'
            });
        }

        const event = eventDoc.data();
        const caption = generateCaption({
            title: event.title,
            venue: event.venue,
            date: event.startDate,
            price: event.minPrice,
            currency: event.currency,
            link: event.referralUrl
        });

        return res.status(200).json({
            success: true,
            eventId: id,
            caption: caption
        });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
