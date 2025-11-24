# 📸 MAKE.COM BATCH INSTAGRAM POSTING - COMPLETE GUIDE

## 🎯 Overview

This automation fetches **ALL events happening this week** and posts them to Instagram automatically using Make.com's **Iterator** to loop through each event.

**What This Does:**
- ✅ Fetches all events for the current week (7 days ahead)
- ✅ Loops through EACH event automatically
- ✅ Downloads event image
- ✅ Posts to Instagram with formatted caption
- ✅ Marks event as posted
- ✅ **Posts ALL events in one run** (not just one per day!)

---

## 🔗 NEW API ENDPOINT

### **Endpoint:**
```
GET https://dubai-events-api.vercel.app/api/events/weekly
```

### **Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `days` | number | 7 | Number of days ahead to fetch events |
| `includePosted` | boolean | false | Include already posted events |
| `limit` | number | 100 | Maximum number of events to return |

### **Example Requests:**

**Get events for next 7 days (unposted only):**
```
GET https://dubai-events-api.vercel.app/api/events/weekly
```

**Get events for next 14 days:**
```
GET https://dubai-events-api.vercel.app/api/events/weekly?days=14
```

**Get ALL events (including posted):**
```
GET https://dubai-events-api.vercel.app/api/events/weekly?includePosted=true
```

### **Response Format:**
```json
{
  "success": true,
  "count": 15,
  "dateRange": {
    "start": "2025-11-24T00:00:00.000Z",
    "end": "2025-12-01T00:00:00.000Z",
    "days": 7
  },
  "events": [
    {
      "id": "abc123",
      "title": "Burj Khalifa Tickets",
      "description": "Visit the world's tallest building...",
      "image": "https://images.pexels.com/photos/162031/...",
      "venue": "Downtown Dubai",
      "date": "2025-11-25T12:00:00.000Z",
      "price": "149",
      "currency": "AED",
      "link": "https://burj-khalifa.platinumlist.net/?ref=dubaievents",
      "category": "attraction",
      "featured": true,
      "posted": false,
      "postedAt": null
    },
    ...
  ],
  "message": "Found 15 events happening in the next 7 days"
}
```

---

## 🔧 MAKE.COM SCENARIO SETUP

### **Scenario Structure:**

```
Module 1: Schedule (Trigger)
    ↓
Module 2: HTTP - GET Weekly Events
    ↓
Module 3: Iterator (Loop through events array)
    ↓
Module 4: HTTP - Download Image
    ↓
Module 5: Instagram - Post Photo
    ↓
Module 6: HTTP - Mark as Posted
```

---

## 📋 STEP-BY-STEP CONFIGURATION

### **MODULE 1: Schedule Trigger**

**Module:** Schedule by Zapier or Webhooks

**Configuration:**
- **Frequency:** Once per week (e.g., Monday 9 AM)
- **Or:** Manual trigger when you want to post all events

**Why weekly?** This posts ALL events for the week in one batch!

---

### **MODULE 2: HTTP - GET Weekly Events**

**Module:** HTTP → Make a Request

**Configuration:**
- **URL:** `https://dubai-events-api.vercel.app/api/events/weekly?days=7`
- **Method:** GET
- **Headers:** None needed

**Output:** Array of events in `data.events`

**Test:** Click "Run this module only" - should return events array

---

### **MODULE 3: Iterator** ⭐ **KEY MODULE**

**Module:** Flow Control → Iterator

**Configuration:**
- **Array:** `{{2.data.events}}` (Map from Module 2)

**What this does:** Loops through EACH event and runs Modules 4-6 for each one!

**Example:** If you have 15 events, it will post 15 times automatically!

---

### **MODULE 4: HTTP - Download Image**

**Module:** HTTP → Get a File

**Configuration:**
- **URL:** `{{3.image}}` (From iterator)
- **Method:** GET

**Output:** Binary image file

**Why needed?** Instagram requires the actual image file, not just a URL!

---

### **MODULE 5: Instagram for Business - Post Photo**

**Module:** Instagram for Business → Create a Photo Post

**Configuration:**

**Connection:** Your Instagram Business account

**Photo:** `{{4.data}}` (Binary data from Module 4)

**Caption Template:**
```
🎉 {{3.title}}

📍 {{3.venue}}
💰 From {{3.currency}} {{3.price}}

🎫 Book now: {{3.link}}

#DubaiEvents #Dubai #UAE #VisitDubai #MyDubai #DubaiLife #ThingsToDo #DubaiNightlife #DubaiEntertainment #DubaiAttractions #ExploreDubai
```

**Field Mapping:**
- `{{3.title}}` → Event title
- `{{3.venue}}` → Event location
- `{{3.currency}}` → Currency (AED)
- `{{3.price}}` → Ticket price
- `{{3.link}}` → Affiliate booking link

---

### **MODULE 6: HTTP - Mark as Posted**

**Module:** HTTP → Make a Request

**Configuration:**
- **URL:** `https://dubai-events-api.vercel.app/api/events/{{3.id}}/mark-posted`
- **Method:** POST

**Why?** Prevents re-posting the same event next week!

---

## 🎯 COMPLETE SCENARIO FLOW

```
1. SCHEDULE TRIGGER
   ↓
2. GET WEEKLY EVENTS
   Response: { events: [event1, event2, event3, ...] }
   ↓
3. ITERATOR
   Loop 1: event1
      ↓
   4. DOWNLOAD IMAGE (event1.image)
      ↓
   5. POST TO INSTAGRAM (event1 data)
      ↓
   6. MARK AS POSTED (event1.id)
   
   Loop 2: event2
      ↓
   4. DOWNLOAD IMAGE (event2.image)
      ↓
   5. POST TO INSTAGRAM (event2 data)
      ↓
   6. MARK AS POSTED (event2.id)
   
   ... continues for ALL events!
```

---

## ⚙️ ADVANCED CONFIGURATION

### **Add Delay Between Posts:**

**Module:** Tools → Sleep

**Insert after Module 5 (Instagram Post)**

**Configuration:**
- **Delay:** 300 seconds (5 minutes)

**Why?** Instagram may flag rapid posting as spam. 5-minute gaps look natural!

**Updated Flow:**
```
5. POST TO INSTAGRAM
   ↓
5a. SLEEP (5 minutes)
   ↓
6. MARK AS POSTED
```

---

### **Add Error Handling:**

**Module:** Error Handler

**Attach to Module 5 (Instagram Post)**

**Configuration:**
- **On Error:** Continue to next iteration
- **Log Error:** Yes

**Why?** If one post fails, others still continue!

---

### **Filter Out Already Posted:**

**Module:** Filter (between Module 3 and 4)

**Configuration:**
- **Condition:** `{{3.posted}}` equals `false`

**Why?** Extra safety to never repost!

---

## 📊 POSTING SCHEDULE OPTIONS

### **Option 1: Weekly Batch (Recommended)**
- **Frequency:** Once per week (Monday 9 AM)
- **Posts:** ALL events for the week
- **Result:** 15-20 posts in one session

### **Option 2: Bi-Weekly**
- **Frequency:** Twice per week (Monday & Thursday)
- **Days:** `?days=3` (3 days ahead each time)
- **Result:** Smaller batches, more frequent

### **Option 3: Daily Batch**
- **Frequency:** Daily at 9 AM
- **Days:** `?days=1` (today's events only)
- **Result:** Only events happening today

---

## 🧪 TESTING

### **Test the API:**
```bash
curl "https://dubai-events-api.vercel.app/api/events/weekly?days=7"
```

### **Test in Make.com:**
1. Create scenario with Modules 1-6
2. Click "Run Once"
3. Watch the Iterator loop through events
4. Check Instagram - should see multiple posts!

---

## 📈 EXPECTED RESULTS

**If you have 15 unposted events:**
- ✅ Module 2 fetches 15 events
- ✅ Module 3 creates 15 iterations
- ✅ Module 5 posts 15 times to Instagram
- ✅ Module 6 marks 15 events as posted

**Total time:** ~75 minutes (15 events × 5 min delay)

**Instagram posts:** 15 new posts! 🎉

---

## 🚨 INSTAGRAM LIMITS

**Daily Limits:**
- **Maximum posts:** 25 per day
- **Recommended:** 15-20 per day
- **Minimum gap:** 5 minutes between posts

**If you have 30 events:**
- **Day 1:** Post 20 events
- **Day 2:** Post remaining 10 events

**Solution:** Add filter in Module 3:
```
Limit to first 20 items
```

---

## 💡 PRO TIPS

1. **Test with 1 event first:**
   - Use `?limit=1` in API URL
   - Verify entire flow works
   - Then remove limit

2. **Use Sleep module:**
   - 5 minutes between posts = safe
   - 3 minutes = faster but riskier
   - 10 minutes = very safe

3. **Monitor Make.com History:**
   - Check for failed iterations
   - Review Instagram API errors
   - Adjust delays if needed

4. **Schedule wisely:**
   - Monday 9 AM = week starts fresh
   - Avoid peak hours (12-2 PM)
   - Instagram is most active 6-9 PM

---

## 🔄 MAINTENANCE

### **Weekly:**
- Check Make.com execution history
- Verify all events posted successfully
- Review Instagram insights

### **Monthly:**
- Add new events to database
- Update caption template if needed
- Review posting schedule effectiveness

---

## ✅ CHECKLIST

Before going live:

- [ ] API endpoint tested and returns events
- [ ] Make.com scenario created with all 6 modules
- [ ] Iterator configured to loop through events array
- [ ] Image download module working
- [ ] Instagram connection authorized
- [ ] Caption template formatted correctly
- [ ] Mark-posted endpoint tested
- [ ] Sleep delay added (5 minutes)
- [ ] Error handler attached
- [ ] Test run completed successfully
- [ ] Scenario turned ON

---

## 🎊 YOU'RE READY!

Your automation will now:
- ✅ Fetch ALL weekly events
- ✅ Post EACH ONE to Instagram
- ✅ Space them out naturally
- ✅ Mark as posted automatically
- ✅ Run completely hands-free!

**No more one-post-per-day limit!** 🚀

---

## 📞 SUPPORT

**API Endpoint:**
- Weekly Events: `https://dubai-events-api.vercel.app/api/events/weekly`
- Mark Posted: `https://dubai-events-api.vercel.app/api/events/{id}/mark-posted`

**Need Help?**
- Check Make.com execution logs
- Test API endpoints in browser
- Review Instagram API status

---

**Happy Automating!** 🎉📸✨
