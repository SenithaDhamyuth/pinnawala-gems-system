const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// 1. Chat System Uploads Storage
const chatStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'pinnawala_gems_chat',
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif'],
    // Automatically generate unique filenames
  }
});

// 2. Inventory Uploads Storage
const inventoryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'pinnawala_gems_inventory',
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif']
  }
});

// 3. Profile/Logo Uploads Storage
const profileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'pinnawala_gems_profiles',
    allowed_formats: ['jpg', 'png', 'jpeg']
  }
});

// 4. KYC Uploads Storage
const kycStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'pinnawala_gems_kyc',
    allowed_formats: ['jpg', 'png', 'jpeg', 'pdf']
  }
});

// 5. Ad Uploads Storage
const adStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'pinnawala_gems_ads',
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif']
  }
});

// Middlewares
exports.uploadChat = multer({ 
  storage: chatStorage, 
  limits: { fileSize: 5 * 1024 * 1024 } // Strict 5MB limit
});

exports.uploadInventory = multer({ 
  storage: inventoryStorage, 
  limits: { fileSize: 5 * 1024 * 1024 } 
});

exports.uploadProfile = multer({ 
  storage: profileStorage, 
  limits: { fileSize: 5 * 1024 * 1024 } 
});

exports.uploadKyc = multer({ 
  storage: kycStorage, 
  limits: { fileSize: 10 * 1024 * 1024 } 
});

exports.uploadAd = multer({ 
  storage: adStorage, 
  limits: { fileSize: 5 * 1024 * 1024 } 
});
