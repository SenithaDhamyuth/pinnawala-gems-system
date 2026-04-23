const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// POST: Submit feedback (protected for buyers/sellers)
router.post('/', protect, feedbackController.submitFeedback);

// GET: Fetch all feedback (protected for admin only)
router.get('/', protect, adminOnly, feedbackController.getAllFeedback);

module.exports = router;
