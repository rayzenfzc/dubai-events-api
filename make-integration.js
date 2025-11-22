// API endpoint for Make.com to fetch unposted events
import admin from 'firebase-admin';
import fetch from 'node-fetch';
import sharp from 'sharp';
import { writeFileSync, unlinkSync } from 'fs';

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        projectId: 'studio-1436622267-3c444'
    });
}

const db = admin.firestore();

/**
 * Get unposted events for social media
 * Returns events that haven't been posted yet
 */
export async function getUnpostedEvents(limit = 5) {
    try {
        const eventsSnapshot = await db.collection('events')
            .where('posted', '==', false)
            .where('status', '==', 'on sale')
            .orderBy('featured', 'desc')
            .limit(limit)
            .get();

        const events = [];
        eventsSnapshot.forEach(doc => {
            const data = doc.data();
            events.push({
                id: doc.id,
                title: data.title,
                description: data.description,
                image: data.image,
                price: data.minPrice,
                currency: data.currency,
                link: data.referralUrl,
                venue: data.venue,
                date: data.startDate
            });
        });

        return events;
    } catch (error) {
        console.error('Error fetching unposted events:', error);
        throw error;
    }
}

/**
 * Compress image to under 8MB for Instagram/Facebook
 */
export async function compressImage(imageUrl, maxSizeBytes = 8 * 1024 * 1024) {
    try {
        console.log(`📥 Downloading image: ${imageUrl}`);

        // Download image
        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error(`Failed to download image: ${response.statusText}`);
        }

        const buffer = await response.buffer();
        const originalSize = buffer.length;

        console.log(`📊 Original size: ${(originalSize / 1024 / 1024).toFixed(2)}MB`);

        // If already under 8MB, return as is
        if (originalSize < maxSizeBytes) {
            console.log('✅ Image already under 8MB');
            return buffer;
        }

        // Compress image
        console.log('🔄 Compressing image...');

        let quality = 90;
        let compressed = buffer;

        while (compressed.length >= maxSizeBytes && quality > 20) {
            compressed = await sharp(buffer)
                .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
                .jpeg({ quality, progressive: true })
                .toBuffer();

            console.log(`   Quality ${quality}: ${(compressed.length / 1024 / 1024).toFixed(2)}MB`);
            quality -= 10;
        }

        console.log(`✅ Compressed to: ${(compressed.length / 1024 / 1024).toFixed(2)}MB`);

        return compressed;
    } catch (error) {
        console.error('Error compressing image:', error);
        throw error;
    }
}

/**
 * Mark event as posted
 */
export async function markEventAsPosted(eventId) {
    try {
        await db.collection('events').doc(eventId).update({
            posted: true,
            postedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log(`✅ Marked event ${eventId} as posted`);
        return true;
    } catch (error) {
        console.error('Error marking event as posted:', error);
        throw error;
    }
}

/**
 * Generate Instagram caption
 */
export function generateCaption(event) {
    let caption = `🎉 ${event.title}\n\n`;

    if (event.venue) {
        caption += `📍 ${event.venue}\n`;
    }

    if (event.date) {
        const date = new Date(event.date);
        caption += `📅 ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}\n`;
    }

    if (event.price && event.price > 0) {
        caption += `💰 From ${event.price} ${event.currency}\n`;
    }

    caption += `\n🎫 Get your tickets now!\n`;
    caption += `🔗 ${event.link}\n\n`;
    caption += `#DubaiEvents #Dubai #UAE #ThingsToDo #DubaiLife #VisitDubai #MyDubai #DubaiNightlife #DubaiEntertainment`;

    return caption;
}

// Export for use in API routes
export default {
    getUnpostedEvents,
    compressImage,
    markEventAsPosted,
    generateCaption
};
