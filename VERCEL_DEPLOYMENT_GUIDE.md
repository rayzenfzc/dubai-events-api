# 🚀 Deploy Dubai Events API to Vercel - Step by Step

## ✅ What We Created

I've set up your API with Vercel serverless functions:

```
/api/events/unposted.js           → GET /api/events/unposted
/api/events/[id]/compress-image.js → POST /api/events/:id/compress-image
/api/events/[id]/caption.js        → GET /api/events/:id/caption
/api/events/[id]/mark-posted.js    → POST /api/events/:id/mark-posted
```

---

## 📋 Step-by-Step Deployment

### **Step 1: Install Vercel CLI**

Open your terminal and run:

```bash
npm install -g vercel
```

### **Step 2: Login to Vercel**

```bash
vercel login
```

Follow the prompts to log in (it will open your browser).

### **Step 3: Deploy to Vercel**

Navigate to your project folder:

```bash
cd "/Users/sabiqahmed/Documents/DEO fstudio to gravity /public"
```

Deploy:

```bash
vercel
```

**Answer the prompts:**
- Set up and deploy? → **Y**
- Which scope? → Choose your account
- Link to existing project? → **N**
- Project name? → **dubai-events-api** (or your choice)
- Directory? → **./** (current directory)
- Override settings? → **N**

Vercel will deploy and give you a URL like:
```
https://dubai-events-api.vercel.app
```

**✅ Save this URL!** You'll use it in Make.com

---

## 🔧 Test Your API

Once deployed, test each endpoint:

### 1. Get Unposted Events
```bash
curl https://your-project-name.vercel.app/api/events/unposted?limit=1
```

### 2. Generate Caption
```bash
curl https://your-project-name.vercel.app/api/events/89469/caption
```

### 3. Compress Image
```bash
curl -X POST https://your-project-name.vercel.app/api/events/89469/compress-image \
  -H "Content-Type: application/json" \
  -d '{"imageUrl":"https://cdn.platinumlist.net/upload/event/caravanserai_desert_dinner_with_transfer_2023_oct_29_2023_oct_30_dubai_89469-full-en1698503375.png"}'
```

### 4. Mark as Posted
```bash
curl -X POST https://your-project-name.vercel.app/api/events/89469/mark-posted
```

---

## 🤖 Make.com Setup

Once your API is deployed, use this URL in Make.com:

### **Module 1: Schedule**
- Every 6 hours

### **Module 2: HTTP GET - Unposted Events**
```
URL: https://your-project-name.vercel.app/api/events/unposted?limit=1
Method: GET
```

### **Module 3: Iterator**
```
Array: {{2.events}}
```

### **Module 4: HTTP POST - Compress Image**
```
URL: https://your-project-name.vercel.app/api/events/{{3.id}}/compress-image
Method: POST
Headers: {"Content-Type": "application/json"}
Body: {"imageUrl": "{{3.image}}"}
```

### **Module 5: HTTP GET - Generate Caption**
```
URL: https://your-project-name.vercel.app/api/events/{{3.id}}/caption
Method: GET
```

### **Module 6: Facebook - Create Photo Post**
```
Photo: data:image/jpeg;base64,{{4.base64}}
Message: {{5.caption}}
Link: {{3.link}}
```

### **Module 7: Instagram - Create Media Object**
```
Image: Use compressed image
Caption: {{5.caption}}
```

### **Module 8: HTTP POST - Mark as Posted**
```
URL: https://your-project-name.vercel.app/api/events/{{3.id}}/mark-posted
Method: POST
```

---

## 🔐 Environment Variables (If Needed)

If you need to add Firebase credentials:

```bash
vercel env add FIREBASE_PROJECT_ID
```

Enter: `studio-1436622267-3c444`

---

## 🐛 Troubleshooting

### **Error: Module not found**
Run in your project folder:
```bash
npm install
```

### **Error: Firebase Admin**
The code initializes Firebase automatically. No additional setup needed.

### **Error: CORS**
All endpoints have CORS enabled. Should work from Make.com.

### **Redeploy After Changes**
```bash
vercel --prod
```

---

## ✅ Checklist

- [ ] Vercel CLI installed
- [ ] Logged into Vercel
- [ ] Deployed successfully
- [ ] Got deployment URL
- [ ] Tested all 4 endpoints
- [ ] URL works in Make.com
- [ ] Facebook connected
- [ ] Instagram connected
- [ ] Test run successful

---

## 🎯 Next Steps

1. Deploy to Vercel (run `vercel`)
2. Copy your deployment URL
3. Set up Make.com scenario
4. Test with one event
5. Schedule for every 6 hours
6. Sit back and watch it automate! 🎉

---

**Need help?** Let me know your Vercel URL and I'll help you test it!
