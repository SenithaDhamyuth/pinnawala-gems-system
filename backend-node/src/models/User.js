const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  full_name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['buyer', 'seller', 'admin', 'gemologist'],
    default: 'buyer'
  },
   kycStatus: {
     type: String,
     enum: ['Pending', 'Approved', 'Rejected', 'Banned'],
     default: 'Approved'
   },
  kyc_documents: [{ type: String }], // Array of file paths
  
  // Enhanced Seller Storefront Customization
  shopName: { type: String, default: '' },
  shopLogo: { type: String, default: '' },
  address: { type: String, default: '' },
  bio: { type: String, default: '' },
  theme: {
    primaryColor: { type: String, default: '#0f172a' }, // Default slate-900
    fontFamily: { type: String, default: 'Inter' },
    bannerImage: { type: String, default: '' }
  },
  businessHours: {
    open: { type: String, default: '09:00' },
    close: { type: String, default: '18:00' },
    days: [{ type: String, default: 'Mon' }] // Default to Monday
  },
  socialLinks: {
    whatsapp: { type: String, default: '' },
    instagram: { type: String, default: '' },
    linkedin: { type: String, default: '' }
  },
  policies: { type: String, default: '' },
  badges: [{ type: String, default: '' }],
  welcomeNote: { type: String, default: '' },
  featuredGems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Gem' }],
  
  // 💰 Wallet System
  walletBalance:  { type: Number, default: 0 },  // Seller receives 85% of sale
  adminRevenue:   { type: Number, default: 0 },  // Admin accumulates 15% platform fee
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
