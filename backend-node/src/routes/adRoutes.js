const express = require('express');
const router = express.Router();
const {
  getActiveAds,
  getAdsByPosition,
  getAllAds,
  createAd,
  updateAd,
  deleteAd,
  upload          // <-- multer instance exported from adController
} = require('../controllers/adController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public — all active ads for marketplace
router.get('/', getActiveAds);

// Public — ads by position (e.g., /api/ads/position/Home_Top)
router.get('/position/:position', getAdsByPosition);

// Admin — all ads including inactive ones
router.get('/admin/all', protect, adminOnly, getAllAds);

// Admin — create ad (accepts multipart/form-data with optional 'image' field)
router.post('/', protect, adminOnly, upload.single('image'), createAd);

// Admin — update ad (can replace image via new upload or leave it untouched)
router.put('/:id', protect, adminOnly, upload.single('image'), updateAd);

// Admin — delete ad
router.delete('/:id', protect, adminOnly, deleteAd);

module.exports = router;