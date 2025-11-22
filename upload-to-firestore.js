// Simple script to upload events to Firestore
import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Initialize Firebase Admin with your project ID
admin.initializeApp({
    projectId: 'studio-1436622267-3c444'
});

const db = admin.firestore();

async function uploadEvents() {
    try {
        console.log('📖 Reading events-clean.json...');
        const events = JSON.parse(readFileSync('./events-clean.json', 'utf-8'));
        console.log(`✅ Found ${events.length} events\n`);

        console.log('📤 Uploading to Firestore...');

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
        console.log(`✅ Uploaded ${events.length} events!\n`);

        console.log('📝 Updating automation/postedEvents...');
        await db.collection('automation').doc('postedEvents').set({
            ids: eventIds,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log('✅ Updated postedEvents document\n');
        console.log('🎉 ALL DONE! Your events are now in Firestore!');
        console.log('🌐 Refresh your website to see them!\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

uploadEvents();
