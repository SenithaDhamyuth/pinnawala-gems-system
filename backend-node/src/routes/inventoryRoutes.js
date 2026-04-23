const express = require('express');
const router = express.Router();
const {
  createStock,
  getMyStock,
  getAvailableStock,
  getStockById,
  updateStock,
  deleteStock,
  markAsListed,
  markAsSold
} = require('../controllers/inventoryController');
const { protect, sellerOnly, sellerOrAdminOnly } = require('../middleware/authMiddleware');

// ── Specific named routes MUST come before /:id ──

// GET all available stock (for marketplace wizard)
router.get('/available', protect, sellerOrAdminOnly, getAvailableStock);

// GET my stock
router.get('/my', protect, sellerOrAdminOnly, getMyStock);

// GET single stock item
router.get('/:id', protect, getStockById);

// CREATE new stock item
router.post('/', protect, sellerOrAdminOnly, createStock);

// UPDATE stock item
router.put('/:id', protect, sellerOrAdminOnly, updateStock);

// MARK AS LISTED (when promoting to marketplace)
router.patch('/:id/mark-listed', protect, sellerOrAdminOnly, markAsListed);

// MARK AS SOLD
router.patch('/:id/mark-sold', protect, sellerOrAdminOnly, markAsSold);

// DELETE stock item
router.delete('/:id', protect, sellerOrAdminOnly, deleteStock);

module.exports = router;
