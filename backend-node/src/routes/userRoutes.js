const express = require('express');
const router  = express.Router();
const {
  getAllUsers,
  approveSeller,
  updateShopProfile,
  uploadShopLogo
} = require('../controllers/userController');
const { protect, adminOnly, sellerOrAdminOnly } = require('../middleware/authMiddleware');

// Admin: list all users
router.route('/').get(protect, adminOnly, getAllUsers);

// Admin: approve a seller
router.route('/:id/approve').put(protect, adminOnly, approveSeller);

// Seller: update shop profile (name, description, logo upload)
// PATCH /api/users/shop-update
router.patch(
  '/shop-update',
  protect,
  sellerOrAdminOnly,
  (req, res, next) => {
    uploadShopLogo(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'Logo image too large. Maximum size is 2MB.' });
        }
        return res.status(400).json({ message: 'Upload error: ' + err.message });
      }
      next();
    });
  },
  updateShopProfile
);

module.exports = router;