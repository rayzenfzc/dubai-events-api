// Quick script to add a test event to Firestore
import admin from 'firebase-admin';

// Initialize Firebase Admin
const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID || 'studio-5227087607-7e335',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined
};

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function addTestEvent() {
    try {
        // Create a test event
        const eventData = {
            title: "Dubai Jazz Festival 2025",
            description: "Experience an unforgettable night of live jazz music featuring international and local artists. Join us for an evening of smooth melodies, great food, and amazing atmosphere under the Dubai skyline.",
            venue: "Dubai Media City Amphitheatre",
            startDate: new Date('2025-12-15T19:00:00').toISOString(),
            minPrice: "150",
            currency: "AED",
            image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
            referralUrl: "https://platinumlist.net/event-tickets/jazz-festival-dubai",
            status: "on sale",
            featured: true,
            posted: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            source: 'manual_script'
        };

        const docRef = await db.collection('events').add(eventData);
        console.log('✅ Event created successfully!');
        console.log('Event ID:', docRef.id);
        console.log('Event Title:', eventData.title);
        console.log('\n🎉 Now go to Make.com and run your scenario!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating event:', error);
        process.exit(1);
    }
}

addTestEvent();
