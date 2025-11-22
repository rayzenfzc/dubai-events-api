import fetch from 'node-fetch';
import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env');

// Simple dotenv parser
const envContent = readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    env[key.trim()] = valueParts.join('=').trim();
  }
});

const API_KEY = env.PLATINUMLIST_API_KEY;
const SERVICE_ACCOUNT_PATH = env.FIREBASE_SERVICE_ACCOUNT_PATH;

// Initialize Firebase Admin
const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, '..', SERVICE_ACCOUNT_PATH), 'utf-8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function fetchEvents() {
  console.log('🔄 Fetching events from PlatinumList API...');
  
  try {
    const response = await fetch(
      'https://api.platinumlist.net/v/7/events?scope=affiliate.show.events&per_page=39',
      {
        headers: { 'Api-Key': API_KEY }
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ Fetched ${data.data.length} events`);
    
    return data.data;
  } catch (error) {
    console.error('❌ Error fetching events:', error);
    throw error;
  }
}

async function uploadToFirestore(events) {
  console.log('📤 Uploading events to Firestore...');
  
  const batch = db.batch();
  const eventsRef = db.collection('events');
  
  let uploadCount = 0;
  
  for (const event of events) {
    try {
      // Extract relevant data
      const eventData = {
        id: event.id,
        title: event.name || 'Untitled Event',
        description: event.description || '',
        venue: event.venue?.name || 'TBA',
        venueAddress: event.venue?.address || '',
        
        // Images
        image: event.image?.url || event.featured_image?.url || '',
        thumbnailImage: event.thumbnail_image?.url || '',
        
        // Dates
        startDate: event.start_date || null,
        endDate: event.end_date || null,
        
        // Pricing
        minPrice: event.min_price || 0,
        maxPrice: event.max_price || 0,
        currency: event.currency || 'AED',
        
        // Affiliate/Referral
        referralUrl: event.affiliate_url || event.url || '',
        referralCode: event.affiliate_code || '',
        
        // Categories
        categories: event.categories?.map(cat => cat.name) || [],
        tags: event.tags || [],
        
        // Status
        status: event.status || 'active',
        featured: event.featured || false,
        
        // Metadata
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastFetchedAt: admin.firestore.FieldValue.serverTimestamp(),
        
        // Social media tracking
        postedToInstagram: false,
        instagramPostDate: null
      };
      
      const docRef = eventsRef.doc(event.id.toString());
      batch.set(docRef, eventData, { merge: true });
      uploadCount++;
      
    } catch (error) {
      console.error(`❌ Error processing event ${event.id}:`, error);
    }
  }
  
  await batch.commit();
  console.log(`✅ Successfully uploaded ${uploadCount} events to Firestore`);
  
  return uploadCount;
}

async function main() {
  try {
    console.log('🚀 Starting event sync...\n');
    
    const events = await fetchEvents();
    const uploadedCount = await uploadToFirestore(events);
    
    console.log('\n✨ Sync complete!');
    console.log(`📊 Total events synced: ${uploadedCount}`);
    
    process.exit(0);
  } catch (error) {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  }
}

main();
