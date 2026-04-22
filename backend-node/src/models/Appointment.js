const mongoose = require('mongoose');

/**
 * Appointment / Slot Schema
 *
 * Lifecycle:
 *   Admin creates  → status: 'Available' (buyer_id = null)
 *   Buyer books    → status: 'Booked'    (buyer_id set)
 *   Admin closes   → status: 'Completed' | 'Cancelled'
 *   Buyer cancels  → status: 'Available' (buyer_id = null restored)
 */
const appointmentSchema = new mongoose.Schema({
  // The admin who created / owns this slot
  admin_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // The buyer who booked the slot (null when still available)
  buyer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },

  // ISO date string  e.g. "2026-04-20"
  date: { type: String, required: true },

  // Human-readable label  e.g. "09:00 - 09:30"
  time_slot: { type: String, required: true },

  // Slot lifecycle status
  status: {
    type: String,
    enum: ['Available', 'Booked', 'Completed', 'Cancelled'],
    default: 'Available',
  },

  // Optional note admin can attach to a slot
  notes: { type: String, default: '' },

  created_at: { type: Date, default: Date.now },
});

// Compound index so queries on (date, status) are fast
appointmentSchema.index({ date: 1, status: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
