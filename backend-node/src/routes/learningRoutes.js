const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/learningController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC — No authentication required
// ─────────────────────────────────────────────────────────────────────────────

// Browse published content (supports ?category=, ?content_type=, ?q= filters)
router.get('/', ctrl.getAllContent);

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — All require a valid JWT + admin role
// ─────────────────────────────────────────────────────────────────────────────

// Admin: fetch ALL content (published + drafts)
router.get('/admin/all', protect, adminOnly, ctrl.getAdminContent);

// Admin: create new content
router.post('/', protect, adminOnly, ctrl.createContent);

// Admin: toggle published / draft
router.patch('/:id/publish', protect, adminOnly, ctrl.togglePublish);

// Admin: update content fields
router.put('/:id', protect, adminOnly, ctrl.updateContent);

// Admin: permanently delete content
router.delete('/:id', protect, adminOnly, ctrl.deleteContent);

module.exports = router;
