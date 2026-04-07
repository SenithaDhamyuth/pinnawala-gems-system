const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  gem_id:          { type: mongoose.Schema.Types.ObjectId, ref: 'Gem', required: true },
  buyer_id:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seller_id:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  buyer_name:      { type: String },
  buyer_email:     { type: String },
  gem_name:        { type: String },
  offer_amount:    { type: Number, required: true },
  counter_amount:  { type: Number },
  status:          {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected', 'Countered'],
    default: 'Pending'
  },
  message:         { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Offer', offerSchema);
