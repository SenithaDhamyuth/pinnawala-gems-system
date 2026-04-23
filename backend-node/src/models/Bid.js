const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  auctionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Auction', required: true },
  bidderId: { type: String },
  bidderName: { type: String },
  amount: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  timestamp_us: { type: Number },
  tie_flag: { type: Boolean, default: false }
}, { strict: false });

// Indexes used in bids
bidSchema.index({ auctionId: 1, amount: -1, timestamp_us: 1 }, { name: "bid_auction_amount_ts" });
bidSchema.index({ auctionId: 1, tie_flag: 1 }, { name: "bid_tie_flag" });

module.exports = mongoose.model('Bid', bidSchema);
