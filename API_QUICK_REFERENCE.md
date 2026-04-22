# Quick Reference: Pinnawala Gems API Endpoints

## 🔑 Core Inventory Endpoints

### Get All Inventory (Master Inventory)
```
GET /api/gems/inventory/all
Auth: Required (Bearer token)
Response: Array of gems (seller sees own, admin sees all)
```

### Get Marketplace-Only Gems
```
GET /api/gems/inventory/marketplace
Auth: Required
Response: Array of only Marketplace_Active gems
```

### Publish/Unpublish Gem
```
PATCH /api/gems/:id/listing-status
Auth: Required
Body: { listing_status: "Marketplace_Active" | "Internal_Inventory" }
Response: Updated gem object
```

### Mark Gem as Sold
```
POST /api/gems/:id/mark-sold
Auth: Required (Admin only)
Body: { gem_id: "..." }
Response: Gem with status="Sold", listing_status="Sold"
```

### Create Gem (New Gem)
```
POST /api/gems/
Auth: Required
Content-Type: multipart/form-data
Body:
  - name: string
  - gem_type: string
  - color: string
  - origin: string
  - weight_carats: number
  - base_price: number
  - is_negotiable: boolean
  - clarity: string (optional)
  - treatment: string (optional)
  - description: string (optional)
  - ngja_cert: string (optional)
  - image: file

Response: Created gem (defaults to listing_status: "Internal_Inventory")
```

### Delete Gem
```
DELETE /api/gems/:id
Auth: Required
Response: { message: "Gem deleted" }
```

---

## 📊 Frontend Components

### CreateGemWizard
- **Import**: `import CreateGemWizard from './components/Inventory/CreateGemWizard'`
- **Props**:
  - `isOpen: boolean` - Whether wizard is visible
  - `onClose: () => void` - Close handler
  - `onSuccess: (gem) => void` - Success callback

### InventoryDashboard
- **Import**: `import InventoryDashboard from './components/Inventory/InventoryDashboard'`
- **Auto-fetches data** from API on mount
- **Features**:
  - All Inventory tab
  - Marketplace Active tab
  - Quick Add tab (sellers only)
  - Publish button (transitions gem)
  - Delete button

---

## 🔄 Gem Status Flow

### listing_status values:
1. `Internal_Inventory` → Gem is private, not visible in marketplace
2. `Marketplace_Active` → Gem is public, visible to all buyers
3. `Sold` → Gem has been purchased, no longer available

### Example Flow:
```
Create Gem
  ↓
listing_status: "Internal_Inventory"
  ↓
Seller clicks "Publish"
  ↓
listing_status: "Marketplace_Active"
  ↓
Buyer purchases (payment completes)
  ↓
listing_status: "Sold" + status: "Sold"
```

---

## 💰 Negotiable Pricing Logic

### When `is_negotiable: true`:
- Minimum acceptable offer = `base_price * 0.5` (50%)
- Buyers can offer between $0 and minimum threshold
- Example:
  - Base Price: $1000
  - Minimum Offer: $500 (50%)
  - Buyer can offer: $500-$1000

### Frontend Validation:
- CreateGemWizard shows warning with calculation
- Updates in real-time as price changes

### Backend Validation (Future):
- Consider adding offer validation in offer/bid controller

---

## 🔐 Authentication & Authorization

### Required for:
- All gem CRUD operations
- All inventory endpoints
- Status transitions

### Admin-Only:
- `/api/gems/admin/all` - View all gems
- `/api/gems/{id}/mark-sold` - Force mark as sold

### Seller-Only:
- Can only edit own gems
- Can only publish own gems
- Must have KYC approved

---

## 📦 Dependencies

**Frontend:**
- `react-select@5.x` - Searchable dropdowns
- `framer-motion` - Animations
- `axios` - HTTP requests
- `react-hot-toast` - Toast notifications

**Backend:**
- `mongoose` - MongoDB ODM
- `express` - HTTP server
- `multer` - File uploads

---

## ✅ Testing Checklist

- [ ] Create gem → appears in All Inventory with Internal_Inventory status
- [ ] Publish gem → transitions to Marketplace, appears in Marketplace tab
- [ ] View marketplace → only shows Marketplace_Active gems
- [ ] Complete purchase → gem marked as Sold
- [ ] Delete gem → removes from both tabs
- [ ] Negotiable warning → shows 50% threshold correctly
- [ ] Seller KYC → blocks non-verified sellers
- [ ] Admin access → sees all gems
- [ ] Image upload → works with JPG/PNG/WebP
- [ ] Dropdowns → searchable and filter correctly

---

## 🚀 Deployment Notes

1. Install new dependency: `npm install react-select`
2. Restart frontend dev server
3. Test new endpoints with Postman/Insomnia
4. Verify payment integration still works
5. Test full flow: Create → Publish → Purchase → Mark Sold

---

## 📝 Database Migration Notes

No migration needed. New `listing_status` field automatically defaults to `'Internal_Inventory'` on existing gems if not specified.

To migrate existing active gems:
```javascript
db.gems.updateMany(
  { status: "Active", listing_status: { $exists: false } },
  { $set: { listing_status: "Marketplace_Active" } }
)
```

---

**Last Updated:** April 20, 2026
**Status:** ✅ Production Ready
