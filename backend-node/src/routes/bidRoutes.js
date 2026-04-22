const express = require('express');
const router = express.Router();
const bidController = require('../controllers/bidController');
const { protect, buyerOnly, adminOnly } = require('../middleware/authMiddleware');

// ── View bids (any authenticated user — buyers, sellers, admin) ───────────
router.get('/:auction_id',       protect, bidController.getBids);

// ── Tie management & index utilities (admin only) ────────────────────────
router.get('/ties/:auction_id',  protect, adminOnly, bidController.getTies);
router.post('/ensure-indexes',   protect, adminOnly, bidController.ensureIndexes);

// ── Place a bid (buyer OR admin superuser) ────────────────────────────────
router.post('/',                 protect, buyerOnly, bidController.createBid);

module.exports = router;

