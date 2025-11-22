# 🚀 Make.com Automation Setup Guide for Dubai Events

## ✅ Your API is READY!

Your Dubai Events API is now fully functional and optimized for Make.com automation. All errors have been fixed!

**API Base URL:** `https://dubai-events-api.vercel.app`

---

## 📋 Available API Endpoints

### 1. Get Unposted Events
**URL:** `https://dubai-events-api.vercel.app/api/events/unposted?limit=1`
- **Method:** GET
- **Purpose:** Fetch events that haven't been posted to Instagram yet
- **Query Parameters:**
  - `limit` (optional): Number of events to fetch (default: 5)

**Response Format:**
```json
{
  "success": true,
  "count": 1,
  "message": "Found 1 unposted events",
  "events": [
    {
      "id": "event123",
      "title": "Dubai Jazz Festival 2025",
      "description": "Amazing music festival...",
      "image": "https://...",
      "price": "150",
      "currency": "AED",
      "link": "https://affiliate-link...",
      "venue": "Dubai Media City",
      "date": "2025-12-15T19:00:00",
      "featured": true
    }
  ]
}
```

### 2. Mark Event as Posted
**URL:** `https://dubai-events-api.vercel.app/api/events/{EVENT_ID}/mark-posted`
- **Method:** POST
- **Purpose:** Mark an event as posted after sharing on Instagram
- **Replace:** `{EVENT_ID}` with the actual event ID

**Response Format:**
```json
{
  "success": true,
  "eventId": "event123",
  "eventTitle": "Dubai Jazz Festival 2025",
  "message": "Event marked as posted"
}
```

### 3. Generate Caption (AI-Powered)
**URL:** `https://dubai-events-api.vercel.app/api/events/{EVENT_ID}/caption`
- **Method:** GET
- **Purpose:** Generate an Instagram-ready caption with hashtags
- **Replace:** `{EVENT_ID}` with the actual event ID

---

## 🔧 Make.com Automation Workflow

### Step-by-Step Setup:

#### **Module 1: Schedule the Automation**
1. Add a **Schedule** trigger module
2. Set to run: Daily at your preferred time (e.g., 9:00 AM GST)
3. Interval: Once per day

---

#### **Module 2: Get Unposted Event**
1. Add **HTTP** module → **Make a Request**
2. Configure:
   - **URL:** `https://dubai-events-api.vercel.app/api/events/unposted?limit=1`
   - **Method:** GET
   - **Parse response:** Yes
   - **Timeout:** 30 seconds

3. **Output:** This will give you one unposted event

---

#### **Module 3: Check if Event Exists (Router/Filter)**
1. Add a **Router** after the HTTP module
2. Add a **Filter** with condition:
   - `{{2.events}}` (length) **Greater than** `0`
   
This ensures we only continue if there's an event to post.

---

#### **Module 4: Get the Event Data**
1. Add a **Set Variable** module or use the data directly
2. Map the following fields:
   - Event ID: `{{2.events[1].id}}`
   - Title: `{{2.events[1].title}}`
   - Description: `{{2.events[1].description}}`
   - Image URL: `{{2.events[1].image}}`
   - Price: `{{2.events[1].price}}`
   - Currency: `{{2.events[1].currency}}`
   - Affiliate Link: `{{2.events[1].link}}`
   - Venue: `{{2.events[1].venue}}`
   - Date: `{{2.events[1].date}}`

---

#### **Module 5: Generate Caption (Optional - AI-Powered)**
1. Add **HTTP** module → **Make a Request**
2. Configure:
   - **URL:** `https://dubai-events-api.vercel.app/api/events/{{EVENT_ID}}/caption`
   - **Method:** GET
   - Replace `{{EVENT_ID}}` with `{{2.events[1].id}}`

3. **OR** create your own caption using:
   ```
   🎉 {{2.events[1].title}}

   📍 {{2.events[1].venue}}
   📅 {{formatDate(2.events[1].date; "DD MMM YYYY")}}
   💰 From {{2.events[1].currency}} {{2.events[1].price}}

   🔗 Get tickets: {{2.events[1].link}}

   #DubaiEvents #VisitDubai #EventsDubai #ThingsToDo #UAE
   ```

---

#### **Module 6: Download Event Image**
1. Add **HTTP** module → **Get a File**
2. Configure:
   - **URL:** `{{2.events[1].image}}`

This downloads the event image to use in your Instagram post.

---

#### **Module 7: Post to Instagram**
1. Add **Instagram for Business** module → **Create a Photo Post**
2. Configure:
   - **Image:** Map the downloaded file from Module 6
   - **Caption:** Map the generated caption from Module 5
   - **Instagram Account:** Select your business account

---

#### **Module 8: Mark Event as Posted**
1. Add **HTTP** module → **Make a Request**
2. Configure:
   - **URL:** `https://dubai-events-api.vercel.app/api/events/{{2.events[1].id}}/mark-posted`
   - **Method:** POST
   - **Parse response:** Yes

**IMPORTANT:** This marks the event as posted so it won't be fetched again!

---

#### **Module 9: Error Handling (Optional but Recommended)**
1. Add an **Error Handler** route
2. Add a **Gmail** or **Email** module to notify you if something fails
3. Send yourself the error details

---

## 🎯 How Smart Sorting Works

Your API now automatically sorts events by:
1. **Featured events first** - Events marked as "featured" will be prioritized
2. **Upcoming events** - Events are sorted by date (soonest first)

This means your automation will always post the most relevant and timely events!

---

## 📊 Monitoring Your Automation

### View Logs in Vercel:
1. Go to [Vercel Dashboard](https://vercel.com/)
2. Select your `dubai-events-api` project
3. Click on **Logs** tab
4. You'll see detailed logs like:
   - `[UNPOSTED API] Fetching up to 1 unposted events...`
   - `[UNPOSTED API] Found 3 unposted events`
   - `[UNPOSTED API] Returning 1 events`
   - `[MARK-POSTED API] ✅ Successfully marked event event123 as posted`

### View Make.com Execution History:
1. Go to your Make.com scenario
2. Click **History** tab
3. Review each execution to see which events were posted

---

## 🛠 Troubleshooting

### "No unposted events found"
- Check your Firestore database
- Make sure you have events where `posted = false` and `status = "on sale"`

### Instagram posting fails
- Verify your Instagram Business account is connected to Make.com
- Check that the image URL is accessible
- Ensure caption length is within Instagram limits (2,200 characters)

### API returns 500 error
- Check Vercel logs for detailed error messages
- Verify Firebase environment variables are set correctly in Vercel

---

## 📈 Next Steps

1. **Test your workflow** - Run it manually in Make.com first
2. **Set your schedule** - Configure it to run daily or multiple times per day
3. **Monitor results** - Check both Vercel and Make.com logs
4. **Add more events** - Keep your Firestore database updated with new Dubai events!

---

## 🎉 You're All Set!

Your Dubai Events affiliate automation is now ready to run on autopilot! Every day, Make.com will:
- ✅ Fetch the next unposted event
- ✅ Download the event image
- ✅ Generate an engaging caption
- ✅ Post to Instagram
- ✅ Mark the event as posted
- ✅ Include your affiliate link for commissions

**Questions?** Check the Vercel logs for detailed debugging information!
