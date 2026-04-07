const Gem = require('../models/Gem');
const multer = require('multer');
const path = require('path');

// --- Image upload setup ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase());
    ok ? cb(null, true) : cb(new Error('Only .jpg, .jpeg, .png, and .gif files are allowed'));
  }
});
exports.upload = upload;

// CREATE a gem listing (sellers/admin only) — defaults to Active for admin
exports.createGem = async (req, res) => {
  try {
    console.log('Create gem request body:', req.body);
    console.log('Create gem file:', req.file);
    
    // Check KYC status if user is a seller
    if (req.user.role === 'seller') {
      const User = require('../models/User');
      const user = await User.findById(req.user.id);
      if (user.kycStatus !== 'Approved') {
        return res.status(403).json({ message: 'Your KYC is still pending or rejected. Please wait for Admin approval.' });
      }
    }

    const image_url = req.file
      ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
      : req.body.image_url || '';

    // SECURITY: Reject zero or negative base_price and weight_carats
    const parsedPrice = parseFloat(req.body.base_price);
    const parsedWeight = parseFloat(req.body.weight_carats);
    
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({ message: 'Base price must be greater than zero.' });
    }
    if (!Number.isFinite(parsedWeight) || parsedWeight <= 0) {
      return res.status(400).json({ message: 'Weight must be greater than zero carats.' });
    }

    // Admin gems are company-owned and auto-approved
    const gemData = {
      name: req.body.name,
      gem_type: req.body.gem_type,
      color: req.body.color,
      weight_carats: parseFloat(req.body.weight_carats) || 0,
      base_price: parsedPrice,
      is_negotiable: req.body.is_negotiable === 'true' || req.body.is_negotiable === true,
      listing_type: req.body.listing_type || 'Direct_Sale',
      seller_type: req.body.seller_type || 'ThirdParty',
      status: req.body.status || 'Pending_Approval',
      ngja_cert: req.body.ngja_cert || '',
      image_url: image_url,
      description: req.body.description || '',
      seller_id: req.user.id
    };

    // Admin-specific settings
    if (req.user.role === 'admin') {
      gemData.isCompanyOwned = true;
      gemData.seller_type = 'Company';
      gemData.status = 'Active'; // Auto-approve admin listings
    } else {
      gemData.status = 'Active'; // Auto-approve verified seller listings
    }

    console.log('Final gem data to save:', gemData);

    const gem = await Gem.create(gemData);
    console.log('Gem created successfully:', gem);
    res.status(201).json(gem);
  } catch (err) {
    console.error('Create gem error:', err);
    
    // Handle validation errors specifically
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: `Validation Error: ${errors.join(', ')}` });
    }
    
    res.status(400).json({ message: err.message });
  }
};

// READ active gems — public marketplace
exports.getAllGems = async (req, res) => {
  try {
    const gems = await Gem.find({ status: 'Active' }).sort({ createdAt: -1 });
    res.json(gems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// READ all gems — admin only (all statuses)
exports.getAdminGems = async (req, res) => {
  try {
    const gems = await Gem.find({}).sort({ createdAt: -1 });
    res.json(gems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// READ admin company gems only — admin only
exports.getAdminCompanyGems = async (req, res) => {
  try {
    const gems = await Gem.find({ seller_id: req.user.id, isCompanyOwned: true }).sort({ createdAt: -1 });
    res.json(gems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// READ gems by seller — for seller dashboard
exports.getMyGems = async (req, res) => {
  try {
    const gems = await Gem.find({ seller_id: req.user.id }).sort({ createdAt: -1 });
    res.json(gems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// READ single gem
exports.getGemById = async (req, res) => {
  try {
    const gem = await Gem.findById(req.params.id);
    if (!gem) return res.status(404).json({ message: 'Gem not found' });
    res.json(gem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE gem — seller (own gems only)
exports.updateGem = async (req, res) => {
  try {
    const gem = await Gem.findById(req.params.id);
    if (!gem) return res.status(404).json({ message: 'Gem not found' });

    // Admin can edit any, seller only their own
    if (req.user.role !== 'admin' && gem.seller_id.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorized' });

    let updateData = { ...req.body };

    // SECURITY: Reject zero or negative base_price and weight on update
    if (updateData.base_price !== undefined) {
      const updatedPrice = parseFloat(updateData.base_price);
      if (!Number.isFinite(updatedPrice) || updatedPrice <= 0) {
        return res.status(400).json({ message: 'Base price must be greater than zero.' });
      }
      updateData.base_price = updatedPrice;
    }
    
    if (updateData.weight_carats !== undefined) {
      const updatedWeight = parseFloat(updateData.weight_carats);
      if (!Number.isFinite(updatedWeight) || updatedWeight <= 0) {
        return res.status(400).json({ message: 'Weight must be greater than zero carats.' });
      }
      updateData.weight_carats = updatedWeight;
    }

    if (req.file) {
      updateData.image_url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    const updated = await Gem.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// UPDATE gem status — admin only (approve/reject)
exports.updateGemStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['Active', 'Rejected', 'Pending_Approval', 'Sold'];
    if (!allowed.includes(status))
      return res.status(400).json({ message: 'Invalid status' });

    const gem = await Gem.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!gem) return res.status(404).json({ message: 'Gem not found' });
    res.json(gem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE gem
exports.deleteGem = async (req, res) => {
  try {
    const gem = await Gem.findById(req.params.id);
    if (!gem) return res.status(404).json({ message: 'Gem not found' });

    // Admin can delete any, seller only their own
    if (req.user.role !== 'admin' && gem.seller_id.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorized' });

    await gem.deleteOne();
    res.json({ message: 'Gem deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};