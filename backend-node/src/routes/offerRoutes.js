const express = require('express');
const router = express.Router();
const {
  createOffer, getSellerOffers, getBuyerOffers, respondToOffer, acceptCounter, getAllOffers, processPayment, deleteOffer, sendCounterOffer
} = require('../controllers/offerController');
const { protect, sellerOnly, adminOnly, sellerOrAdminOnly } = require('../middleware/authMiddleware');

router.post('/',                    protect, createOffer);
router.get('/seller',               protect, sellerOrAdminOnly, getSellerOffers);
router.get('/buyer',                protect, getBuyerOffers);
router.get('/my-bids',              protect, getBuyerOffers);
router.get('/admin/all',            protect, adminOnly, getAllOffers);
router.patch('/:id/respond',        protect, sellerOrAdminOnly, respondToOffer);
router.patch('/:id/accept-counter', protect, acceptCounter);
router.patch('/:id/counter',        protect, sellerOrAdminOnly, sendCounterOffer);
router.post('/:id/pay',             protect, processPayment);
router.delete('/:id',               protect, adminOnly, deleteOffer);

module.exports = router;
