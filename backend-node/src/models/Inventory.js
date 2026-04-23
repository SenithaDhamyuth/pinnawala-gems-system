const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  seller_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  gem_type: {
    type: String,
    required: true
  },
  color: {
    type: String,
    required: true
  },
  weight_carats: {
    type: Number,
    required: true,
    min: [0.01, 'Weight must be at least 0.01 carats']
  },
  origin: {
    type: String,
    default: ''
  },
  clarity: {
    type: String,
    default: ''
  },
  cut: {
    type: String,
    default: ''
  },
  treatment: {
    type: String,
    default: ''
  },
  dimensions: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Available', 'Listed', 'Sold'],
    default: 'Available'
  },
  quantity: {
    type: Number,
    default: 1
  }
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);
