const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/sellerController');
const { protect, sellerOnly } = require('../middleware/authMiddleware');

// Use the enhanced file upload middleware from sellerController with error handling
router.put('/profile', protect, sellerOnly, (req, res, next) => {
  sellerController.uploadFiles(req, res, (err) => {
    if (err) {
      console.error('Multer Error:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ message: 'Unexpected file field. Please check the form data fields.' });
      }
      return res.status(400).json({ message: 'File upload error: ' + err.message });
    }
    next();
  });
}, sellerController.updateProfile);

router.get('/directory', sellerController.getSellerDirectory);
router.get('/storefront/:id', sellerController.getStorefront);

module.exports = router;
