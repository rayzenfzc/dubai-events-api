// Fetch ALL events from PlatinumList API with images and prices
import fetch from 'node-fetch';
import admin from 'firebase-admin';
import { writeFileSync } from 'fs';

// Initialize Firebase Admin
admin.initializeApp({
    projectId: 'studio-1436622267-3c444'
});

const db = admin.firestore();

const API_KEY = '69eba428-b439-4efd-822f-3f2fdee5e91e';
const BASE_URL = 'https://api.platinumlist.net/v/7/events?scope=affiliate.show.events&include=price';

async function fetchAllEvents() {
    try {
        console.log('🔄 Fetching ALL events from PlatinumList API...\n');

        let allEvents = [];
        let currentPage = 1;
        let totalPages = 1;

        // Fetch first page to get total pages
        const firstResponse = await fetch(`${BASE_URL}&page=1`, {
            headers: {
                'Api-Key': API_KEY,
                'price_scope': 'price'
            }
        });

        if (!firstResponse.ok) {
            throw new Error(`API returned ${firstResponse.status}: ${firstResponse.statusText}`);
        }

        const firstData = await firstResponse.json();
        totalPages = firstData.meta?.pagination?.total_pages || 1;
        const totalEvents = firstData.meta?.pagination?.total || 0;

        console.log(`📊 Total events available: ${totalEvents}`);
        console.log(`📄 Total pages: ${totalPages}\n`);

        // Add first page events
        allEvents = allEvents.concat(firstData.data);
        console.log(`✅ Page 1/${totalPages} - ${firstData.data.length} events`);

        // Fetch remaining pages (limit to first 50 pages for now to avoid timeout)
        const maxPages = Math.min(totalPages, 50);

        for (let page = 2; page <= maxPages; page++) {
            const response = await fetch(`${BASE_URL}&page=${page}`, {
                headers: {
                    'Api-Key': API_KEY,
                    'price_scope': 'price'
                }
            });

            if (response.ok) {
                const data = await response.json();
                allEvents = allEvents.concat(data.data);
                console.log(`✅ Page ${page}/${maxPages} - ${data.data.length} events`);
            } else {
                console.log(`⚠️ Page ${page} failed, skipping...`);
            }

            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        console.log(`\n🎉 Fetched ${allEvents.length} events total!\n`);

        // Process events with proper image and price extraction
        const processedEvents = allEvents.map(event => {
            // Extract price (handle -1 as "no price")
            const price = event.price?.data?.price || 0;
            const actualPrice = price === -1 ? 0 : price;

            // Extract image URL (use image_big or image_full)
            const imageUrl = event.image_big?.src || event.image_full?.src || event.image_medium?.src || '';

            // Extract categories from is_attraction flag
            const categories = [];
            if (event.is_attraction) categories.push('Attraction');
            if (event.artwork_label) categories.push(event.artwork_label);

            return {
                id: event.id,
                title: event.name || 'Event',
                description: event.description || '',
                venue: event.venue?.name || 'TBA',
                venueAddress: event.venue?.address || '',
                image: imageUrl,
                thumbnailImage: event.image_small?.src || '',
                startDate: event.start ? new Date(event.start * 1000).toISOString() : null,
                endDate: event.end ? new Date(event.end * 1000).toISOString() : null,
                minPrice: actualPrice,
                maxPrice: actualPrice,
                currency: event.price?.data?.currency || 'AED',
                referralUrl: event.url || '#',
                referralCode: '',
                categories: categories,
                tags: [],
                status: event.status || 'on sale',
                featured: event.artwork_label === 'recommended' || false
            };
        });

        // Save processed events
        writeFileSync('./events-all-complete.json', JSON.stringify(processedEvents, null, 2));
        console.log(`💾 Saved ${processedEvents.length} events to events-all-complete.json\n`);

        // Upload to Firestore
        console.log('📤 Uploading to Firestore...\n');

        const batch = db.batch();
        const eventIds = [];
        let count = 0;

        for (const event of processedEvents) {
            const docRef = db.collection('events').doc(event.id.toString());

            batch.set(docRef, {
                ...event,
                link: event.referralUrl,
                price: event.minPrice > 0 ? event.minPrice.toString() : '',
                date: event.startDate || '',
                badge: event.featured ? '⭐ Featured' : '',
                category: event.categories && event.categories.length > 0 ? event.categories[0] : ''
            }, { merge: true });

            eventIds.push(event.id.toString());
            count++;

            // Firestore batch limit is 500, commit and start new batch
            if (count % 500 === 0) {
                await batch.commit();
                console.log(`   ✅ Uploaded ${count} events...`);
            }
        }

        // Commit remaining
        if (count % 500 !== 0) {
            await batch.commit();
        }

        console.log(`\n✅ Uploaded ${processedEvents.length} events to Firestore!\n`);

        // Update automation/postedEvents
        console.log('📝 Updating automation/postedEvents...');
        await db.collection('automation').doc('postedEvents').set({
            ids: eventIds,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log('✅ Updated postedEvents document\n');
        console.log('🎉 SUCCESS! All events with images and prices uploaded!');
        console.log('🌐 Refresh your website to see the complete data!\n');

        // Show sample events
        console.log('📋 Sample events:');
        for (let i = 0; i < Math.min(3, processedEvents.length); i++) {
            console.log(`\n${i + 1}. ${processedEvents[i].title}`);
            console.log(`   Image: ${processedEvents[i].image ? '✅ Yes' : '❌ No'}`);
            console.log(`   Price: ${processedEvents[i].minPrice} ${processedEvents[i].currency}`);
            console.log(`   Categories: ${processedEvents[i].categories.join(', ') || 'None'}`);
        }

        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

fetchAllEvents();
