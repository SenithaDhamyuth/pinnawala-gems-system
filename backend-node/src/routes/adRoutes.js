const express = require('express');
const router = express.Router();
const {
  getActiveAds,
  getAllAds,
  createAd,
  updateAd,
  deleteAd,
  upload          // <-- multer instance exported from adController
} = require('../controllers/adController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public — marketplace banner carousel
router.get('/', getActiveAds);

// Admin — all ads including Expired ones
router.get('/admin/all', protect, adminOnly, getAllAds);

// Admin — create ad (accepts multipart/form-data with optional 'image' field)
router.post('/', protect, adminOnly, upload.single('image'), createAd);

// Admin — update ad (can replace image via new upload or leave it untouched)
router.put('/:id', protect, adminOnly, upload.single('image'), updateAd);

// Admin — delete ad
router.delete('/:id', protect, adminOnly, deleteAd);

module.exports = router;