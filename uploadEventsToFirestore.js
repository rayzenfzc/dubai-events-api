// Upload events from events-clean.json to Firestore
import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Initialize Firebase Admin
const serviceAccount = {
  "type": "service_account",
  "project_id": "studio-1436622267-3c444",
  "private_key_id": "YOUR_PRIVATE_KEY_ID",
  "private_key": "YOUR_PRIVATE_KEY",
  "client_email": "YOUR_CLIENT_EMAIL",
  "client_id": "YOUR_CLIENT_ID",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs"
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function uploadEvents() {
  console.log('📖 Reading events-clean.json...');
  
  const events = JSON.parse(readFileSync('./events-clean.json', 'utf-8'));
  console.log(`✅ Found ${events.length} events to upload\n`);
  
  console.log('📤 Uploading to Firestore...');
  
  const batch = db.batch();
  const eventIds = [];
  
  for (const event of events) {
    // Use the event ID as the document ID
    const docRef = db.collection('events').doc(event.id.toString());
    
    const eventData = {
      id: event.id,
      title: event.title,
      description: event.description || '',
      venue: event.venue,
      venueAddress: event.venueAddress || '',
      image: event.image,
      thumbnailImage: event.thumbnailImage || '',
      startDate: event.startDate,
      endDate: event.endDate,
      minPrice: event.minPrice,
      maxPrice: event.maxPrice,
      currency: event.currency,
      referralUrl: event.referralUrl,
      referralCode: event.referralCode || '',
      categories: event.categories || [],
      tags: event.tags || [],
      status: event.status,
      featured: event.featured,
      // Fields for website display
      link: event.referralUrl,
      price: event.minPrice > 0 ? event.minPrice : '',
      date: event.startDate || '',
      badge: '',
      category: event.categories && event.categories.length > 0 ? event.categories[0] : '',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    batch.set(docRef, eventData, { merge: true });
    eventIds.push(event.id.toString());
  }
  
  await batch.commit();
  console.log(`✅ Successfully uploaded ${events.length} events!\n`);
  
  // Update the automation/postedEvents document with all event IDs
  console.log('📝 Updating automation/postedEvents...');
  await db.collection('automation').doc('postedEvents').set({
    ids: eventIds,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  
  console.log('✅ Updated postedEvents document with all event IDs\n');
  console.log('🎉 All done! Your events are now in Firestore.');
  
  process.exit(0);
}

uploadEvents().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
