// Fetch events from PlatinumList API and save to JSON file
import { writeFileSync } from 'fs';

const API_KEY = "69eba428-b439-4efd-822f-3f2fdee5e91e";

fetch('https://api.platinumlist.net/v/7/events?scope=affiliate.show.events&per_page=39', {
    headers: { 'Api-Key': API_KEY }
})
    .then(res => res.json())
    .then(data => {

        // Save raw data
        writeFileSync('events-raw.json', JSON.stringify(data, null, 2));
        console.log('✅ Raw data saved to events-raw.json');

        // Process and save cleaned data
        const events = data.data.map(event => ({
            id: event.id,
            title: event.name || 'Untitled Event',
            description: event.description || '',
            venue: event.venue?.name || 'TBA',
            venueAddress: event.venue?.address || '',
            image: event.image?.url || event.featured_image?.url || '',
            thumbnailImage: event.thumbnail_image?.url || '',
            startDate: event.start_date || null,
            endDate: event.end_date || null,
            minPrice: event.min_price || 0,
            maxPrice: event.max_price || 0,
            currency: event.currency || 'AED',
            referralUrl: event.affiliate_url || event.url || '',
            referralCode: event.affiliate_code || '',
            categories: event.categories?.map(cat => cat.name) || [],
            tags: event.tags || [],
            status: event.status || 'active',
            featured: event.featured || false
        }));

        writeFileSync('events-clean.json', JSON.stringify(events, null, 2));
        console.log('✅ Cleaned data saved to events-clean.json');
        console.log(`📊 Total events: ${events.length}`);
    })
    .catch(error => {
        console.error('❌ Error fetching events:', error);
    });
