const User = require('../models/User');
const { uploadProfile } = require('../middleware/uploadMiddleware');

// Exported multer middleware for the shop logo upload (single file, field: 'shopLogo')
exports.uploadShopLogo = uploadProfile.single('shopLogo');

// GET /api/users - Fetches all users (exclude passwords)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password -kyc_documents');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/users/:id/approve - Approves a seller by setting kycStatus to 'Approved'
exports.approveSeller = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Only allow approving sellers
    if (user.role !== 'seller') {
      return res.status(400).json({ message: 'Only sellers can be approved' });
    }
    user.kycStatus = 'Approved';
    await user.save();
    res.json({ message: 'Seller approved successfully', user: { id: user._id, full_name: user.full_name, email: user.email, role: user.role, kycStatus: user.kycStatus } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/users/shop-update — Seller updates their own shop profile
exports.updateShopProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Only sellers (or admin) can call this endpoint
    if (req.user.role !== 'seller' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only sellers can update shop profiles' });
    }

    const updateData = {};
    const { shopName, shopDescription } = req.body;

    if (shopName  !== undefined) updateData.shopName = shopName.trim();
    // shopDescription maps to the existing `bio` field in the User schema
    if (shopDescription !== undefined) updateData.bio = shopDescription.trim();

    // Handle uploaded logo file
    if (req.file) {
      updateData.shopLogo = req.file.path;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: false }
    ).select('-password -kyc_documents');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Shop profile updated successfully',
      shop: {
        shopName:        user.shopName,
        shopLogo:        user.shopLogo,
        shopDescription: user.bio,
        sellerId:        user._id
      }
    });
  } catch (err) {
    console.error('[updateShopProfile] Error:', err);
    res.status(500).json({ message: err.message });
  }
};