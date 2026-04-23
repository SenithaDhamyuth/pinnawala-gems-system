const Appointment = require('../models/Appointment');
const User = require('../models/User');

const formatAppointment = (doc) => {
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  obj.id = obj._id.toString();
  delete obj._id;
  delete obj.__v;
  return obj;
};

// All possible 30-min slots from 09:00 to 15:00, excluding lunch (12:30, 13:00)
const ALL_SLOTS = [
  '09:00','09:30','10:00','10:30','11:00','11:30',
  '14:00','14:30','15:00'
];

const timeToMinutes = (t) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

// Returns blocked slots for a gemologist on a date
const getBlockedSlots = async (gemologist_id, date) => {
  const existing = await Appointment.find({
    gemologist_id,
    date,
    status: { $ne: 'Cancelled' },
  });

  const blockedSet = new Set();
  existing.forEach((appt) => {
    const start = timeToMinutes(appt.time_slot);
    // Block 45-min window: 15min before + slot + 15min after
    [start - 15, start, start + 15, start + 30].forEach((m) => {
      const h = String(Math.floor(m / 60)).padStart(2, '0');
      const min = String(m % 60).padStart(2, '0');
      blockedSet.add(`${h}:${min}`);
    });
  });

  return Array.from(blockedSet);
};

// GET /api/appointments/available?gemologist_id=...&date=...
exports.getAvailableSlots = async (req, res) => {
  try {
    const { gemologist_id, date } = req.query;
    if (!gemologist_id || !date) {
      return res.status(400).json({ detail: 'gemologist_id and date are required.' });
    }

    const blocked = await getBlockedSlots(gemologist_id, date);
    const available = ALL_SLOTS.filter((s) => !blocked.includes(s));

    res.json({ date, gemologist_id, available_slots: available, blocked_slots: blocked });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
};

// GET /api/appointments/gemologists — list all users with role 'gemologist'
exports.getGemologists = async (req, res) => {
  try {
    const gemologists = await User.find({ role: 'gemologist' })
      .select('_id full_name email')
      .lean();
    res.json(gemologists.map((g) => ({ id: g._id, full_name: g.full_name, email: g.email })));
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
};

// POST /api/appointments/book
exports.bookAppointment = async (req, res) => {
  try {
    const { gemologist_id, purpose, date, time_slot, tc_agreed, reminder_method, subscribe_updates } = req.body;

    if (!tc_agreed) {
      return res.status(400).json({ detail: 'You must agree to the Terms and Conditions.' });
    }
    if (!gemologist_id || !purpose || !date || !time_slot) {
      return res.status(400).json({ detail: 'gemologist_id, purpose, date, and time_slot are required.' });
    }

    // Race condition protection — re-check availability
    const blocked = await getBlockedSlots(gemologist_id, date);
    if (blocked.includes(time_slot)) {
      return res.status(409).json({ detail: 'This slot just became unavailable. Please choose another.' });
    }

    const appt = await Appointment.create({
      user_id: req.user.id,
      gemologist_id,
      purpose,
      date,
      time_slot,
      status: 'Pending',
      tc_agreed: true,
      tc_agreed_timestamp: new Date(),
      reminder_method: reminder_method || 'Email',
      subscribe_updates: !!subscribe_updates,
    });

    res.status(201).json(formatAppointment(appt));
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
};

// GET /api/appointments — admin sees all, user sees own
exports.getAppointments = async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const query = isAdmin ? {} : { user_id: req.user.id };
    const appts = await Appointment.find(query)
      .populate('gemologist_id', 'full_name email')
      .populate('user_id', 'full_name email')
      .sort({ date: 1 });
    res.json(appts.map(formatAppointment));
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
};

// PATCH /api/appointments/:id — admin updates status
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.query;
    if (!status) return res.status(400).json({ detail: 'status query param is required.' });

    const appt = await Appointment.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true }
    );
    if (!appt) return res.status(404).json({ detail: 'Appointment not found.' });
    res.json(formatAppointment(appt));
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
};

// PATCH /api/appointments/:id/cancel — user cancels own appointment
exports.cancelAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findOne({ _id: req.params.id, user_id: req.user.id });
    if (!appt) return res.status(404).json({ detail: 'Appointment not found.' });
    if (appt.status === 'Cancelled') return res.status(400).json({ detail: 'Already cancelled.' });

    appt.status = 'Cancelled';
    await appt.save();
    res.json(formatAppointment(appt));
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
};
