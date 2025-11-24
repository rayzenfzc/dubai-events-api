// API endpoint to fetch events happening this week
const admin = require('firebase-admin');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
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
}

const db = admin.firestore();

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed. Use GET.'
        });
    }

    try {
        console.log('📅 Fetching weekly events...');

        // Get query parameters
        const daysAhead = parseInt(req.query.days) || 7; // Default 7 days
        const includePosted = req.query.includePosted === 'true'; // Default false
        const limit = parseInt(req.query.limit) || 100; // Default 100

        // Calculate date range
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endDate = new Date(startOfToday);
        endDate.setDate(endDate.getDate() + daysAhead);

        console.log(`📆 Date range: ${startOfToday.toISOString()} to ${endDate.toISOString()}`);

        // Build query
        let query = db.collection('events')
            .where('status', '==', 'on sale');

        // Filter by posted status if needed
        if (!includePosted) {
            query = query.where('posted', '==', false);
        }

        // Execute query
        const snapshot = await query.limit(limit).get();

        const events = [];
        const seenTitles = new Set(); // Prevent duplicates

        snapshot.forEach(doc => {
            const data = doc.data();

            // Parse event date
            let eventDate = null;
            if (data.startDate) {
                eventDate = data.startDate.toDate ? data.startDate.toDate() : new Date(data.startDate);
            } else if (data.date) {
                eventDate = data.date.toDate ? data.date.toDate() : new Date(data.date);
            }

            // Check if event is within date range
            const isWithinRange = !eventDate || (eventDate >= startOfToday && eventDate <= endDate);

            // Only add if within range and title is unique
            if (isWithinRange && !seenTitles.has(data.title)) {
                seenTitles.add(data.title);

                events.push({
                    id: doc.id,
                    title: data.title,
                    description: data.description || '',
                    image: data.image,
                    venue: data.venue || '',
                    date: eventDate ? eventDate.toISOString() : null,
                    price: data.minPrice || data.price || '',
                    currency: data.currency || 'AED',
                    link: data.referralUrl || data.link || '',
                    category: data.category || 'event',
                    featured: data.featured || false,
                    posted: data.posted || false,
                    postedAt: data.postedAt ? (data.postedAt.toDate ? data.postedAt.toDate().toISOString() : data.postedAt) : null
                });
            }
        });

        // Sort by date (earliest first)
        events.sort((a, b) => {
            if (!a.date) return 1;
            if (!b.date) return -1;
            return new Date(a.date) - new Date(b.date);
        });

        console.log(`✅ Found ${events.length} events for the next ${daysAhead} days`);

        return res.status(200).json({
            success: true,
            count: events.length,
            dateRange: {
                start: startOfToday.toISOString(),
                end: endDate.toISOString(),
                days: daysAhead
            },
            events: events,
            message: `Found ${events.length} events happening in the next ${daysAhead} days`
        });

    } catch (error) {
        console.error('❌ Error fetching weekly events:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch weekly events',
            details: error.message
        });
    }
};
