# 🚀 ACTION GUIDE: Testing the Complete Fix

## STEP 0: RESTART THE BACKEND

**Critical**: All changes require a backend restart.

```powershell
# In your backend terminal:
# Press Ctrl+C to stop the current process
# Then:
cd c:\Users\Admin\OneDrive\Desktop\pinnawala-gems\backend-node
npm start

# You should see:
# Server running on http://localhost:5001
# [createGem] prefixed logs when creating gems
```

---

## STEP 1: CLEAR YOUR BROWSER CACHE

```
Chrome: Ctrl+Shift+Delete → Clear browsing data → Cookies and cached images
Or just open DevTools (F12) → Application → Clear All
```

---

## STEP 2: CREATE AN INTERNAL INVENTORY GEM

### Test Case: Standard Gem Type

1. **Login** with a seller account
2. Go to **Dashboard → Gems & Inventory → Internal Inventory**
3. Click **"Register Gem"**
4. Fill form:
   ```
   Gemstone Name: Premium Thai Sapphire
   Gem Type:      Sapphire
   Color:         Blue
   Origin:        Thailand
   Weight:        3.5 carats
   ```
5. Click **"✓ Register to Internal Inventory"**

### What to expect:
- ✅ Green toast: "✓ Gem added to internal inventory!"
- ✅ Gem appears in the list below
- ✅ Backend logs show:
  ```
  [createGem] ====== NEW REQUEST ======
  [createGem] Request body: { name: 'Premium Thai Sapphire', gem_type: 'Sapphire', ... }
  [createGem] Is internal inventory: true
  [createGem] Parsed price: 0
  [createGem] Gem created successfully: [gem_id]
  ```

### If it fails:
❌ **400 Bad Request** → Schema not updated. Check that Gem.js has `base_price: { type: Number, default: 0 }`
❌ **No toast message** → Check browser DevTools Console for errors

---

## STEP 3: CREATE A CUSTOM GEM TYPE

### Test Case: "Other" Option

1. Go to **Internal Inventory → Register Gem**
2. Fill form:
   ```
   Gemstone Name: Custom Moonstone
   Gem Type:      Other (select from dropdown)
   [Wait for text input to appear]
   Specify Gem Type: Moonstone (type this)
   Color:        White
   Origin:       Madagascar
   Weight:       1.8 carats
   ```
3. Click **"✓ Register to Internal Inventory"**

### What to expect:
- ✅ When "Other" is selected, a text input appears below
- ✅ Custom type "Moonstone" is saved
- ✅ Gem appears with gem_type: "Moonstone" in the list
- ✅ Backend logs show custom type validation passed

### If it fails:
❌ **Text input doesn't appear** → InventoryTab.jsx not updated with "Other" logic
❌ **Validation error** → customGemType field validation failed

---

## STEP 4: PROMOTE GEM TO MARKETPLACE (3-Step Wizard)

### Prerequisites:
- Must have at least 1 internal inventory gem (from STEP 2)
- Must be in seller/admin role

### Test Case: Full Promotion Workflow

1. Go to **Dashboard → Gems & Inventory → Marketplace Listing**
2. **Step 1: Select Gem**
   - Select the gem you created in STEP 2
   - Click **"Next"**
   - ✅ Gem preview shows all details

3. **Step 2: Add Details**
   - Base Price: `$5000`
   - Description: `This is a premium sapphire from Thailand with excellent clarity and saturation.`
   - Toggle: Check "Enable Price Negotiation"
   - Click **"Next"**
   - ✅ Warning shows: "Buyers can place offers from $0 to $2500 (50% of base price)"

4. **Step 3: Upload Image**
   - Click upload area (or drag-drop)
   - Select a JPG/PNG/WebP image
   - Image preview shows
   - Click **"✓ Publish to Marketplace"**

### What to expect:
- ✅ Green toast: "✓ Gem published to marketplace!"
- ✅ Form resets
- ✅ Backend logs show:
  ```
  [updateGem] ====== UPDATE REQUEST ======
  [updateGem] Gem ID: [gem_id]
  [updateGem] Update data: { base_price: '5000', listing_status: 'Marketplace_Active', ... }
  [updateGem] Current listing status: Internal_Inventory
  [updateGem] Target listing status: Marketplace_Active
  [updateGem] Is promoting to marketplace: true
  [updateGem] Gem updated successfully
  ```
- ✅ Gem DISAPPEARS from Internal Inventory (now in Marketplace)

### If it fails:

❌ **Step 1 - No gems in dropdown**
```
Check backend logs for: [getInventoryGems] Gems found: 0
If 0, then createGem failed silently. Check STEP 2.
```

❌ **Step 2 - Cannot enter price**
```
Form should accept any number > 0
If not working, check MarketplaceListingTab.jsx input validation
```

❌ **Step 3 - Image upload fails**
```
Check: File < 5MB, format is JPG/PNG/WebP
Backend should show: [updateGem] Image uploaded: http://localhost:5001/uploads/[filename]
```

❌ **After publish - 400 Error**
```
Common cause: updateGem not recognizing marketplace promotion
Check backend logs for: [updateGem] Is promoting to marketplace: true
If false, then updateGem logic not updated properly
```

---

## STEP 5: VERIFY IN DATABASE

Use MongoDB Atlas or local MongoDB client:

```javascript
db.gems.find({ gem_type: { $in: ["Sapphire", "Moonstone"] } })
```

**Expected output for internal gem:**
```json
{
  "_id": ObjectId("..."),
  "name": "Premium Thai Sapphire",
  "gem_type": "Sapphire",
  "color": "Blue",
  "origin": "Thailand",
  "weight_carats": 3.5,
  "base_price": 0,
  "listing_status": "Internal_Inventory",
  "image_url": "",
  "status": "Active",
  "seller_id": ObjectId("..."),
  "is_negotiable": false
}
```

**Expected output after promotion:**
```json
{
  "...same fields...": "",
  "base_price": 5000,
  "listing_status": "Marketplace_Active",
  "image_url": "http://localhost:5001/uploads/[filename]",
  "description": "This is a premium sapphire...",
  "is_negotiable": true,
  "status": "Active",
  "updatedAt": ISODate("2024-01-01T12:34:56Z")  // Should be recent
}
```

---

## STEP 6: MONITOR LOGS FOR SUCCESS

**What you should see in terminal when everything works:**

```
=== Gem Creation (Internal Inventory) ===
[createGem] ====== NEW REQUEST ======
[createGem] Request body: { name: '...', listing_status: 'Internal_Inventory' }
[createGem] Is internal inventory: true
[createGem] Parsed price: 0
[createGem] Gem created successfully: [id]

=== Fetch Inventory ===
[getInventoryGems] Request received at: /api/gems/inventory/all
[getInventoryGems] Gems found: 1

=== Gem Promotion ===
[updateGem] ====== UPDATE REQUEST ======
[updateGem] Target listing status: Marketplace_Active
[updateGem] Is promoting to marketplace: true
[updateGem] Image uploaded: http://localhost:5001/uploads/1234567890.jpg
[updateGem] Gem updated successfully
```

---

## TROUBLESHOOTING CHECKLIST

| Issue | Check | Fix |
|-------|-------|-----|
| 400 on gem creation | Schema `base_price` field | Update Gem.js, restart backend |
| 404 on inventory fetch | Route order in gemRoutes.js | `/inventory/all` before `/:id` |
| 400 on marketplace publish | updateGem promotion detection | Verify `isPromotingToMarketplace` logic |
| "Other" field doesn't show | InventoryTab.jsx conditional | Check gem_type?.value === 'Other' |
| Image not uploading | Multer config + file size | Check file < 5MB, format correct |
| Custom gem type rejected | Validation in InventoryTab | Check customGemType not empty |

---

## SUCCESS CHECKLIST

- [ ] Created internal inventory gem with 0 price
- [ ] No 400 Bad Request error during creation
- [ ] Gem appears in Internal Inventory list
- [ ] Fetched internal inventory via Marketplace tab
- [ ] Promoted gem to marketplace with pricing
- [ ] Image uploaded successfully
- [ ] Gem disappeared from Internal Inventory (now in Marketplace)
- [ ] Database shows correct `listing_status` transition
- [ ] "Other" gem type works with custom input
- [ ] All backend logs have `[createGem]`, `[getInventoryGems]`, `[updateGem]` prefixes

---

## NEXT STEPS AFTER SUCCESS

Once this workflow is fully working:

1. **Test with multiple gems** to ensure filtering works
2. **Test as admin** (should see all sellers' gems)
3. **Test offer workflow** (make offers on promoted marketplace gems)
4. **Test gem details page** (ensure all fields display correctly)
5. **Deploy to production** with confidence

---

## NEED HELP?

1. Check the **COMPLETE_INVENTORY_MARKETPLACE_FIX.md** for deep debugging
2. Search backend logs for the **[prefix]** tag
3. Open DevTools (F12) → Console to see frontend errors
4. Check MongoDB to verify data was actually saved
5. Restart backend fresh (sometimes helps)

**All logs should include [createGem], [getInventoryGems], or [updateGem] prefix if fixes are active.**
