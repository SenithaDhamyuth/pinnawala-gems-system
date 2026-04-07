const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Configure Multer for KYC Document Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/kyc/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `kyc_${req.user.id}_${Date.now()}${ext}`);
  }
});
const upload = multer({ 
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.pdf'];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('Invalid file type. Only JPG, JPEG, PNG, GIF, and PDF are allowed.'));
  }
});

// Public
router.post('/register', authController.register);
router.post('/login',    authController.login);

// Authenticated Seller Route
router.post('/kyc/upload', protect, upload.single('document'), authController.uploadKYC);

// Admin — list all users
router.get('/users', protect, adminOnly, authController.getAllUsers);

// Admin — approve or reject a seller's KYC
// PATCH /api/auth/users/:id/kyc   body: { kycStatus: 'Approved' | 'Rejected' | 'Pending' }
router.patch('/users/:id/kyc', protect, adminOnly, authController.updateKYCStatus);

module.exports = router;