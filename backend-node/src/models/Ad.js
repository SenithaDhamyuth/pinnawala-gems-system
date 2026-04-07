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
