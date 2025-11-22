// Fix categories and add referral link to all events
import admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp({
    projectId: 'studio-1436622267-3c444'
});

const db = admin.firestore();

// Your referral link
const REFERRAL_BASE = 'https://platinumlist.net/aff/?ref=ntc1mjv&link=';

async function fixEventsData() {
    try {
        console.log('🔄 Fetching all events from Firestore...\n');

        const eventsSnapshot = await db.collection('events').get();
        console.log(`✅ Found ${eventsSnapshot.size} events\n`);

        console.log('📝 Updating events with categories and referral links...\n');

        const batch = db.batch();
        let count = 0;

        eventsSnapshot.forEach(doc => {
            const event = doc.data();

            // Detect category from title and description
            let category = 'Attraction'; // default
            const text = `${event.title} ${event.description}`.toLowerCase();

            if (text.includes('concert') || text.includes('music') || text.includes('band') || text.includes('singer')) {
                category = 'Concert';
            } else if (text.includes('show') || text.includes('performance') || text.includes('theatre') || text.includes('comedy')) {
                category = 'Show';
            } else if (text.includes('museum') || text.includes('tour') || text.includes('safari') || text.includes('cruise') || text.includes('yacht')) {
                category = 'Attraction';
            }

            // Create referral URL with your affiliate link
            const originalUrl = event.referralUrl || event.url || '';
            const referralUrl = originalUrl ? `${REFERRAL_BASE}${encodeURIComponent(originalUrl)}` : originalUrl;

            // Update the event
            batch.update(doc.ref, {
                category: category,
                referralUrl: referralUrl,
                link: referralUrl,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            count++;

            // Firestore batch limit is 500
            if (count % 500 === 0) {
                console.log(`   ✅ Prepared ${count} events...`);
            }
        });

        console.log('📤 Uploading changes to Firestore...');
        await batch.commit();

        console.log(`\n✅ Updated ${count} events!`);
        console.log('✅ Added your referral link to all events');
        console.log('✅ Fixed categories based on event content\n');
        console.log('🌐 Refresh your website to see the changes!\n');

        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

fixEventsData();
