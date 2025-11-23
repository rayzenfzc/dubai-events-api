// API endpoint: POST /api/add-attractions
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
        console.error('[ADD-ATTRACTIONS] Firebase admin initialization error', error);
        initError = error;
    }
}

let db;

// Your referral code
const REFERRAL_CODE = "dubaievents";

const attractions = [
    {
        title: "Burj Khalifa - At The Top Tickets",
        description: "Visit the world's tallest building! Experience breathtaking 360° views of Dubai from the observation deck on the 124th and 125th floors.",
        venue: "Downtown Dubai",
        baseUrl: "burj-khalifa.platinumlist.net",
        image: "https://images.pexels.com/photos/162031/dubai-tower-arab-khalifa-162031.jpeg?auto=compress&cs=tinysrgb&w=1200",
        price: "149",
        featured: true
    },
    {
        title: "Burj Al Arab Guided Tour",
        description: "Exclusive guided tour inside the iconic 7-star Burj Al Arab hotel. Discover opulent interiors and stunning architecture.",
        venue: "Burj Al Arab, Jumeirah",
        baseUrl: "burjalarab.platinumlist.net",
        image: "https://images.pexels.com/photos/1470502/pexels-photo-1470502.jpeg?auto=compress&cs=tinysrgb&w=1200",
        price: "299",
        featured: true
    },
    {
        title: "Dubai Safari Park Tickets",
        description: "Explore Dubai Safari Park with over 3,000 animals. Perfect wildlife adventure for families!",
        venue: "Dubai Safari Park",
        baseUrl: "dubaisafaripark.platinumlist.net",
        image: "https://images.pexels.com/photos/247376/pexels-photo-247376.jpeg?auto=compress&cs=tinysrgb&w=1200",
        price: "85",
        featured: false
    },
    {
        title: "Skydive Dubai - Tandem Jump",
        description: "Ultimate adrenaline rush! Tandem skydive over Palm Jumeirah from 13,000 feet with professional instructors.",
        venue: "Skydive Dubai, Palm",
        baseUrl: "skydive.platinumlist.net",
        image: "https://images.pexels.com/photos/1262304/pexels-photo-1262304.jpeg?auto=compress&cs=tinysrgb&w=1200",
        price: "1999",
        featured: true
    },
    {
        title: "Atlantis Aquaventure Waterpark",
        description: "Dubai's biggest waterpark! Thrilling slides, lazy rivers, private beaches, and swim with dolphins.",
        venue: "Atlantis The Palm",
        baseUrl: "altantiswaterpark.platinumlist.net",
        image: "https://images.pexels.com/photos/261101/pexels-photo-261101.jpeg?auto=compress&cs=tinysrgb&w=1200",
        price: "299",
        featured: true
    }
];

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
        console.log('[ADD-ATTRACTIONS] Adding PlatinumList attractions...');
        const added = [];

        for (const attraction of attractions) {
            const eventData = {
                title: attraction.title,
                description: attraction.description,
                venue: attraction.venue,
                startDate: new Date('2025-12-31T12:00:00').toISOString(),
                minPrice: attraction.price,
                currency: "AED",
                image: attraction.image,
                referralUrl: `https://${attraction.baseUrl}/?ref=${REFERRAL_CODE}`,
                status: "on sale",
                featured: attraction.featured,
                posted: false,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                source: 'platinumlist',
                category: 'attraction'
            };

            const docRef = await db.collection('events').add(eventData);
            added.push({
                id: docRef.id,
                title: attraction.title
            });
            console.log(`[ADD-ATTRACTIONS] ✅ Added: ${attraction.title}`);
        }

        console.log(`[ADD-ATTRACTIONS] 🎉 Successfully added ${added.length} attractions`);

        return res.status(200).json({
            success: true,
            message: `Successfully added ${added.length} PlatinumList attractions`,
            count: added.length,
            attractions: added
        });

    } catch (error) {
        console.error('[ADD-ATTRACTIONS ERROR]', error);
        return res.status(500).json({
            success: false,
            error: error.message,
            details: 'Check Vercel logs for more information'
        });
    }
}
