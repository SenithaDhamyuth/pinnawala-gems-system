const express    = require('express');
const router     = express.Router();
const ctrl       = require('../controllers/paymentController');
const { protect, sellerOnly, adminOnly, buyerOnly } = require('../middleware/authMiddleware');

// Buyer submits a payment
router.post('/',                  protect, ctrl.createPayment);

// Seller checks their wallet
router.get('/my',                 protect, ctrl.getMyWallet);

// Admin checks platform revenue
router.get('/admin/revenue',      protect, adminOnly, ctrl.getAdminRevenue);

module.exports = router;
