const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  gemologist_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  purpose: {
    type: String,
    enum: ['Jewelry collections', 'Rare gemstone collections', 'Other / Need assistance'],
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  time_slot: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
    default: 'Pending',
  },
  tc_agreed: {
    type: Boolean,
    required: true,
  },
  tc_agreed_timestamp: {
    type: Date,
  },
  reminder_method: {
    type: String,
    enum: ['Email', 'SMS', 'Both'],
    default: 'Email',
  },
  subscribe_updates: {
    type: Boolean,
    default: false,
  },
  reminder_24h_sent: { type: Boolean, default: false },
  reminder_1h_sent:  { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
});

appointmentSchema.index({ gemologist_id: 1, date: 1, status: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
