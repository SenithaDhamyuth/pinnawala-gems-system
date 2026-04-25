const Ad = require('../models/Ad');
const { uploadAd } = require('../middleware/uploadMiddleware');

// Export the multer middleware so adRoutes.js can use it
exports.upload = uploadAd;

// --- Helper: build image_url from uploaded file or fallback to body ---
const resolveImageUrl = (req) => {
  if (req.file) {
    return req.file.path;
  }
  return req.body.image_url || '';
};

// GET all active ads — public marketplace
exports.getActiveAds = async (req, res) => {
  try {
    const ads = await Ad.find({ is_active: true, status: 'Active' }).sort({ createdAt: -1 });
    res.json(ads);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ads by position — public marketplace
exports.getAdsByPosition = async (req, res) => {
  try {
    const { position } = req.params;
    const ads = await Ad.find({ position, is_active: true, status: 'Active' }).sort({ createdAt: -1 });
    res.json(ads);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET all ads — admin only
exports.getAllAds = async (req, res) => {
  try {
    const ads = await Ad.find({}).sort({ createdAt: -1 });
    res.json(ads);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CREATE ad — supports multipart/form-data (file upload) OR application/json (image_url)
exports.createAd = async (req, res) => {
  try {
    const image_url = resolveImageUrl(req);

    if (!image_url) {
      return res.status(400).json({ message: 'An image file or image_url is required.' });
    }

    if (!req.body.title) {
      return res.status(400).json({ message: 'Title is required.' });
    }

    const ad = await Ad.create({
      title: req.body.title,
      image_url,
      link_url: req.body.link_url || '',
      position: req.body.position || 'Home_Top',
      is_active: req.body.is_active !== undefined ? req.body.is_active : true,
      target_gem_id: req.body.target_gem_id || null,
      status: req.body.status || 'Active',
    });

    res.status(201).json(ad);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// UPDATE ad — supports replacing image via file upload or keeping existing image_url
exports.updateAd = async (req, res) => {
  try {
    const existing = await Ad.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Ad not found' });

    const updateData = {
      title:          req.body.title          ?? existing.title,
      link_url:       req.body.link_url       ?? existing.link_url,
      position:       req.body.position       ?? existing.position,
      is_active:      req.body.is_active !== undefined ? req.body.is_active : existing.is_active,
      target_gem_id:  req.body.target_gem_id  ?? existing.target_gem_id,
      status:         req.body.status         ?? existing.status,
      // Only replace image_url if a new file was uploaded or a new URL was sent
      image_url: req.file
        ? req.file.path
        : req.body.image_url || existing.image_url,
    };

    const ad = await Ad.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(ad);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE ad
exports.deleteAd = async (req, res) => {
  try {
    const ad = await Ad.findByIdAndDelete(req.params.id);
    if (!ad) return res.status(404).json({ message: 'Ad not found' });
    res.json({ message: 'Ad deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};