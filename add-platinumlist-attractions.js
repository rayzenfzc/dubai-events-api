// Script to add PlatinumList attractions as events
import admin from 'firebase-admin';

// Initialize Firebase Admin
const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID || 'studio-5227087607-7e335',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined
};

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

// Your referral code - CHANGE THIS to your actual referral code
const REFERRAL_CODE = "dubaievents"; // ← PUT YOUR REFERRAL CODE HERE

const attractions = [
    {
        title: "Burj Khalifa - At The Top Tickets",
        description: "Visit the world's tallest building! Experience breathtaking 360° views of Dubai from the observation deck on the 124th and 125th floors. Skip the lines with priority access to the iconic Burj Khalifa.",
        venue: "Downtown Dubai",
        baseUrl: "burj-khalifa.platinumlist.net",
        image: "https://images.pexels.com/photos/162031/dubai-tower-arab-khalifa-162031.jpeg?auto=compress&cs=tinysrgb&w=1200",
        price: "149",
        featured: true
    },
    {
        title: "Burj Al Arab Guided Tour - Inside the World's Most Luxurious Hotel",
        description: "Exclusive guided tour inside the iconic 7-star Burj Al Arab hotel. Discover the opulent interiors, stunning architecture, and luxurious amenities of Dubai's most famous landmark.",
        venue: "Burj Al Arab, Jumeirah",
        baseUrl: "burjalarab.platinumlist.net",
        image: "https://images.pexels.com/photos/1470502/pexels-photo-1470502.jpeg?auto=compress&cs=tinysrgb&w=1200",
        price: "299",
        featured: true
    },
    {
        title: "Dubai Safari Park Tickets - Wildlife Adventure",
        description: "Explore Dubai Safari Park with over 3,000 animals from around the world. Get up close with lions, giraffes, elephants and more in this amazing wildlife experience perfect for families.",
        venue: "Dubai Safari Park, Al Warqa",
        baseUrl: "dubaisafaripark.platinumlist.net",
        image: "https://images.pexels.com/photos/247376/pexels-photo-247376.jpeg?auto=compress&cs=tinysrgb&w=1200",
        price: "85",
        featured: false
    },
    {
        title: "Dubai Frame Tickets - Iconic Landmark Experience",
        description: "Visit the world's largest picture frame! Enjoy panoramic views of Old and New Dubai from the 150-meter high bridge. A must-see architectural marvel connecting Dubai's past and future.",
        venue: "Zabeel Park",
        baseUrl: "dubaiframe.platinumlist.net",
        image: "https://images.pexels.com/photos/1470405/pexels-photo-1470405.jpeg?auto=compress&cs=tinysrgb&w=1200",
        price: "50",
        featured: false
    },
    {
        title: "Skydive Dubai - Tandem Skydiving Experience",
        description: "Experience the ultimate adrenaline rush with a tandem skydive over the iconic Palm Jumeirah! Jump from 13,000 feet with professional instructors and enjoy breathtaking views of Dubai.",
        venue: "Skydive Dubai, Palm Dropzone",
        baseUrl: "skydive.platinumlist.net",
        image: "https://images.pexels.com/photos/1262304/pexels-photo-1262304.jpeg?auto=compress&cs=tinysrgb&w=1200",
        price: "1999",
        featured: true
    },
    {
        title: "Atlantis Aquaventure Waterpark - Dubai's Biggest Waterpark",
        description: "Dive into adventure at Aquaventure Waterpark! Enjoy thrilling water slides, lazy rivers, private beaches, and swim with dolphins. Perfect for families and thrill-seekers alike.",
        venue: "Atlantis The Palm",
        baseUrl: "altantiswaterpark.platinumlist.net",
        image: "https://images.pexels.com/photos/261101/pexels-photo-261101.jpeg?auto=compress&cs=tinysrgb&w=1200",
        price: "299",
        featured: true
    },
    {
        title: "IMG Worlds of Adventure - World's Largest Indoor Theme Park",
        description: "Experience the world's largest indoor theme park! Meet Marvel superheroes, Cartoon Network characters, and enjoy thrilling rides and attractions in a fully air-conditioned environment.",
        venue: "City of Arabia, Dubai",
        baseUrl: "imgworld.platinumlist.net",
        image: "https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?auto=compress&cs=tinysrgb&w=1200",
        price: "275",
        featured: false
    },
    {
        title: "Ski Dubai - Indoor Skiing & Snowboarding",
        description: "Ski and snowboard in the desert! Enjoy real snow, ski slopes, and meet adorable penguins at the Middle East's first indoor ski resort. Perfect escape from the Dubai heat!",
        venue: "Mall of the Emirates",
        baseUrl: "skidubai.platinumlist.net",
        image: "https://images.pexels.com/photos/848618/pexels-photo-848618.jpeg?auto=compress&cs=tinysrgb&w=1200",
        price: "199",
        featured: false
    },
    {
        title: "The View at The Palm - Observation Deck",
        description: "Soar 240 meters above Palm Jumeirah for stunning 360° views. Experience the world's most innovative observation deck with interactive displays and breathtaking vistas of Dubai's coastline.",
        venue: "The Palm Tower, Palm Jumeirah",
        baseUrl: "viewthepalm.platinumlist.net",
        image: "https://images.pexels.com/photos/2044434/pexels-photo-2044434.jpeg?auto=compress&cs=tinysrgb&w=1200",
        price: "110",
        featured: false
    },
    {
        title: "Dubai Miracle Garden - World's Largest Flower Garden",
        description: "Step into a floral wonderland with over 150 million flowers! Explore stunning displays, themed gardens, and the famous Emirates A380 covered in flowers. A must-visit seasonal attraction.",
        venue: "Al Barsha South",
        baseUrl: "miraclegarden.platinumlist.net",
        image: "https://images.pexels.com/photos/158063/bellingrath-gardens-alabama-landscape-scenic-158063.jpeg?auto=compress&cs=tinysrgb&w=1200",
        price: "75",
        featured: false
    }
];

async function addAttractions() {
    try {
        console.log('🎉 Adding PlatinumList attractions to Firestore...\n');

        for (const attraction of attractions) {
            const eventData = {
                title: attraction.title,
                description: attraction.description,
                venue: attraction.venue,
                startDate: new Date('2025-12-31T12:00:00').toISOString(), // Generic future date
                minPrice: attraction.price,
                currency: "AED",
                image: attraction.image,
                referralUrl: `https://${attraction.baseUrl}/?ref=${REFERRAL_CODE}`,
                status: "on sale",
                featured: attraction.featured,
                posted: false,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                source: 'platinumlist',
                category: 'attraction'
            };

            const docRef = await db.collection('events').add(eventData);
            console.log(`✅ Added: ${attraction.title}`);
            console.log(`   ID: ${docRef.id}`);
            console.log(`   Link: https://${attraction.baseUrl}/?ref=${REFERRAL_CODE}\n`);
        }

        console.log('\n🎊 SUCCESS! All attractions added to your database!');
        console.log(`\n📊 Total attractions added: ${attractions.length}`);
        console.log('\n🚀 Now run your Make.com scenario to start posting!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

addAttractions();
