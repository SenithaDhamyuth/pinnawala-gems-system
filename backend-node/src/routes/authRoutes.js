const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { uploadKyc } = require('../middleware/uploadMiddleware');

// Public
router.post('/register',     authController.register);
router.post('/login',        authController.login);
router.post('/admin-login',  authController.adminLogin); // Admin-only login — validates role=admin


// Authenticated Seller Route
router.post('/kyc/upload', protect, uploadKyc.single('document'), authController.uploadKYC);

// Admin — list all users
router.get('/users', protect, adminOnly, authController.getAllUsers);

// Admin — approve or reject a seller's KYC
// PATCH /api/auth/users/:id/kyc   body: { kycStatus: 'Approved' | 'Rejected' | 'Pending' }
router.patch('/users/:id/kyc', protect, adminOnly, authController.updateKYCStatus);

module.exports = router;