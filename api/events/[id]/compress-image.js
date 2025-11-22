// API endpoint: POST /api/events/[id]/compress-image
import fetch from 'node-fetch';
import sharp from 'sharp';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { id } = req.query;
        const { imageUrl } = req.body;

        if (!imageUrl) {
            return res.status(400).json({
                success: false,
                error: 'imageUrl is required'
            });
        }

        console.log(`Downloading image: ${imageUrl}`);

        // Download image
        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error(`Failed to download image: ${response.statusText}`);
        }

        const buffer = await response.buffer();
        const originalSize = buffer.length;

        console.log(`Original size: ${(originalSize / 1024 / 1024).toFixed(2)}MB`);

        // If already under 8MB, return as is
        const maxSizeBytes = 8 * 1024 * 1024;
        if (originalSize < maxSizeBytes) {
            console.log('Image already under 8MB');
            return res.status(200).json({
                success: true,
                eventId: id,
                originalUrl: imageUrl,
                compressedSize: originalSize,
                compressedSizeMB: (originalSize / 1024 / 1024).toFixed(2),
                base64: buffer.toString('base64')
            });
        }

        // Compress image
        console.log('Compressing image...');

        let quality = 90;
        let compressed = buffer;

        while (compressed.length >= maxSizeBytes && quality > 20) {
            compressed = await sharp(buffer)
                .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
                .jpeg({ quality, progressive: true })
                .toBuffer();

            console.log(`Quality ${quality}: ${(compressed.length / 1024 / 1024).toFixed(2)}MB`);
            quality -= 10;
        }

        console.log(`Compressed to: ${(compressed.length / 1024 / 1024).toFixed(2)}MB`);

        return res.status(200).json({
            success: true,
            eventId: id,
            originalUrl: imageUrl,
            compressedSize: compressed.length,
            compressedSizeMB: (compressed.length / 1024 / 1024).toFixed(2),
            base64: compressed.toString('base64')
        });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
