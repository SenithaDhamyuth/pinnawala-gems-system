# Advertisement Management System - Quick Start Guide

## 🚀 Getting Started (5 Minutes)

### Prerequisites
- Node.js and npm installed
- MongoDB running
- Backend server running on port 5001
- Frontend running on port 5173

---

## Step 1: Start the Backend Server

```bash
cd backend-node
npm install
npm start
```

**Expected Output:**
```
Server running on http://localhost:5001
MongoDB connected
Routes mounted:
  - /api/auth
  - /api/gems
  - /api/ads ← Ad routes ready
  - /api/offers
  ... etc
```

---

## Step 2: Start the Frontend

```bash
cd frontend-web
npm install
npm run dev
```

**Expected Output:**
```
VITE v4.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

---

## Step 3: Create Test Admin Account

1. Open `http://localhost:5173/register`
2. Register with email and password
3. Go to admin panel and verify admin role

**Or use existing admin credentials** (if already set up)

---

## Step 4: Access Admin Dashboard

1. Navigate to `http://localhost:5173` (if logged in as admin)
2. Click "Admin Dashboard" or navigate to `/admin`
3. You should see sidebar with these tabs:
   - Internal Inventory
   - Marketplace Listings
   - Active Listings
   - Appointments
   - Auctions
   - Bidding & Offers
   - **Manage Advertisements** ← NEW
   - Messages
   - Learning Hub
   - Settings

---

## Step 5: Create Your First Ad

### In the Admin Dashboard:

1. **Click** "Manage Advertisements" tab
2. **See** stats cards showing:
   - Total Advertisements: 0
   - Active: 0
   - Inactive: 0

3. **Click** "Create New Advertisement" button

4. **Fill the form:**
   - **Title:** "Premium Ruby Collection"
   - **Destination Link:** "https://example.com/rubies"
   - **Ad Position:** Select "🛍️ Marketplace - Grid (Every 4 items)"
   - **Image:** Upload a JPG/PNG (max 5MB)
   - **Active Status:** Keep toggle enabled (blue)

5. **Click** "Create Advertisement" button

6. **See success message:** ✓ "Advertisement created successfully"

---

## Step 6: Verify Ad in Marketplace

1. **Navigate to** Marketplace or home page
2. **Browse gems** in Community Listings section
3. **After 4 gems**, you should see your ad card with:
   - ✨ Featured badge
   - Your ad image
   - Hover effect (image zooms)
   - "Learn More" button on hover
4. **Click the ad** to verify it opens your destination link

---

## Step 7: Manage Ads

### Edit an Ad
1. Find ad in the table
2. Click the **pencil icon** (Edit)
3. Modify any field
4. Click "Update Advertisement"

### Toggle Status
1. Find ad in the table
2. Click the **status badge** (Active/Inactive)
3. Ad toggles and disappears from marketplace if inactive

### Delete an Ad
1. Find ad in the table
2. Click the **trash icon** (Delete)
3. Confirm deletion
4. Ad is removed

---

## 🧪 Testing Checklist

### Backend Tests

#### Test 1: Create Ad via cURL
```bash
curl -X POST http://localhost:5001/api/ads \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "title=Test Ad" \
  -F "link_url=https://test.com" \
  -F "position=Marketplace_Grid" \
  -F "is_active=true" \
  -F "image=@path/to/image.jpg"
```

**Expected:** Returns ad object with `_id`, `image_url`, etc.

#### Test 2: Fetch Active Ads (Public)
```bash
curl http://localhost:5001/api/ads
```

**Expected:** Returns array of only active ads

#### Test 3: Fetch All Ads (Admin)
```bash
curl http://localhost:5001/api/ads/admin/all \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected:** Returns array of ALL ads (active + inactive)

#### Test 4: Update Ad
```bash
curl -X PUT http://localhost:5001/api/ads/AD_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "title=Updated Title" \
  -F "is_active=false"
```

**Expected:** Returns updated ad with new title and status

#### Test 5: Delete Ad
```bash
curl -X DELETE http://localhost:5001/api/ads/AD_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected:** `{"message": "Ad deleted successfully"}`

---

### Frontend Tests

#### Test 1: Admin Tab Visible
- [ ] Navigate to `/admin`
- [ ] See "Manage Advertisements" in sidebar
- [ ] Click tab and form loads

#### Test 2: Create Ad Form
- [ ] Fill title field
- [ ] Enter link URL
- [ ] Select position
- [ ] Upload image (preview shows)
- [ ] Toggle active status
- [ ] Submit form

#### Test 3: Ad Appears in Table
- [ ] Ad shows in table with thumbnail
- [ ] Image preview is correct size
- [ ] Status badge shows "Active" or "Inactive"
- [ ] Edit and delete icons visible

#### Test 4: Marketplace Integration
- [ ] Go to marketplace
- [ ] Browse gems
- [ ] After 4 gems, see ad card
- [ ] Ad card has Featured badge
- [ ] Hover shows zoom effect
- [ ] Click ad opens link in new tab

#### Test 5: Toggle Active/Inactive
- [ ] Click status badge on active ad
- [ ] Changes to Inactive
- [ ] Refresh marketplace
- [ ] Ad disappears from grid
- [ ] Click badge again
- [ ] Changes back to Active
- [ ] Refresh marketplace
- [ ] Ad reappears

#### Test 6: Edit Ad
- [ ] Click edit icon
- [ ] Form pre-fills with current data
- [ ] Change title
- [ ] Don't upload new image (should keep existing)
- [ ] Submit
- [ ] Table updates with new title
- [ ] Marketplace reflects change

#### Test 7: Delete Ad
- [ ] Click delete icon
- [ ] Confirm in dialog
- [ ] Ad removed from table
- [ ] Ad removed from marketplace
- [ ] Refresh page
- [ ] Ad still gone

---

## 📊 Troubleshooting

### Problem: Ad not appearing in marketplace

**Solutions:**
1. ✅ Is `is_active` set to `true`?
2. ✅ Is `status` set to `'Active'`?
3. ✅ Is `position` set to `'Marketplace_Grid'`?
4. ✅ Are there gems displayed? (ads appear every 4 items)
5. ✅ Check browser console for errors
6. ✅ Check backend logs

```bash
# Check database directly
mongo
> db.ads.find({position: 'Marketplace_Grid', is_active: true})
```

---

### Problem: Image not uploading

**Solutions:**
1. ✅ Is file ≤ 5MB?
2. ✅ Is format JPG/PNG/GIF/WebP?
3. ✅ Check browser console for errors
4. ✅ Check backend logs for Multer errors
5. ✅ Is `/uploads` directory writable?

```bash
# Check uploads directory
ls -la uploads/
# Should see files like: ad_1713610200.jpg
```

---

### Problem: 401 Unauthorized on admin endpoints

**Solutions:**
1. ✅ Is user logged in?
2. ✅ Is user an admin?
3. ✅ Is token in localStorage?
4. ✅ Has token expired?
5. ✅ Check: `localStorage.getItem('role')` === 'admin'

```javascript
// In browser console:
console.log(localStorage.getItem('token'));
console.log(localStorage.getItem('role'));
```

---

### Problem: 403 Forbidden (Admin only error)

**Solution:**
- User must have `role: 'admin'` in JWT token
- Non-admin users cannot create/edit/delete ads

---

### Problem: Ad appears but link doesn't work

**Solutions:**
1. ✅ Check `link_url` in database is correct
2. ✅ Is URL format valid? (http:// or https://)
3. ✅ Is URL reachable? (test in browser)
4. ✅ Browser console → right-click ad → inspect → check href

---

### Problem: Wrong ads appearing in wrong position

**Solutions:**
1. ✅ Check `position` field in database
2. ✅ Verify `injectAdsIntoGrid()` logic in Marketplace.jsx
3. ✅ Clear browser cache (Ctrl+Shift+Delete)
4. ✅ Restart frontend dev server

---

## 🔍 Debugging Commands

### Check Backend Health
```bash
# Check server is running
curl http://localhost:5001/

# Check routes loaded
curl http://localhost:5001/api/ads

# Check database connection
# Look for "MongoDB connected" in server logs
```

### Check Database
```bash
# Connect to MongoDB
mongo

# Show all ads
> db.ads.find()

# Show only active marketplace ads
> db.ads.find({
    position: 'Marketplace_Grid',
    is_active: true,
    status: 'Active'
  })

# Count ads by position
> db.ads.aggregate([
    { $group: { _id: '$position', count: {$sum: 1} } }
  ])
```

### Check Frontend
```javascript
// In browser console

// Check API service is loaded
import { getActiveAds } from './services/api.js'

// Fetch ads
getActiveAds().then(ads => console.log(ads))

// Check auth
console.log(localStorage.getItem('token'))
console.log(localStorage.getItem('role'))

// Check component state
// (if using React DevTools)
```

---

## 📈 Next Steps After Implementation

### Phase 2: Analytics
- Track ad clicks
- Show clickthrough rate (CTR) in admin dashboard
- Display impressions

### Phase 3: Advanced Features
- Schedule ads (start/end dates)
- A/B testing (compare two versions)
- Target ads by gem type/price range
- Ad performance dashboard

### Phase 4: Monetization
- Charge sellers for ad placement
- Premium ad tiers (featured, sidebar)
- Monthly billing integration

---

## 📞 Common Questions

### Q: Can multiple admins manage ads?
**A:** Yes! All admins can create/edit/delete ads. Consider adding audit logging for tracking.

### Q: Can I use external CDN for images?
**A:** Yes! Update `image_url` to point to CDN. Just paste CDN URL in image field (don't upload).

### Q: How do I backup ads?
**A:** Export from MongoDB:
```bash
mongoexport --db pinnawala --collection ads --out ads_backup.json
```

### Q: Can customers create ads?
**A:** Currently, no. Only admins. Could be extended for sellers with premium plans.

### Q: How many ads should I create?
**A:** Start with 3-5 ads in different positions. Test before scaling.

### Q: Do ads affect performance?
**A:** Minimal impact. Ad injection is O(n) on frontend. Database queries are indexed.

---

## ✅ Final Checklist

Before going live:

- [ ] Backend server running
- [ ] Frontend running
- [ ] Admin account created
- [ ] First ad created successfully
- [ ] Ad appears in marketplace
- [ ] Ad link works
- [ ] Edit functionality working
- [ ] Delete functionality working
- [ ] Toggle active/inactive works
- [ ] Multiple ads display correctly
- [ ] Marketplace still loads all gems properly
- [ ] No console errors
- [ ] No backend errors
- [ ] Mobile responsive (tested on mobile)
- [ ] Image upload works for different formats

---

## 🎉 You're Ready!

The Advertisement Management System is now live. Start creating ads and watch them appear in your marketplace!

**Questions?** Check the detailed docs:
- `ADVERTISEMENT_SYSTEM_COMPLETE.md` - Full implementation
- `AD_API_ENDPOINTS_REFERENCE.md` - API details
- `ADVERTISEMENT_IMPLEMENTATION_GUIDE.md` - Architecture & workflows

---

**Happy Advertising!** 🚀

Last Updated: April 20, 2026
