const User = require('../models/User');
const { uploadProfile } = require('../middleware/uploadMiddleware');

const upload = uploadProfile;

exports.updateProfile = async (req, res) => {
  try {
    console.log('🔍 DEBUG: Profile update request received');
    console.log('🔍 DEBUG: Request body fields:', Object.keys(req.body));
    console.log('🔍 DEBUG: Files:', req.files ? Object.keys(req.files) : 'No files');
    
    const userId = req.user.id;
    const updateData = {};

    // Handle basic text fields
    const {
      shopName,
      address,
      bio,
      policies,
      welcomeNote,
      theme,
      businessHours,
      socialLinks,
      badges,
      featuredGems
    } = req.body;

    console.log('🔍 DEBUG: Parsed fields:', {
      shopName, address, bio, policies, welcomeNote,
      theme, businessHours, socialLinks, badges, featuredGems
    });

    if (shopName) updateData.shopName = shopName;
    if (address) updateData.address = address;
    if (bio) updateData.bio = bio;
    if (policies) updateData.policies = policies;
    if (welcomeNote) updateData.welcomeNote = welcomeNote;

    // Parse JSON fields
    if (theme) {
      try {
        updateData.theme = typeof theme === 'string' ? JSON.parse(theme) : theme;
      } catch (e) {
        console.error('Error parsing theme:', e);
        return res.status(400).json({ message: 'Invalid theme format', error: e.message });
      }
    }

    if (businessHours) {
      try {
        updateData.businessHours = typeof businessHours === 'string' ? JSON.parse(businessHours) : businessHours;
      } catch (e) {
        console.error('Error parsing businessHours:', e);
        return res.status(400).json({ message: 'Invalid businessHours format', error: e.message });
      }
    }

    if (socialLinks) {
      try {
        updateData.socialLinks = typeof socialLinks === 'string' ? JSON.parse(socialLinks) : socialLinks;
      } catch (e) {
        console.error('Error parsing socialLinks:', e);
        return res.status(400).json({ message: 'Invalid socialLinks format', error: e.message });
      }
    }

    if (badges) {
      try {
        updateData.badges = typeof badges === 'string' ? JSON.parse(badges) : badges;
      } catch (e) {
        console.error('Error parsing badges:', e);
        return res.status(400).json({ message: 'Invalid badges format', error: e.message });
      }
    }

    if (featuredGems) {
      try {
        updateData.featuredGems = typeof featuredGems === 'string' ? JSON.parse(featuredGems) : featuredGems;
      } catch (e) {
        console.error('Error parsing featuredGems:', e);
        return res.status(400).json({ message: 'Invalid featuredGems format', error: e.message });
      }
    }

    // Handle file uploads
    if (req.files) {
      if (req.files.shopLogo && req.files.shopLogo[0]) {
        updateData.shopLogo = req.files.shopLogo[0].path;
      }

      if (req.files.bannerImage && req.files.bannerImage[0]) {
        if (!updateData.theme) updateData.theme = {};
        updateData.theme.bannerImage = req.files.bannerImage[0].path;
      }
    }

    console.log('🔍 DEBUG: Final updateData:', updateData);

    // Update user profile
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { returnDocument: 'after', runValidators: false }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('🔍 DEBUG: Profile updated successfully');
    res.json({ 
      message: 'Profile updated successfully', 
      user: {
        shopName: user.shopName,
        shopLogo: user.shopLogo,
        bio: user.bio,
        theme: user.theme,
        businessHours: user.businessHours,
        socialLinks: user.socialLinks,
        policies: user.policies,
        badges: user.badges,
        welcomeNote: user.welcomeNote,
        featuredGems: user.featuredGems
      }
    });
  } catch (err) {
    console.error('🔍 DEBUG: Error updating profile:', err);
    console.error('🔍 DEBUG: Error stack:', err.stack);
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
};

// Middleware for handling file uploads
exports.uploadFiles = upload.fields([
  { name: 'shopLogo', maxCount: 1 },
  { name: 'bannerImage', maxCount: 1 }
]);

exports.getStorefront = async (req, res) => {
  try {
    const seller = await User.findById(req.params.id)
      .select('full_name email shopName shopLogo address bio theme businessHours socialLinks policies badges welcomeNote featuredGems role');
    
    if (!seller || seller.role !== 'seller') {
      return res.status(404).json({ message: 'Seller not found' });
    }

    res.json(seller);
  } catch (err) {
    console.error('Error fetching storefront:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getSellerDirectory = async (req, res) => {
  try {
    const sellers = await User.find({ role: 'seller', kycStatus: 'Approved' })
      .select('shopName shopLogo bio _id');
    res.json(sellers);
  } catch (err) {
    console.error('Error fetching seller directory:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
