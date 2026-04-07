const express = require('express');
const router = express.Router();
const {
  createGem, getAllGems, getAdminGems, getAdminCompanyGems, getMyGems, getGemById,
  updateGem, updateGemStatus, deleteGem, upload
} = require('../controllers/gemController');
const { protect, sellerOnly, adminOnly, sellerOrAdminOnly } = require('../middleware/authMiddleware');

// ── Specific named routes MUST come before /:id ──
router.get('/admin/all',       protect, adminOnly, getAdminGems);
router.get('/admin/company',   protect, adminOnly, getAdminCompanyGems);
router.get('/my/listings',     protect, sellerOnly, getMyGems);

// ── Public routes ──
router.get('/',                getAllGems);
router.get('/:id',             getGemById);

// ── Seller & Admin protected routes ──
router.post('/',               protect, sellerOrAdminOnly, upload.single('image'), createGem);
router.put('/:id',             protect, updateGem);         // seller checks ownership inside
router.delete('/:id',          protect, deleteGem);         // admin or seller checks inside

// ── Admin status patch ──
router.patch('/:id/status',    protect, adminOnly, updateGemStatus);

module.exports = router;