// Fetch complete events from PlatinumList API with images and prices
import fetch from 'node-fetch';
import admin from 'firebase-admin';
import { writeFileSync } from 'fs';

// Initialize Firebase Admin
admin.initializeApp({
    projectId: 'studio-1436622267-3c444'
});

const db = admin.firestore();

const API_KEY = '69eba428-b439-4efd-822f-3f2fdee5e91e';
const API_URL = 'https://api.platinumlist.net/v/7/events?scope=affiliate.show.events&include=price';

async function fetchCompleteEvents() {
    try {
        console.log('🔄 Fetching complete event data from PlatinumList API...\n');

        const response = await fetch(API_URL, {
            headers: {
                'Api-Key': API_KEY,
                'price_scope': 'price'
            }
        });

        if (!response.ok) {
            throw new Error(`API returned ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`✅ Fetched ${data.data ? data.data.length : 0} events from API\n`);

        // Save raw response for inspection
        writeFileSync('./events-complete-raw.json', JSON.stringify(data, null, 2));
        console.log('💾 Saved raw API response to events-complete-raw.json\n');

        if (!data.data || data.data.length === 0) {
            console.log('⚠️ No events found in API response');
            return;
        }

        // Process events
        const events = data.data.map(event => ({
            id: event.id,
            title: event.name || event.title || 'Event',
            description: event.description || '',
            venue: event.venue?.name || event.venue || 'TBA',
            venueAddress: event.venue?.address || '',
            image: event.image || event.thumbnail_image || '',
            thumbnailImage: event.thumbnail_image || '',
            startDate: event.start_date || event.startDate || null,
            endDate: event.end_date || event.endDate || null,
            minPrice: event.min_price || event.minPrice || 0,
            maxPrice: event.max_price || event.maxPrice || 0,
            currency: event.currency || 'AED',
            referralUrl: event.referral_url || event.url || '#',
            referralCode: event.referral_code || '',
            categories: event.categories || [],
            tags: event.tags || [],
            status: event.status || 'on sale',
            featured: event.featured || false
        }));

        // Save processed events
        writeFileSync('./events-complete.json', JSON.stringify(events, null, 2));
        console.log(`💾 Saved ${events.length} processed events to events-complete.json\n`);

        // Upload to Firestore
        console.log('📤 Uploading to Firestore...\n');

        const batch = db.batch();
        const eventIds = [];

        for (const event of events) {
            const docRef = db.collection('events').doc(event.id.toString());

            batch.set(docRef, {
                ...event,
                link: event.referralUrl,
                price: event.minPrice > 0 ? event.minPrice.toString() : '',
                date: event.startDate || '',
                badge: '',
                category: event.categories && event.categories.length > 0 ? event.categories[0] : ''
            }, { merge: true });

            eventIds.push(event.id.toString());
        }

        await batch.commit();
        console.log(`✅ Uploaded ${events.length} events to Firestore!\n`);

        // Update automation/postedEvents
        console.log('📝 Updating automation/postedEvents...');
        await db.collection('automation').doc('postedEvents').set({
            ids: eventIds,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log('✅ Updated postedEvents document\n');
        console.log('🎉 SUCCESS! All events with images and prices uploaded!');
        console.log('🌐 Refresh your website to see the complete data!\n');

        // Show sample event
        console.log('📋 Sample event:');
        console.log(`   Title: ${events[0].title}`);
        console.log(`   Image: ${events[0].image || 'No image'}`);
        console.log(`   Price: ${events[0].minPrice} ${events[0].currency}`);
        console.log(`   Categories: ${events[0].categories.join(', ') || 'None'}\n`);

        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

fetchCompleteEvents();
