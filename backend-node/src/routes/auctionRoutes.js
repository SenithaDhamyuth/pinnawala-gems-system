const express = require('express');
const router = express.Router();
const auctionController = require('../controllers/auctionController');
const { protect, sellerOrAdminOnly } = require('../middleware/authMiddleware');

// ── Public (any authenticated user can view auctions) ─────────────────────
router.get('/',    protect, auctionController.getAuctions);
router.get('/:id', protect, auctionController.getAuctionById);

// ── Protected (seller OR admin — Super-Admin bypass) ──────────────────────
router.post('/',      protect, sellerOrAdminOnly, auctionController.createAuction);
router.put('/:id',    protect, sellerOrAdminOnly, auctionController.updateAuction);
router.delete('/:id', protect, sellerOrAdminOnly, auctionController.deleteAuction);

module.exports = router;

