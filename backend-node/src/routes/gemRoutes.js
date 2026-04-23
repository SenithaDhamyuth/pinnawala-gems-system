const express = require('express');
const router = express.Router();
const {
  createGem, 
  getAllGems, 
  getInventoryGems,
  getMarketplaceInventoryGems,
  getAdminGems, 
  getAdminCompanyGems, 
  getMyGems, 
  getGemById,
  updateGem, 
  updateGemStatus,
  updateListingStatus,
  markGemAsSold,
  deleteGem, 
  upload
} = require('../controllers/gemController');
const { protect, sellerOnly, adminOnly, sellerOrAdminOnly } = require('../middleware/authMiddleware');

// ── Specific named routes MUST come before /:id ──

// INVENTORY ENDPOINTS (Master Inventory)
router.get('/inventory/all',       protect, sellerOrAdminOnly, getInventoryGems);
router.get('/inventory/marketplace', protect, sellerOrAdminOnly, getMarketplaceInventoryGems);

// ADMIN ENDPOINTS
router.get('/admin/all',           protect, adminOnly, getAdminGems);
router.get('/admin/company',       protect, adminOnly, getAdminCompanyGems);

// SELLER ENDPOINTS
router.get('/my/listings',         protect, sellerOrAdminOnly, getMyGems);

// ── Public routes ──
router.get('/',                    getAllGems);
router.get('/:id',                 getGemById);

// ── Protected routes ──
router.post('/',                   protect, sellerOrAdminOnly, upload.single('image'), createGem);
router.put('/:id',                 protect, upload.single('image'), updateGem);  // Added upload for "Select & Promote" workflow
router.patch('/:id/status',        protect, adminOnly, updateGemStatus);
router.patch('/:id/listing-status', protect, updateListingStatus);
router.post('/:id/mark-sold',      protect, adminOnly, markGemAsSold);
router.delete('/:id',              protect, deleteGem);

module.exports = router;