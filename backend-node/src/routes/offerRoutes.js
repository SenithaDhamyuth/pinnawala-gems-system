const express = require('express');
const router = express.Router();
const {
  createOffer, getSellerOffers, getBuyerOffers, respondToOffer, acceptCounter
} = require('../controllers/offerController');
const { protect, sellerOnly } = require('../middleware/authMiddleware');

router.post('/',                protect, createOffer);
router.get('/seller',           protect, getSellerOffers);
router.get('/buyer',            protect, getBuyerOffers);
router.patch('/:id/respond',    protect, sellerOnly, respondToOffer);
router.patch('/:id/accept-counter', protect, acceptCounter);

module.exports = router;
