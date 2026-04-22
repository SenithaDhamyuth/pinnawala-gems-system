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
    console.log('[createGem] ====== NEW REQUEST ======');
    console.log('[createGem] Request body:', req.body);
    console.log('[createGem] Request file:', req.file);
    console.log('[createGem] User info:', { id: req.user.id, role: req.user.role });
    
    // Check KYC status if user is a seller
    if (req.user.role === 'seller') {
      const User = require('../models/User');
      const user = await User.findById(req.user.id);
      console.log('[createGem] Seller KYC status:', user.kycStatus);
      if (user.kycStatus !== 'Approved') {
        return res.status(403).json({ message: 'Your KYC is still pending or rejected. Please wait for Admin approval.' });
      }
    }

    const image_url = req.file
      ? (`uploads/${req.file.filename}`).replace(/\\/g, '/')
      : req.body.image_url || '';

    // Determine if this is internal inventory (no price/image required)
    const isInternal = req.body.listing_status === 'Internal_Inventory' || !req.body.base_price;
    console.log('[createGem] Is internal inventory:', isInternal);
    console.log('[createGem] Listing status:', req.body.listing_status);
    
    const parsedPrice = parseFloat(req.body.base_price) || 0;
    const parsedWeight = parseFloat(req.body.weight_carats);
    
    console.log('[createGem] Parsed price:', parsedPrice);
    console.log('[createGem] Parsed weight:', parsedWeight);
    
    // SECURITY: For marketplace gems, require valid price. For internal, allow 0
    if (!isInternal && (!Number.isFinite(parsedPrice) || parsedPrice <= 0)) {
      console.log('[createGem] ERROR: Invalid price for marketplace gem');
      return res.status(400).json({ message: 'Base price must be greater than zero for marketplace gems.' });
    }
    
    // Weight is always required and must be > 0
    if (!Number.isFinite(parsedWeight) || parsedWeight <= 0) {
      console.log('[createGem] ERROR: Invalid weight');
      return res.status(400).json({ message: 'Weight must be greater than zero carats.' });
    }

    // Admin gems are company-owned and auto-approved
    const gemData = {
      name: req.body.name,
      gem_type: req.body.gem_type,
      color: req.body.color,
      weight_carats: parsedWeight,
      base_price: parsedPrice,
      is_negotiable: req.body.is_negotiable === 'true' || req.body.is_negotiable === true,
      listing_type: req.body.listing_type || 'Direct_Sale',
      seller_type: req.body.seller_type || 'ThirdParty',
      status: req.body.status || 'Pending_Approval',
      listing_status: req.body.listing_status || 'Internal_Inventory', // New gems default to internal
      ngja_cert: req.body.ngja_cert || '',
      image_url: image_url,
      description: req.body.description || '',
      seller_id: req.user.id,
      origin: req.body.origin || ''
    };

    // Admin-specific settings
    if (req.user.role === 'admin') {
      gemData.isCompanyOwned = true;
      gemData.seller_type = 'Company';
      gemData.status = 'Active'; // Auto-approve admin listings
    } else if (isInternal) {
      // Internal inventory gems don't need approval, just mark as Active
      gemData.status = 'Active';
    } else {
      // Marketplace gems need approval
      gemData.status = 'Pending_Approval';
    }

    console.log('[createGem] Final gem data to save:', JSON.stringify(gemData, null, 2));

    const gem = await Gem.create(gemData);
    console.log('[createGem] Gem created successfully:', gem._id);
    res.status(201).json(gem);
  } catch (err) {
    console.error('[createGem] ERROR:', err);
    console.error('[createGem] Error name:', err.name);
    console.error('[createGem] Error message:', err.message);
    
    // Handle validation errors specifically
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => ({ field: e.path, message: e.message }));
      console.error('[createGem] VALIDATION ERROR DETAILS:', {
        error_fields: Object.keys(err.errors),
        errors: errors,
        full_error: JSON.stringify(errors, null, 2)
      });
      const errorMessage = errors.map(e => `${e.field}: ${e.message}`).join(' | ');
      return res.status(400).json({ success: false, message: errorMessage });
    }
    
    console.error('[createGem] GEM CREATE ERROR:', err.message);
    res.status(400).json({ success: false, message: err.message });
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// MARKETPLACE ENDPOINTS (Public)
// ═════════════════════════════════════════════════════════════════════════════

// READ active gems for PUBLIC MARKETPLACE — only Marketplace_Active status and exclude Sold gems
exports.getAllGems = async (req, res) => {
  try {
    const gems = await Gem.find({
      status: 'Active',
      listing_status: 'Marketplace_Active'
    }).sort({ createdAt: -1 });
    res.json(gems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// INVENTORY ENDPOINTS (Master Inventory — Internal + Public)
// ═════════════════════════════════════════════════════════════════════════════

// READ ALL INVENTORY GEMS (Master Inventory) — seller can see own + status, admin can see all
// READ all gems in master inventory — admin sees all, sellers see only their own
exports.getInventoryGems = async (req, res) => {
  try {
    console.log('[getInventoryGems] Request received at:', req.originalUrl);
    console.log('[getInventoryGems] User:', req.user);
    
    let query = {};
    
    // Sellers only see their own gems, admins see all
    if (req.user.role === 'seller') {
      query.seller_id = req.user.id;
    }
    
    console.log('[getInventoryGems] Query:', query);
    
    // Return ALL gems (internal, marketplace, sold) — let frontend filter by listing_status
    const gems = await Gem.find(query).sort({ createdAt: -1 });
    console.log('[getInventoryGems] Gems found:', gems.length);
    res.json(gems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// READ MARKETPLACE-ONLY GEMS — for seller dashboard, showing only active marketplace listings
exports.getMarketplaceInventoryGems = async (req, res) => {
  try {
    let query = {
      status: 'Active',
      listing_status: 'Marketplace_Active'
    };
    
    // Sellers only see their own marketplace listings
    if (req.user.role === 'seller') {
      query.seller_id = req.user.id;
    }
    
    const gems = await Gem.find(query).sort({ createdAt: -1 });
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
    console.log('[updateGem] ====== UPDATE REQUEST ======');
    console.log('[updateGem] Gem ID:', req.params.id);
    console.log('[updateGem] Update data:', req.body);
    console.log('[updateGem] User:', { id: req.user.id, role: req.user.role });
    
    const gem = await Gem.findById(req.params.id);
    if (!gem) return res.status(404).json({ message: 'Gem not found' });

    // Admin can edit any, seller only their own
    if (req.user.role !== 'admin' && gem.seller_id.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorized' });

    let updateData = { ...req.body };

    // Check if this is a promotion to marketplace
    const targetListing = updateData.listing_status || gem.listing_status;
    const isPromotingToMarketplace = targetListing === 'Marketplace_Active';
    
    console.log('[updateGem] Current listing status:', gem.listing_status);
    console.log('[updateGem] Target listing status:', targetListing);
    console.log('[updateGem] Is promoting to marketplace:', isPromotingToMarketplace);

    // SECURITY: Only enforce strict base_price validation for marketplace gems
    if (updateData.base_price !== undefined) {
      const updatedPrice = parseFloat(updateData.base_price);
      
      // For marketplace gems, price must be > 0
      if (isPromotingToMarketplace && (!Number.isFinite(updatedPrice) || updatedPrice <= 0)) {
        console.log('[updateGem] ERROR: Invalid price for marketplace promotion');
        return res.status(400).json({ message: 'Base price must be greater than zero for marketplace gems.' });
      }
      
      updateData.base_price = updatedPrice;
    }
    
    if (updateData.weight_carats !== undefined) {
      const updatedWeight = parseFloat(updateData.weight_carats);
      if (!Number.isFinite(updatedWeight) || updatedWeight <= 0) {
        console.log('[updateGem] ERROR: Invalid weight');
        return res.status(400).json({ message: 'Weight must be greater than zero carats.' });
      }
      updateData.weight_carats = updatedWeight;
    }

    if (req.file) {
      updateData.image_url = `uploads/${req.file.filename}`;
      console.log('[updateGem] Image uploaded:', updateData.image_url);
    }

    console.log('[updateGem] Final update data:', JSON.stringify(updateData, null, 2));

    const updated = await Gem.findByIdAndUpdate(req.params.id, updateData, { new: true });
    console.log('[updateGem] Gem updated successfully');
    res.json(updated);
  } catch (err) {
    console.error('[updateGem] ERROR:', err);
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

// UPDATE gem listing_status — publish to marketplace or revert to internal
exports.updateListingStatus = async (req, res) => {
  try {
    const { listing_status } = req.body;
    const allowed = ['Internal_Inventory', 'Marketplace_Active', 'Pending_Review'];
    
    if (!allowed.includes(listing_status)) {
      return res.status(400).json({ message: 'Invalid listing status' });
    }

    const gem = await Gem.findById(req.params.id);
    if (!gem) return res.status(404).json({ message: 'Gem not found' });

    // Check ownership: seller can only update own, admin can update any
    if (req.user.role !== 'admin' && gem.seller_id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Prevent publishing if gem is already Sold
    if (gem.status === 'Sold') {
      return res.status(400).json({ message: 'Cannot change listing status of a sold gem' });
    }

    const updated = await Gem.findByIdAndUpdate(
      req.params.id,
      { listing_status },
      { new: true }
    );
    
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// SYNC: Mark gem as SOLD with listing_status update
// Called when a transaction completes (via payment controller)
exports.markGemAsSold = async (req, res) => {
  try {
    const { gem_id } = req.body;
    
    const gem = await Gem.findById(gem_id);
    if (!gem) return res.status(404).json({ message: 'Gem not found' });

    const updated = await Gem.findByIdAndUpdate(
      gem_id,
      { 
        status: 'Sold',
        listing_status: 'Sold' // Update both status and listing_status
      },
      { new: true }
    );

    res.json({ message: 'Gem marked as sold', gem: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE gem
exports.deleteGem = async (req, res) => {
  try {
    console.log('[deleteGem] ====== DELETE REQUEST ======');
    console.log('[deleteGem] Gem ID:', req.params.id);
    console.log('[deleteGem] User:', { id: req.user.id, role: req.user.role });

    const gem = await Gem.findById(req.params.id);
    if (!gem) return res.status(404).json({ message: 'Gem not found' });

    // Admin can delete any, seller only their own
    if (req.user.role !== 'admin' && gem.seller_id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    console.log('[deleteGem] Gem found:', { id: gem._id, name: gem.name, inventory_id: gem.inventory_id });

    // CRITICAL FIX: If this gem is linked to an inventory item, restore it to 'Available' status
    if (gem.inventory_id) {
      const Inventory = require('../models/Inventory');
      const updated = await Inventory.findByIdAndUpdate(
        gem.inventory_id,
        { status: 'Available' },
        { new: true }
      );
      console.log('[deleteGem] Inventory item restored to Available:', { 
        inventory_id: gem.inventory_id, 
        new_status: updated?.status 
      });
    }

    await gem.deleteOne();
    console.log('[deleteGem] Gem deleted successfully');
    res.json({ message: 'Gem deleted and inventory restored' });
  } catch (err) {
    console.error('[deleteGem] ERROR:', err);
    res.status(500).json({ message: err.message });
  }
};