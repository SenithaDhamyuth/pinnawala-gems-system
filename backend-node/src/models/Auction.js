const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  startingBid: { type: Number, required: true },
  currentBid: { type: Number },
  media: [{
    url: String,
    type: { type: String }, // 'image' or 'video'
    isPinned: { type: Boolean, default: false }
  }]
}, { strict: false, timestamps: true });

module.exports = mongoose.model('Auction', auctionSchema);
