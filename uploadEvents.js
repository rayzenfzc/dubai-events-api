// Simple script to fetch PlatinumList events and upload to Firestore
// Usage: node uploadEvents.js

import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const API_KEY = "69eba428-b439-4efd-822f-3f2fdee5e91e";

// Initialize Firebase Admin
const serviceAccount = JSON.parse(
    readFileSync('./firebase-service-account.json', 'utf-8')
);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function fetchAndUpload() {
    console.log('🔄 Fetching events from PlatinumList API...');

    const response = await fetch(
        'https://api.platinumlist.net/v/7/events?scope=affiliate.show.events&per_page=39',
        { headers: { 'Api-Key': API_KEY } }
    );

    const data = await response.json();
    console.log(`✅ Fetched ${data.data.length} events\n`);

    console.log('📤 Uploading to Firestore collection "events"...');

    const batch = db.batch();
    const eventsRef = db.collection('events');

    for (const event of data.data) {
        const eventData = {
            id: event.id,
            title: event.name || 'Untitled Event',
            description: event.description || '',
            venue: event.venue?.name || 'TBA',
            venueAddress: event.venue?.address || '',
            image: event.image?.url || event.featured_image?.url || '',
            startDate: event.start_date || null,
            endDate: event.end_date || null,
            minPrice: event.min_price || 0,
            maxPrice: event.max_price || 0,
            currency: event.currency || 'AED',
            referralUrl: event.affiliate_url || event.url || '',
            referralCode: event.affiliate_code || '',
            categories: event.categories?.map(cat => cat.name) || [],
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        batch.set(eventsRef.doc(event.id.toString()), eventData, { merge: true });
    }

    await batch.commit();
    console.log(`✅ Successfully uploaded ${data.data.length} events to Firestore!`);

    process.exit(0);
}

fetchAndUpload().catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
});
