const express = require('express');
const router = express.Router();
const {
  getAllUsers, approveSeller
} = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.route('/').get(protect, adminOnly, getAllUsers);
router.route('/:id/approve').put(protect, adminOnly, approveSeller);

module.exports = router;