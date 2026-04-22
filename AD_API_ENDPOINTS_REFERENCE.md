# Advertisement Management System - API Quick Reference

## Base URL
```
http://localhost:5001/api/ads
```

---

## PUBLIC ENDPOINTS

### 1. Get All Active Ads
```bash
GET /api/ads
```
**Authentication:** None  
**Response:** Array of active ads
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Premium Ruby Collection",
    "image_url": "http://localhost:5001/uploads/ad_1234567890.jpg",
    "link_url": "https://example.com/rubies",
    "position": "Marketplace_Grid",
    "is_active": true,
    "status": "Active",
    "createdAt": "2024-04-20T10:30:00Z"
  }
]
```

### 2. Get Ads by Position
```bash
GET /api/ads/position/Marketplace_Grid
```
**Authentication:** None  
**Path Parameters:**
- `position` - One of: `Home_Top`, `Home_Bottom`, `Marketplace_Top`, `Marketplace_Grid`, `Sidebar`

**Response:** Array of ads at that position

---

## ADMIN-ONLY ENDPOINTS

### Authentication Header Required
```
Authorization: Bearer <JWT_TOKEN>
```

---

### 3. Get All Ads (Admin View)
```bash
GET /api/ads/admin/all
```
**Authentication:** Admin only  
**Response:** Array of ALL ads (active and inactive)

---

### 4. Create New Ad
```bash
POST /api/ads
Content-Type: multipart/form-data
Authorization: Bearer <TOKEN>
```

**Form Fields:**
```
title: "Premium Ruby Collection"                    (required, string)
image: <binary file>                                (required, JPG/PNG/GIF/WebP, max 5MB)
link_url: "https://example.com/rubies"              (optional, string)
position: "Marketplace_Grid"                        (optional, default: Home_Top)
is_active: true                                     (optional, default: true)
```

**cURL Example:**
```bash
curl -X POST http://localhost:5001/api/ads \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=Premium Ruby Collection" \
  -F "link_url=https://example.com/rubies" \
  -F "position=Marketplace_Grid" \
  -F "is_active=true" \
  -F "image=@/path/to/image.jpg"
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Premium Ruby Collection",
  "image_url": "http://localhost:5001/uploads/ad_1234567890.jpg",
  "link_url": "https://example.com/rubies",
  "position": "Marketplace_Grid",
  "is_active": true,
  "status": "Active",
  "createdAt": "2024-04-20T10:30:00Z",
  "updatedAt": "2024-04-20T10:30:00Z"
}
```

---

### 5. Update Ad
```bash
PUT /api/ads/:id
Content-Type: multipart/form-data
Authorization: Bearer <TOKEN>
```

**URL Parameters:**
- `id` - MongoDB ID of the ad

**Form Fields (all optional):**
```
title: "Updated Title"
image: <binary file>                    (optional - leave out to keep existing image)
link_url: "https://new-url.com"
position: "Home_Top"
is_active: false
status: "Active"
```

**cURL Example (Update title only):**
```bash
curl -X PUT http://localhost:5001/api/ads/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=New Title" \
  -F "is_active=false"
```

**cURL Example (Replace image):**
```bash
curl -X PUT http://localhost:5001/api/ads/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/new-image.jpg"
```

**Response:** Updated ad object

---

### 6. Delete Ad
```bash
DELETE /api/ads/:id
Authorization: Bearer <TOKEN>
```

**URL Parameters:**
- `id` - MongoDB ID of the ad

**Response:**
```json
{
  "message": "Ad deleted successfully"
}
```

**cURL Example:**
```bash
curl -X DELETE http://localhost:5001/api/ads/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Position Values

| Value | Location | Usage |
|-------|----------|-------|
| `Home_Top` | Home page banner (top) | Hero/premium placement |
| `Home_Bottom` | Home page (bottom section) | Secondary promotion |
| `Marketplace_Top` | Marketplace page (top) | High visibility |
| `Marketplace_Grid` | Marketplace grid (every 4 items) | Native ad placement |
| `Sidebar` | Sidebar widget | Contextual ads |

---

## File Upload Specifications

**Supported Formats:**
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

**Size Limits:**
- Maximum: 5 MB

**Upload Handler:** Multer  
**Storage:** Local filesystem (`uploads/` directory)  
**URL Format:** `http://localhost:5001/uploads/ad_TIMESTAMP.ext`

---

## Status Values

| Status | Meaning |
|--------|---------|
| `Active` | Ad is active in the system |
| `Expired` | Ad is expired (admin can set) |

**Note:** Use `is_active: false` to hide ads without changing status.

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "Title is required."
}
```

### 404 Not Found
```json
{
  "message": "Ad not found"
}
```

### 401 Unauthorized
```json
{
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "message": "Admin access required"
}
```

### 500 Server Error
```json
{
  "message": "Error message here"
}
```

---

## Frontend API Service (JavaScript)

### Usage Examples

```javascript
import { 
  getActiveAds, 
  getAdsByPosition, 
  getAllAds, 
  createAd, 
  updateAd, 
  deleteAd 
} from './services/api';

// Fetch all active ads
const ads = await getActiveAds();

// Fetch ads by position
const marketplaceAds = await getAdsByPosition('Marketplace_Grid');

// Admin: Get all ads
const allAds = await getAllAds();

// Create ad
const formData = new FormData();
formData.append('title', 'Premium Ruby Collection');
formData.append('link_url', 'https://example.com/rubies');
formData.append('position', 'Marketplace_Grid');
formData.append('is_active', true);
formData.append('image', fileInput.files[0]);
const newAd = await createAd(formData);

// Update ad
const updateData = new FormData();
updateData.append('title', 'Updated Title');
updateData.append('is_active', false);
const updated = await updateAd('507f1f77bcf86cd799439011', updateData);

// Delete ad
await deleteAd('507f1f77bcf86cd799439011');
```

---

## Testing with Postman

### Setup:
1. Set `BASE_URL` variable to `http://localhost:5001`
2. Set `TOKEN` variable to your JWT token
3. Set `AD_ID` variable to a test ad ID

### Collection:

**GET** - Get All Active Ads
```
{{BASE_URL}}/api/ads
```

**GET** - Get Ads by Position
```
{{BASE_URL}}/api/ads/position/Marketplace_Grid
```

**GET** - Admin View All Ads
```
{{BASE_URL}}/api/ads/admin/all
Headers: Authorization: Bearer {{TOKEN}}
```

**POST** - Create Ad
```
{{BASE_URL}}/api/ads
Headers: Authorization: Bearer {{TOKEN}}
Body: form-data
  - title: "Premium Ruby Collection"
  - link_url: "https://example.com/rubies"
  - position: "Marketplace_Grid"
  - is_active: true
  - image: <select file>
```

**PUT** - Update Ad
```
{{BASE_URL}}/api/ads/{{AD_ID}}
Headers: Authorization: Bearer {{TOKEN}}
Body: form-data
  - title: "New Title"
  - is_active: false
```

**DELETE** - Delete Ad
```
{{BASE_URL}}/api/ads/{{AD_ID}}
Headers: Authorization: Bearer {{TOKEN}}
```

---

## Rate Limiting & Quotas

Currently **no rate limiting** is implemented. Consider adding in production:
- Ad creation: 10 ads per hour
- Ad updates: 20 per hour
- File upload: 5MB max, 10 concurrent uploads

---

## Webhook/Event Hooks

Not currently implemented. Potential future additions:
- `ad.created` - Fired when ad is created
- `ad.updated` - Fired when ad is updated
- `ad.deleted` - Fired when ad is deleted
- `ad.clicked` - Fired when customer clicks ad

---

## Database Schema Reference

```javascript
{
  _id: ObjectId,
  title: String,
  image_url: String,
  link_url: String,
  position: String,
  is_active: Boolean,
  target_gem_id: ObjectId (optional, ref: Gem),
  status: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Performance Notes

- **Index on `is_active` & `status`** recommended for faster queries
- **Image optimization** recommended before upload
- **CDN** can be used for image delivery (configure image_url)

---

## Related Endpoints

- **Gems:** `GET /api/gems` - Browse marketplace gems
- **Offers:** `POST /api/offers` - Place offers on gems
- **Auth:** `POST /api/auth/login` - Get JWT token

---

**Last Updated:** April 20, 2026  
**API Version:** v1.0  
**Status:** Production Ready
