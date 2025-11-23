# 🚀 ZAPIER INSTAGRAM AUTOMATION - COMPLETE SETUP GUIDE

## 📋 Overview

This guide will help you set up **fully automated Instagram posting** using Zapier to fetch events from your Dubai Events API and post them to Instagram.

**What This Does:**
- ✅ Runs automatically every 4 hours (or your chosen schedule)
- ✅ Fetches unposted events from your Vercel API
- ✅ Posts to Instagram with image, caption, and hashtags
- ✅ Marks events as posted to prevent duplicates
- ✅ 100% automated - no manual work!

---

## 🎯 ZAP STRUCTURE

```
TRIGGER: Schedule by Zapier (Every 4 hours)
    ↓
ACTION 1: Webhooks - GET (Fetch unposted event)
    ↓
ACTION 2: Filter (Only continue if event exists)
    ↓
ACTION 3: Instagram for Business - Publish Photo
    ↓
ACTION 4: Webhooks - POST (Mark event as posted)
```

---

## 📝 STEP-BY-STEP SETUP

### **STEP 1: Create New Zap**

1. Go to **https://zapier.com**
2. Click **"Create Zap"** (top left)
3. **Name your Zap:** "Dubai Events → Instagram Auto-Post"

---

### **STEP 2: Set Up Trigger (Schedule)**

1. **Click on "Trigger"**
2. **Search for:** `Schedule by Zapier`
3. **Select:** "Every Hour"
4. **Click "Continue"**

**Configure Schedule:**
- **Frequency:** Every 4 hours
- **Or choose:** 9 AM, 1 PM, 6 PM, 9 PM (4 times daily)

5. **Click "Continue"**
6. **Click "Test trigger"** ✅
7. **Click "Continue"**

---

### **STEP 3: Fetch Unposted Event (Webhooks GET)**

1. **Click the "+" button** to add an action
2. **Search for:** `Webhooks by Zapier`
3. **Select:** "GET"
4. **Click "Continue"**

**Configure Webhook:**

**URL:**
```
https://dubai-events-api.vercel.app/api/events/unposted?limit=1
```

**Method:** GET

**Leave other fields empty** (no headers or query strings needed)

5. **Click "Continue"**
6. **Click "Test action"** 

**You should see response like:**
```json
{
  "success": true,
  "count": 1,
  "events": [
    {
      "id": "abc123",
      "title": "Burj Khalifa Tickets",
      "image": "https://images.pexels.com/...",
      "price": "149",
      "currency": "AED",
      "link": "https://burj-khalifa.platinumlist.net/?ref=dubaievents",
      "venue": "Downtown Dubai",
      ...
    }
  ]
}
```

7. **Click "Continue"** ✅

---

### **STEP 4: Add Filter (Only Continue if Event Exists)**

1. **Click the "+" button**
2. **Search for:** `Filter by Zapier`
3. **Click "Continue"**

**Configure Filter:**

**Condition:**
- **Field:** `2. Data Count` (or `count` from Step 2)
- **Operator:** `(Number) Greater than`
- **Value:** `0`

**This ensures:** Zap only continues if there's an event to post!

4. **Click "Continue"**
5. **Click "Test action"** ✅

---

### **STEP 5: Post to Instagram**

1. **Click the "+" button**
2. **Search for:** `Instagram for Business`
3. **Select:** "Publish Photo(s)"
4. **Click "Continue"**

**Connect Instagram Account:**
- Click "Sign in to Instagram for Business"
- **Log in with Facebook** (the account connected to your Instagram Business)
- **Select your Instagram account:** "Dubai Events Online"
- **Grant all permissions**
- Click "Continue"

**Configure Instagram Post:**

**Instagram Account:**
- Select: `Dubai Events Online`

**Image URL:**
```
2. Data Events 0 Image
```
*(Click in the field and select from the dropdown: Step 2 → Data → Events → 0 → Image)*

**Caption:**
```
🎉 2. Data Events 0 Title

📍 2. Data Events 0 Venue
💰 From 2. Data Events 0 Currency 2. Data Events 0 Price

🎫 Get tickets: 2. Data Events 0 Link

#DubaiEvents #Dubai #UAE #VisitDubai #MyDubai #DubaiLife #ThingsToDo #DubaiNightlife #DubaiEntertainment
```

**IMPORTANT:** Use the **data picker** (click in field) to select each field from Step 2!

**The actual mapping will look like:**
- Title: `{{2__data__events__0__title}}`
- Venue: `{{2__data__events__0__venue}}`
- Currency: `{{2__data__events__0__currency}}`
- Price: `{{2__data__events__0__price}}`
- Link: `{{2__data__events__0__link}}`
- Image: `{{2__data__events__0__image}}`

6. **Click "Continue"**
7. **Click "Test action"** 

**CHECK YOUR INSTAGRAM!** You should see a test post! 📸

8. **Click "Continue"** ✅

---

### **STEP 6: Mark Event as Posted**

1. **Click the "+" button**
2. **Search for:** `Webhooks by Zapier`
3. **Select:** "POST"
4. **Click "Continue"**

**Configure Webhook:**

**URL:**
```
https://dubai-events-api.vercel.app/api/events/2. Data Events 0 Id/mark-posted
```

**IMPORTANT:** Use the data picker to select the ID!

**The actual URL will be:**
```
https://dubai-events-api.vercel.app/api/events/{{2__data__events__0__id}}/mark-posted
```

**Method:** POST

**Leave other fields empty**

5. **Click "Continue"**
6. **Click "Test action"** 

**You should see:**
```json
{
  "success": true,
  "message": "Event marked as posted"
}
```

7. **Click "Continue"** ✅

---

## ✅ FINAL STEPS

### **Turn On Your Zap:**

1. **Click "Publish"** (top right)
2. **Toggle the switch to ON** 🟢
3. **Your Zap is now LIVE!**

---

## 📊 WHAT HAPPENS NOW

**Every 4 hours, your Zap will:**

1. ⏰ **Trigger** (based on your schedule)
2. 🌐 **Fetch** the next unposted event from your API
3. ✅ **Check** if an event exists (filter)
4. 📸 **Post** to Instagram with image and caption
5. ✔️ **Mark** the event as posted in your database

**Completely automated!** 🎉

---

## 🧪 TESTING YOUR ZAP

### **Manual Test:**

1. Go to your Zap
2. Click **"Test"** (top right)
3. Watch each step execute
4. Check Instagram for the post
5. Verify event is marked as posted in database

### **Check API:**

Visit: `https://dubai-events-api.vercel.app/api/events/unposted?limit=10`

- Before Zap runs: Should show unposted events
- After Zap runs: Count should decrease by 1

---

## 📅 POSTING SCHEDULE OPTIONS

### **Option 1: Every 4 Hours (6 posts/day)**
- 12 AM, 4 AM, 8 AM, 12 PM, 4 PM, 8 PM

### **Option 2: Prime Time (4 posts/day)** ⭐ RECOMMENDED
- 9 AM (morning scrollers)
- 1 PM (lunch break)
- 6 PM (after work)
- 9 PM (evening scrollers)

### **Option 3: Business Hours (3 posts/day)**
- 10 AM, 2 PM, 7 PM

**To set specific times:**
1. In Schedule trigger, choose "Custom"
2. Add each time individually
3. Set timezone: Asia/Dubai

---

## 🚨 TROUBLESHOOTING

### **Error: "Media ID Not Available"**

**Cause:** Instagram can't access the image URL

**Fix:**
1. Check image URL is publicly accessible
2. Ensure URL ends with .jpg, .png, or .gif
3. Test URL in private browser window
4. Pexels images work best!

### **Error: "No Data"**

**Cause:** No unposted events in database

**Fix:**
1. Add more events: `curl -X POST https://dubai-events-api.vercel.app/api/add-attractions`
2. Check API: `https://dubai-events-api.vercel.app/api/events/unposted?limit=1`

### **Error: "Filter Stopped Zap"**

**Cause:** Count is 0 (no events)

**Fix:** This is normal! Add more events to database.

---

## 💰 ZAPIER PRICING

**Free Plan:**
- 100 tasks/month
- Perfect for: 3-4 posts/day = ~100 tasks/month ✅

**Starter Plan ($19.99/month):**
- 750 tasks/month
- For: More frequent posting or multiple Zaps

**Each Zap run = 4 tasks:**
1. Schedule trigger
2. GET request
3. Instagram post
4. POST request (mark posted)

**So 100 tasks = 25 Instagram posts/month** (enough for daily posting!)

---

## 🎯 OPTIMIZATION TIPS

### **Better Captions:**

Add emojis and formatting:
```
🎉 {{title}}

📍 Location: {{venue}}
📅 Date: {{date}}
💰 Price: From {{currency}} {{price}}

✨ Don't miss out on this amazing experience!

🎫 Book now: {{link}}

#DubaiEvents #Dubai #UAE #VisitDubai #MyDubai
#DubaiLife #ThingsToDo #DubaiNightlife
```

### **Add Variety:**

Create multiple Zaps with different:
- Posting times
- Caption styles
- Hashtag sets

### **Monitor Performance:**

1. Check Zapier History (see all runs)
2. Monitor Instagram insights
3. Track which events get most engagement

---

## ✅ SUCCESS CHECKLIST

- [ ] Zap created and named
- [ ] Schedule trigger configured (4 times daily)
- [ ] Webhooks GET fetches events correctly
- [ ] Filter checks for event existence
- [ ] Instagram account connected
- [ ] Image URL mapped correctly
- [ ] Caption includes all event details
- [ ] Mark-posted webhook configured
- [ ] Test run successful
- [ ] Zap turned ON
- [ ] First automated post appeared on Instagram!

---

## 🎊 YOU'RE DONE!

Your Dubai Events Instagram automation is now **LIVE and RUNNING!**

**What you've achieved:**
- ✅ Fully automated Instagram posting
- ✅ 4 professional posts per day
- ✅ 24 events = 6 days of content
- ✅ All with affiliate links
- ✅ Zero manual work!

**Your automation will:**
- Post Dubai events automatically
- Include beautiful images
- Add engaging captions
- Share affiliate links
- Build your audience
- Generate potential revenue

**All while you sleep!** 😴💰

---

## 📞 SUPPORT

**API Endpoints:**
- Fetch events: `https://dubai-events-api.vercel.app/api/events/unposted?limit=1`
- Mark posted: `https://dubai-events-api.vercel.app/api/events/{id}/mark-posted`
- Add events: `https://dubai-events-api.vercel.app/api/add-attractions`
- Test dashboard: `https://dubai-events-api.vercel.app/api-test.html`

**Need Help?**
- Zapier Support: help.zapier.com
- Instagram API: developers.facebook.com/docs/instagram-api

---

**🎉 CONGRATULATIONS! You're now a Dubai Events automation expert!** 🚀
