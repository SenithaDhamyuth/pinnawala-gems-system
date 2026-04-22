const mongoose = require('mongoose');

const gemSchema = new mongoose.Schema({
  seller_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  inventory_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inventory',
    default: null
  },
  name:           { type: String, required: true },
  gem_type:       { type: String, required: true },
  color:          { type: String, required: true },
  weight_carats:  { type: Number, required: true, min: [0.01, 'Weight must be at least 0.01 carats'] },
  base_price:     { type: Number, default: 0, validate: { validator: function(v) { return v >= 0; }, message: 'Base price must be 0 or greater' } },
  cost_price:     { type: Number, default: 0 },
  is_negotiable:  { type: Boolean, default: false },
  listing_type:   { type: String, enum: ['Direct_Sale', 'Auction'], default: 'Direct_Sale' },
  seller_type:    { type: String, enum: ['Company', 'ThirdParty'], default: 'ThirdParty' },
  status:         { type: String, enum: ['Pending_Approval', 'Active', 'Rejected', 'Sold'], default: 'Pending_Approval' },
  listing_status: { 
    type: String, 
    enum: ['Internal_Inventory', 'Marketplace_Active', 'Sold'], 
    default: 'Internal_Inventory' 
  },
  ngja_cert:      { type: String, default: '' },
  image_url:      { type: String, default: '' },
  description:    { type: String, default: '' },
  quantity:       { type: Number, default: 1 },
  notes:          { type: String, default: '' },
  // Additional fields for frontend compatibility
  origin:         { type: String, default: '' },
  clarity:        { type: String, default: '' },
  cut:            { type: String, default: '' },
  treatment:      { type: String, default: '' },
  dimensions:     { type: String, default: '' },
  isCompanyOwned: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Gem', gemSchema);