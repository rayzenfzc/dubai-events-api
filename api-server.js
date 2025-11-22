// Simple API server for Make.com integration
import express from 'express';
import cors from 'cors';
import { getUnpostedEvents, compressImage, markEventAsPosted, generateCaption } from './make-integration.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Dubai Events Make.com API',
        endpoints: {
            'GET /api/events/unposted': 'Get unposted events',
            'POST /api/events/:id/compress-image': 'Compress event image',
            'POST /api/events/:id/mark-posted': 'Mark event as posted',
            'GET /api/events/:id/caption': 'Generate Instagram caption'
        }
    });
});

// Get unposted events
app.get('/api/events/unposted', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const events = await getUnposted Events(limit);

        res.json({
            success: true,
            count: events.length,
            events: events
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Compress event image
app.post('/api/events/:id/compress-image', async (req, res) => {
    try {
        const { id } = req.params;
        const { imageUrl } = req.body;

        if (!imageUrl) {
            return res.status(400).json({
                success: false,
                error: 'imageUrl is required'
            });
        }

        const compressedBuffer = await compressImage(imageUrl);

        // Return as base64 for Make.com to use
        const base64Image = compressedBuffer.toString('base64');

        res.json({
            success: true,
            eventId: id,
            originalUrl: imageUrl,
            compressedSize: compressedBuffer.length,
            compressedSizeMB: (compressedBuffer.length / 1024 / 1024).toFixed(2),
            base64: base64Image
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Mark event as posted
app.post('/api/events/:id/mark-posted', async (req, res) => {
    try {
        const { id } = req.params;
        await markEventAsPosted(id);

        res.json({
            success: true,
            eventId: id,
            message: 'Event marked as posted'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Generate Instagram caption
app.get('/api/events/:id/caption', async (req, res) => {
    try {
        const { id } = req.params;

        // Get event data
        const events = await getUnpostedEvents(100);
        const event = events.find(e => e.id === id);

        if (!event) {
            return res.status(404).json({
                success: false,
                error: 'Event not found'
            });
        }

        const caption = generateCaption(event);

        res.json({
            success: true,
            eventId: id,
            caption: caption
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 Make.com API Server running on port ${PORT}`);
    console.log(`📡 API Endpoints:`);
    console.log(`   GET  http://localhost:${PORT}/api/events/unposted`);
    console.log(`   POST http://localhost:${PORT}/api/events/:id/compress-image`);
    console.log(`   POST http://localhost:${PORT}/api/events/:id/mark-posted`);
    console.log(`   GET  http://localhost:${PORT}/api/events/:id/caption\n`);
});

export default app;
