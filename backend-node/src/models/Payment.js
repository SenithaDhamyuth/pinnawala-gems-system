const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  buyer_id:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seller_id:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  gem_id:       { type: mongoose.Schema.Types.ObjectId, ref: 'Gem',  required: true },
  gem_name:     { type: String, required: true },

  // The buyer pays the full price. Seller only sees 85%.
  total_amount:    { type: Number, required: true },   // What buyer pays (100%)
  seller_amount:   { type: Number, required: true },   // 85% of total
  commission:      { type: Number, required: true },   // 15% platform fee

  // Dummy card details (just for show — NO real data stored)
  card_last4:   { type: String, default: '****' },

  status: {
    type:    String,
    enum:    ['Pending', 'Completed', 'Failed'],
    default: 'Completed',
  },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
