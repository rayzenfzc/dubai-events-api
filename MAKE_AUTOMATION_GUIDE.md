# Make.com Automation Workflow for Dubai Events

## Overview
This workflow automatically posts events to Facebook and Instagram with image compression to handle the 8MB file size limit.

## Prerequisites
1. ✅ Firebase Firestore with events collection
2. ✅ API server running (api-server.js)
3. ✅ Make.com account
4. ✅ Facebook Page access token
5. ✅ Instagram Business account connected to Facebook

## Make.com Workflow Steps

### Step 1: Schedule Trigger
- **Module**: Schedule
- **Settings**: Run every 6 hours (or as desired)
- **Purpose**: Automatically check for new events to post

### Step 2: HTTP Request - Get Unposted Events
- **Module**: HTTP > Make a Request
- **Method**: GET
- **URL**: `http://your-server.com/api/events/unposted?limit=1`
- **Headers**: None required
- **Purpose**: Fetch one unposted event

### Step 3: Iterator
- **Module**: Flow Control > Iterator
- **Array**: `{{2.events}}`
- **Purpose**: Loop through each event (usually just 1)

### Step 4: HTTP Request - Compress Image
- **Module**: HTTP > Make a Request
- **Method**: POST
- **URL**: `http://your-server.com/api/events/{{3.id}}/compress-image`
- **Headers**: 
  ```json
  {
    "Content-Type": "application/json"
  }
  ```
- **Body**:
  ```json
  {
    "imageUrl": "{{3.image}}"
  }
  ```
- **Purpose**: Download and compress image to under 8MB

### Step 5: HTTP Request - Generate Caption
- **Module**: HTTP > Make a Request
- **Method**: GET
- **URL**: `http://your-server.com/api/events/{{3.id}}/caption`
- **Purpose**: Generate Instagram-optimized caption with hashtags

### Step 6: Facebook - Create a Photo Post
- **Module**: Facebook > Create a Photo Post
- **Connection**: Your Facebook Page
- **Photo**: Use base64 from Step 4: `data:image/jpeg;base64,{{4.base64}}`
- **Message**: `{{5.caption}}`
- **Link**: `{{3.link}}`
- **Purpose**: Post to Facebook Page

### Step 7: Instagram - Create a Photo Post
- **Module**: Instagram > Create a Media Object
- **Connection**: Your Instagram Business Account
- **Image URL**: Use compressed image or upload base64
- **Caption**: `{{5.caption}}`
- **Purpose**: Post to Instagram

### Step 8: HTTP Request - Mark as Posted
- **Module**: HTTP > Make a Request
- **Method**: POST
- **URL**: `http://your-server.com/api/events/{{3.id}}/mark-posted`
- **Purpose**: Mark event as posted to avoid duplicates

## Image Compression Rules

### Problem
- Instagram/Facebook API has 8MB file size limit
- PlatinumList images can be larger than 8MB

### Solution
The `/api/events/:id/compress-image` endpoint:
1. Downloads the original image
2. Checks file size
3. If > 8MB:
   - Resizes to max 1920x1080
   - Compresses JPEG quality progressively (90% → 80% → 70%...)
   - Stops when under 8MB
4. Returns base64-encoded compressed image

### Usage in Make.com
```
POST /api/events/:id/compress-image
Body: { "imageUrl": "https://cdn.platinumlist.net/..." }

Response:
{
  "success": true,
  "compressedSize": 7340032,
  "compressedSizeMB": "7.00",
  "base64": "iVBORw0KGgoAAAANSUhEUgAA..."
}
```

## Error Handling

### If Image Compression Fails
- **Fallback**: Use a default Dubai Events image
- **Log**: Record error in Firestore
- **Notify**: Send email/Slack notification

### If Posting Fails
- **Retry**: Make.com auto-retry 3 times
- **Skip**: Move to next event
- **Don't Mark**: Event stays unposted for next run

## Testing the Workflow

### 1. Test API Endpoints
```bash
# Get unposted events
curl http://localhost:3000/api/events/unposted

# Compress an image
curl -X POST http://localhost:3000/api/events/89469/compress-image \
  -H "Content-Type: application/json" \
  -d '{"imageUrl":"https://cdn.platinumlist.net/upload/event/..."}'

# Generate caption
curl http://localhost:3000/api/events/89469/caption

# Mark as posted
curl -X POST http://localhost:3000/api/events/89469/mark-posted
```

### 2. Test Make.com Workflow
1. Create a test scenario
2. Run once manually
3. Check Facebook and Instagram
4. Verify event is marked as posted in Firestore

## Deployment

### Option 1: Local Server (Development)
```bash
npm install express cors sharp
node api-server.js
```

### Option 2: Cloud Deployment (Production)
- **Vercel**: Deploy as serverless functions
- **Google Cloud Run**: Deploy as container
- **Heroku**: Deploy as web app

### Environment Variables
```env
PORT=3000
FIREBASE_PROJECT_ID=studio-1436622267-3c444
```

## Monitoring

### Check Logs
- Make.com execution history
- API server logs
- Firestore `events` collection (check `posted` field)

### Metrics to Track
- Events posted per day
- Image compression success rate
- Average compressed file size
- Posting failures

## Troubleshooting

### Issue: Image still too large
**Solution**: Reduce quality further or resize to smaller dimensions

### Issue: Caption too long (Instagram 2200 char limit)
**Solution**: Truncate description in `generateCaption()` function

### Issue: Event not marked as posted
**Solution**: Check Firestore rules allow write access

### Issue: Make.com can't reach API
**Solution**: 
- Use ngrok for local testing: `ngrok http 3000`
- Or deploy to cloud with public URL

## Next Steps

1. ✅ Install dependencies: `npm install express cors sharp`
2. ✅ Start API server: `node api-server.js`
3. ✅ Test endpoints locally
4. ✅ Create Make.com scenario
5. ✅ Connect Facebook and Instagram
6. ✅ Test end-to-end workflow
7. ✅ Deploy to production
8. ✅ Schedule automation

## Support

For issues or questions:
- Check Make.com execution logs
- Review API server console output
- Verify Firestore data structure
