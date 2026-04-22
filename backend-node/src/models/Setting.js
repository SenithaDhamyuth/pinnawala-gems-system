const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  auctionRules: [{ type: String }]
}, { strict: false });

module.exports = mongoose.model('Setting', settingSchema);
