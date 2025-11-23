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
        title: "Dubai Frame - Iconic Landmark Experience",
        description: "Visit the world's largest picture frame! Enjoy panoramic views of Old and New Dubai from the 150-meter high bridge. A must-see architectural marvel connecting Dubai's past and future.",
        venue: "Zabeel Park",
        baseUrl: "dubaiframe.platinumlist.net",
        image: "https://images.pexels.com/photos/1470405/pexels-photo-1470405.jpeg?auto=compress&cs=tinysrgb&w=1200",
        price: "50",
        featured: false
    },
    {
        title: "IMG Worlds of Adventure - World's Largest Indoor Theme Park",
        description: "Experience the world's largest indoor theme park! Meet Marvel superheroes, Cartoon Network characters, and enjoy thrilling rides. Perfect for families in air-conditioned comfort!",
        venue: "City of Arabia, Dubai",
        baseUrl: "imgworld.platinumlist.net",
        image: "https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?auto=compress&cs=tinysrgb&w=1200",
        price: "275",
        featured: true
    },
    {
        title: "Dreamland Aqua Park - Ultimate Water Adventure",
        description: "Dive into fun at the UAE's largest waterpark! Over 25 rides and attractions, wave pools, and family-friendly zones. Beat the heat with an unforgettable water adventure!",
        venue: "Umm Al Quwain",
        baseUrl: "dreamlandaquaparktickets.platinumlist.net",
        image: "https://images.pexels.com/photos/1320684/pexels-photo-1320684.jpeg?auto=compress&cs=tinysrgb&w=1200",
        price: "120",
        featured: false
    },
    {
        title: "Ski Dubai - Indoor Snow Park & Penguin Encounter",
        description: "Ski and snowboard in the desert! Enjoy real snow, ski slopes, toboggan runs, and meet adorable penguins. The Middle East's first indoor ski resort - escape the heat!",
        venue: "Mall of the Emirates",
        baseUrl: "skidubai.platinumlist.net",
        image: "https://images.pexels.com/photos/848618/pexels-photo-848618.jpeg?auto=compress&cs=tinysrgb&w=1200",
        price: "199",
        featured: true
    },
    {
        title: "The View at The Palm - 52nd Floor Observatory",
        description: "Soar 240 meters above Palm Jumeirah for stunning 360° views! Experience the world's most innovative observation deck with interactive displays and breathtaking coastal vistas.",
        venue: "The Palm Tower, Palm Jumeirah",
        baseUrl: "viewthepalm.platinumlist.net",
        image: "https://images.pexels.com/photos/2044434/pexels-photo-2044434.jpeg?auto=compress&cs=tinysrgb&w=1200",
        price: "110",
        featured: false
    },
    {
        title: "Dubai Miracle Garden - 150 Million Flowers",
        description: "Step into a floral wonderland! Explore stunning displays, themed gardens, and the famous Emirates A380 covered in flowers. World's largest natural flower garden!",
        venue: "Al Barsha South",
        baseUrl: "miraclegarden.platinumlist.net",
        image: "https://images.pexels.com/photos/158063/bellingrath-gardens-alabama-landscape-scenic-158063.jpeg?auto=compress&cs=tinysrgb&w=1200",
        price: "75",
        featured: false
    },
    {
        title: "Jebel Jais Flight - World's Longest Zipline",
        description: "Fly at 150 km/h on the world's longest zipline! Soar 1,680 meters across Jebel Jais mountain. Ultimate adrenaline rush with breathtaking RAK mountain views!",
        venue: "Jebel Jais, Ras Al Khaimah",
        baseUrl: "jebeljaisflight.platinumlist.net",
        image: "https://images.pexels.com/photos/235985/pexels-photo-235985.jpeg?auto=compress&cs=tinysrgb&w=1200",
        price: "650",
        featured: true
    },
    {
        title: "Dubai Helicopter Tour - Aerial City Views",
        description: "See Dubai from above! Fly over Palm Jumeirah, Burj Al Arab, Burj Khalifa, and Dubai Marina. Unforgettable aerial photography and luxury sightseeing experience!",
        venue: "Dubai Heliport",
        baseUrl: "dubaihelicoptertour.platinumlist.net",
        image: "https://images.pexels.com/photos/2026324/pexels-photo-2026324.jpeg?auto=compress&cs=tinysrgb&w=1200",
        price: "750",
        featured: true
    },
    {
        title: "Premium Desert Safari - Dune Bashing & BBQ Dinner",
        description: "Experience authentic Arabian adventure! Thrilling dune bashing, camel rides, sandboarding, traditional BBQ dinner, belly dancing, and starlit desert camp experience.",
        venue: "Dubai Desert Conservation Reserve",
        baseUrl: "bestdubaisafari.platinumlist.net",
        image: "https://images.pexels.com/photos/39853/woman-girl-freedom-happy-39853.jpeg?auto=compress&cs=tinysrgb&w=1200",
        price: "199",
        featured: true
    },
    {
        title: "Dubai Marina Dinner Cruise - Luxury Dhow Experience",
        description: "Sail through Dubai Marina on a traditional dhow! Enjoy international buffet dinner, live entertainment, and stunning views of Dubai's illuminated skyline. Romantic evening guaranteed!",
        venue: "Dubai Marina",
        baseUrl: "boatscruises.platinumlist.net",
        image: "https://images.pexels.com/photos/1007657/pexels-photo-1007657.jpeg?auto=compress&cs=tinysrgb&w=1200",
        price: "150",
        featured: false
    },
    {
        title: "Dubai Water Sports - Jet Ski, Parasailing & More",
        description: "Action-packed water adventure! Jet skiing, parasailing, flyboarding, wakeboarding, and banana boat rides. Experience Dubai's coastline with thrilling water sports!",
        venue: "JBR Beach & Palm Jumeirah",
        baseUrl: "watersports.platinumlist.net",
        image: "https://images.pexels.com/photos/2049414/pexels-photo-2049414.jpeg?auto=compress&cs=tinysrgb&w=1200",
        price: "299",
        featured: false
    },
    {
        title: "Dubai Museums Pass - Cultural Heritage Tour",
        description: "Explore Dubai's rich history! Visit Dubai Museum, Al Fahidi Historical District, Coffee Museum, and Heritage Village. Discover the city's transformation from fishing village to modern metropolis.",
        venue: "Multiple Locations",
        baseUrl: "dubaimuseums.platinumlist.net",
        image: "https://images.pexels.com/photos/2263436/pexels-photo-2263436.jpeg?auto=compress&cs=tinysrgb&w=1200",
        price: "95",
        featured: false
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
