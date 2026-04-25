const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender:      { type: String, required: true },
  text:        { type: String, required: true, trim: true },
  is_internal: { type: Boolean, default: false },
  timestamp:   { type: Date, default: Date.now },
});

const inquirySchema = new mongoose.Schema({
  reference_id: { type: String, unique: true },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  subject:  { type: String, required: true, trim: true },
  category: {
    type: String,
    enum: ['Technical', 'Billing', 'General', 'Gemstone Query', 'Appointment', 'Other'],
    required: true,
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium',
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
    default: 'Open',
  },
  messages: [messageSchema],
}, { timestamps: true });

// Auto-generate reference ID like TKT-00001
inquirySchema.pre('save', async function () {
  if (!this.reference_id) {
    const count = await mongoose.model('Inquiry').countDocuments();
    this.reference_id = `TKT-${String(count + 1).padStart(5, '0')}`;
  }
});

inquirySchema.index({ user_id: 1, createdAt: -1 });

module.exports = mongoose.model('Inquiry', inquirySchema);
