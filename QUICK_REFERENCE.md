# 🎯 Quick Reference - Dubai Events API

## API Endpoints (Copy & Paste)

### 1️⃣ Get Next Unposted Event
```
https://dubai-events-api.vercel.app/api/events/unposted?limit=1
```
- Method: **GET**
- Use in: Make Step #2

---

### 2️⃣ Generate Caption
```
https://dubai-events-api.vercel.app/api/events/EVENT_ID_HERE/caption
```
- Method: **GET**
- Replace `EVENT_ID_HERE` with the actual event ID
- Use in: Make Step #5

---

### 3️⃣ Mark as Posted
```
https://dubai-events-api.vercel.app/api/events/EVENT_ID_HERE/mark-posted
```
- Method: **POST**
- Replace `EVENT_ID_HERE` with the actual event ID
- Use in: Make Step #8 (LAST STEP - Very Important!)

---

## Make.com Data Mapping

When you get an event from Step #2, use these mappings:

| Field | Make.com Variable |
|-------|-------------------|
| Event ID | `{{2.events[1].id}}` |
| Title | `{{2.events[1].title}}` |
| Description | `{{2.events[1].description}}` |
| Image | `{{2.events[1].image}}` |
| Price | `{{2.events[1].price}}` |
| Currency | `{{2.events[1].currency}}` |
| Affiliate Link | `{{2.events[1].link}}` |
| Venue | `{{2.events[1].venue}}` |
| Date | `{{2.events[1].date}}` |

---

## ⚠️ IMPORTANT: Always Mark as Posted!

After posting to Instagram, **ALWAYS** call the "Mark as Posted" endpoint.
Otherwise, the same event will be posted again tomorrow!

---

## 🔍 Check Logs

**Vercel Logs:** https://vercel.com/ → dubai-events-api → Logs
**Make.com History:** Your Scenario → History tab

---

## ✅ Success Checklist

- [ ] Step 2: Fetched unposted event
- [ ] Step 3: Filtered to ensure event exists
- [ ] Step 6: Downloaded event image
- [ ] Step 7: Posted to Instagram
- [ ] Step 8: Marked event as posted ⭐ **CRITICAL**

---

## 🆘 Emergency Contacts

- **API Status:** https://dubai-events-api.vercel.app/
- **Vercel Dashboard:** https://vercel.com/
- **Make.com Dashboard:** https://www.make.com/

---

**Last Updated:** November 23, 2025
