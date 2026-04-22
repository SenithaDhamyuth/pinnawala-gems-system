const express    = require('express');
const router     = express.Router();
const ctrl       = require('../controllers/appointmentController');
const { protect, adminOnly, buyerOnly } = require('../middleware/authMiddleware');

// ─────────────────────────────────────────────────────────────────────────────
// NOTE: Specific-path routes MUST be declared before parameterised /:id routes
// ─────────────────────────────────────────────────────────────────────────────

// ── ADMIN: Slot Management ────────────────────────────────────────────────────

// Create a new available slot
router.post('/', protect, adminOnly, ctrl.createSlot);

// Get every slot (all statuses) — admin dashboard feed
// Optional ?status filter
router.get('/admin', protect, adminOnly, ctrl.getAdminAppointments);

// ── BUYER / PUBLIC: Browsing & Booking ───────────────────────────────────────

// Get only Available slots (all authenticated users can view)
// Optional ?date=YYYY-MM-DD filter
router.get('/available', protect, ctrl.getAvailableSlots);

// Get the authenticated buyer's own appointments
router.get('/my', protect, ctrl.getBuyerAppointments);

// Book a specific available slot (buyer-only)
router.post('/book/:id', protect, buyerOnly, ctrl.bookAppointment);

// Buyer cancels their own booked appointment (slot reverts to Available)
router.patch('/:id/cancel', protect, buyerOnly, ctrl.cancelBuyerAppointment);

// ── ADMIN: Per-Slot Mutations ─────────────────────────────────────────────────

// Edit a slot's date / time_slot / notes (Available slots only)
router.put('/:id', protect, adminOnly, ctrl.updateSlot);

// Change a slot's status (Admin has full authority)
router.patch('/:id/status', protect, adminOnly, ctrl.updateSlotStatus);

// Delete a slot entirely
router.delete('/:id', protect, adminOnly, ctrl.deleteSlot);

module.exports = router;
