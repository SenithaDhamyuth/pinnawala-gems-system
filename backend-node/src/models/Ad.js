const mongoose = require('mongoose');

const adSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  image_url: {
    type: String,
    required: true
  },
  link_url: {
    type: String,
    default: ''
  },
  position: {
    type: String,
    enum: ['Home_Top', 'Home_Bottom', 'Marketplace_Grid', 'Marketplace_Top', 'Sidebar'],
    default: 'Home_Top'
  },
  is_active: {
    type: Boolean,
    default: true
  },
  // Legacy field for backward compatibility
  target_gem_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gem'
  },
  status: {
    type: String,
    enum: ['Active', 'Expired'],
    default: 'Active'
  }
}, { timestamps: true });

module.exports = mongoose.model('Ad', adSchema);
