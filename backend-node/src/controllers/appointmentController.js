const Appointment = require('../models/Appointment');

// ─────────────────────────────────────────────────────────────────────────────
// Helper: strip Mongoose internals from a document
// ─────────────────────────────────────────────────────────────────────────────
const formatAppointment = (doc) => {
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  obj.id = obj._id.toString();
  delete obj._id;
  delete obj.__v;
  return obj;
};

// ═════════════════════════════════════════════════════════════════════════════
// ADMIN — Slot Management
// ═════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/appointments
 * Admin creates a new available slot.
 * Body: { date, time_slot, notes? }
 */
exports.createSlot = async (req, res) => {
  try {
    const { date, time_slot, notes } = req.body;

    if (!date || !time_slot) {
      return res.status(400).json({ detail: 'date and time_slot are required' });
    }

    const adminId = req.user.id || req.user._id;

    const slot = new Appointment({
      admin_id: adminId,
      buyer_id: null,
      date,
      time_slot,
      notes: notes || '',
      status: 'Available',
    });

    await slot.save();
    return res.status(201).json(formatAppointment(slot));
  } catch (err) {
    console.error('[createSlot]', err);
    return res.status(500).json({ detail: 'Failed to create slot' });
  }
};

/**
 * GET /api/appointments/admin
 * Admin retrieves ALL slots regardless of status.
 * Optional query: ?status=Available|Booked|Completed|Cancelled
 */
exports.getAdminAppointments = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const appointments = await Appointment.find(filter)
      .sort({ date: 1, time_slot: 1 })
      .populate('buyer_id', 'full_name email');

    return res.json(appointments.map(formatAppointment));
  } catch (err) {
    console.error('[getAdminAppointments]', err);
    return res.status(500).json({ detail: 'Failed to fetch appointments' });
  }
};

/**
 * PUT /api/appointments/:id
 * Admin edits a slot's date / time_slot / notes (only when status = Available).
 */
exports.updateSlot = async (req, res) => {
  try {
    const slot = await Appointment.findById(req.params.id);
    if (!slot) return res.status(404).json({ detail: 'Slot not found' });

    if (slot.status !== 'Available') {
      return res.status(400).json({ detail: 'Only Available slots can be edited' });
    }

    const { date, time_slot, notes } = req.body;
    if (date)       slot.date      = date;
    if (time_slot)  slot.time_slot = time_slot;
    if (notes !== undefined) slot.notes = notes;

    await slot.save();
    return res.json(formatAppointment(slot));
  } catch (err) {
    console.error('[updateSlot]', err);
    return res.status(500).json({ detail: 'Failed to update slot' });
  }
};

/**
 * PATCH /api/appointments/:id/status
 * Admin changes the lifecycle status of any slot.
 * Body: { status: 'Available' | 'Booked' | 'Completed' | 'Cancelled' }
 */
exports.updateSlotStatus = async (req, res) => {
  try {
    const VALID = ['Available', 'Booked', 'Completed', 'Cancelled'];
    const { status } = req.body;

    if (!status || !VALID.includes(status)) {
      return res.status(400).json({ detail: `status must be one of: ${VALID.join(', ')}` });
    }

    const slot = await Appointment.findById(req.params.id);
    if (!slot) return res.status(404).json({ detail: 'Slot not found' });

    slot.status = status;
    // If admin marks as Available again, clear the buyer
    if (status === 'Available') slot.buyer_id = null;

    await slot.save();
    return res.json(formatAppointment(slot));
  } catch (err) {
    console.error('[updateSlotStatus]', err);
    return res.status(500).json({ detail: 'Failed to update status' });
  }
};

/**
 * DELETE /api/appointments/:id
 * Admin deletes a slot outright (any status — admin has full authority).
 */
exports.deleteSlot = async (req, res) => {
  try {
    const slot = await Appointment.findById(req.params.id);
    if (!slot) return res.status(404).json({ detail: 'Slot not found' });

    await slot.deleteOne();
    return res.json({ message: 'Slot deleted successfully', id: req.params.id });
  } catch (err) {
    console.error('[deleteSlot]', err);
    return res.status(500).json({ detail: 'Failed to delete slot' });
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// PUBLIC / BUYER — Booking
// ═════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/appointments/available
 * Returns all slots with status = 'Available'.
 * Optional query: ?date=2026-04-20
 */
exports.getAvailableSlots = async (req, res) => {
  try {
    const filter = { status: 'Available' };
    if (req.query.date) filter.date = req.query.date;

    const slots = await Appointment.find(filter).sort({ date: 1, time_slot: 1 });
    return res.json(slots.map(formatAppointment));
  } catch (err) {
    console.error('[getAvailableSlots]', err);
    return res.status(500).json({ detail: 'Failed to fetch available slots' });
  }
};

/**
 * POST /api/appointments/book/:id
 * Buyer books an available slot.
 * Race-condition safe: uses atomic findOneAndUpdate.
 */
exports.bookAppointment = async (req, res) => {
  try {
    const buyerId = req.user.id || req.user._id;

    // Atomic update — only succeeds if the slot is still Available
    const slot = await Appointment.findOneAndUpdate(
      { _id: req.params.id, status: 'Available' },
      { $set: { buyer_id: buyerId, status: 'Booked' } },
      { new: true }
    );

    if (!slot) {
      return res.status(409).json({
        detail: 'This slot is no longer available. Please choose another.',
      });
    }

    return res.json(formatAppointment(slot));
  } catch (err) {
    console.error('[bookAppointment]', err);
    return res.status(500).json({ detail: 'Booking failed' });
  }
};

/**
 * GET /api/appointments/my
 * Buyer retrieves their own bookings.
 */
exports.getBuyerAppointments = async (req, res) => {
  try {
    const buyerId = req.user.id || req.user._id;

    const appointments = await Appointment.find({ buyer_id: buyerId })
      .sort({ date: 1, time_slot: 1 });

    return res.json(appointments.map(formatAppointment));
  } catch (err) {
    console.error('[getBuyerAppointments]', err);
    return res.status(500).json({ detail: 'Failed to fetch appointments' });
  }
};

/**
 * PATCH /api/appointments/:id/cancel
 * Buyer cancels their own booked appointment.
 * Slot is reverted to 'Available' so others can book.
 */
exports.cancelBuyerAppointment = async (req, res) => {
  try {
    const buyerId = (req.user.id || req.user._id).toString();

    const slot = await Appointment.findById(req.params.id);
    if (!slot) return res.status(404).json({ detail: 'Appointment not found' });

    if (!slot.buyer_id || slot.buyer_id.toString() !== buyerId) {
      return res.status(403).json({ detail: 'You can only cancel your own appointments' });
    }

    if (slot.status !== 'Booked') {
      return res.status(400).json({ detail: 'Only Booked appointments can be cancelled by the buyer' });
    }

    slot.status    = 'Cancelled';
    slot.buyer_id  = null;
    await slot.save();

    return res.json(formatAppointment(slot));
  } catch (err) {
    console.error('[cancelBuyerAppointment]', err);
    return res.status(500).json({ detail: 'Failed to cancel appointment' });
  }
};
