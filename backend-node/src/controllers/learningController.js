const Learning = require('../models/Learning');

// ─────────────────────────────────────────────────────────────────────────────
// Helper — strip Mongoose internals
// ─────────────────────────────────────────────────────────────────────────────
const fmt = (doc) => {
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  obj.id = obj._id.toString();
  delete obj._id;
  delete obj.__v;
  return obj;
};

// ═════════════════════════════════════════════════════════════════════════════
// PUBLIC
// ═════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/learning
 * Returns all PUBLISHED content.
 * Optional query params:
 *   ?category=Gemology
 *   ?content_type=video
 *   ?q=sapphire          (title/description full-text search)
 */
exports.getAllContent = async (req, res) => {
  try {
    const filter = { is_published: true };

    if (req.query.category)     filter.category     = req.query.category;
    if (req.query.content_type) filter.content_type = req.query.content_type;
    if (req.query.q) {
      const regex = new RegExp(req.query.q, 'i');
      filter.$or = [{ title: regex }, { description: regex }, { tags: regex }];
    }

    const items = await Learning.find(filter)
      .sort({ createdAt: -1 })
      .populate('author', 'full_name email');

    return res.json(items.map(fmt));
  } catch (err) {
    console.error('[getAllContent]', err);
    return res.status(500).json({ detail: 'Failed to fetch content' });
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// ADMIN
// ═════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/learning/admin/all
 * Returns ALL content (published + unpublished) for the admin panel.
 */
exports.getAdminContent = async (req, res) => {
  try {
    const filter = {};
    if (req.query.category)     filter.category     = req.query.category;
    if (req.query.content_type) filter.content_type = req.query.content_type;
    if (req.query.is_published !== undefined) {
      filter.is_published = req.query.is_published === 'true';
    }

    const items = await Learning.find(filter)
      .sort({ createdAt: -1 })
      .populate('author', 'full_name email');

    return res.json(items.map(fmt));
  } catch (err) {
    console.error('[getAdminContent]', err);
    return res.status(500).json({ detail: 'Failed to fetch content' });
  }
};

/**
 * POST /api/learning
 * Admin creates a new learning item.
 * Body: { title, description, category, content_type, content_url, thumbnail_url, is_published, tags, duration }
 */
exports.createContent = async (req, res) => {
  try {
    const {
      title, description, category, content_type,
      content_url, thumbnail_url, is_published, tags, duration,
    } = req.body;

    if (!title || !description || !category || !content_url) {
      return res.status(400).json({ detail: 'title, description, category, and content_url are required' });
    }

    const adminId = req.user.id || req.user._id;

    const item = new Learning({
      title,
      description,
      category,
      content_type: content_type || 'video',
      content_url,
      thumbnail_url: thumbnail_url || '',
      author: adminId,
      is_published: is_published ?? false,
      tags: tags || [],
      duration: duration || '',
    });

    await item.save();
    return res.status(201).json(fmt(item));
  } catch (err) {
    console.error('[createContent]', err);
    return res.status(500).json({ detail: 'Failed to create content' });
  }
};

/**
 * PUT /api/learning/:id
 * Admin updates an existing learning item.
 */
exports.updateContent = async (req, res) => {
  try {
    const item = await Learning.findById(req.params.id);
    if (!item) return res.status(404).json({ detail: 'Content not found' });

    const ALLOWED = [
      'title', 'description', 'category', 'content_type',
      'content_url', 'thumbnail_url', 'is_published', 'tags', 'duration',
    ];

    ALLOWED.forEach((key) => {
      if (req.body[key] !== undefined) item[key] = req.body[key];
    });

    await item.save();
    return res.json(fmt(item));
  } catch (err) {
    console.error('[updateContent]', err);
    return res.status(500).json({ detail: 'Failed to update content' });
  }
};

/**
 * DELETE /api/learning/:id
 * Admin deletes a learning item permanently.
 */
exports.deleteContent = async (req, res) => {
  try {
    const item = await Learning.findById(req.params.id);
    if (!item) return res.status(404).json({ detail: 'Content not found' });

    await item.deleteOne();
    return res.json({ message: 'Content deleted', id: req.params.id });
  } catch (err) {
    console.error('[deleteContent]', err);
    return res.status(500).json({ detail: 'Failed to delete content' });
  }
};

/**
 * PATCH /api/learning/:id/publish
 * Admin toggles the is_published flag.
 */
exports.togglePublish = async (req, res) => {
  try {
    const item = await Learning.findById(req.params.id);
    if (!item) return res.status(404).json({ detail: 'Content not found' });

    item.is_published = !item.is_published;
    await item.save();
    return res.json(fmt(item));
  } catch (err) {
    console.error('[togglePublish]', err);
    return res.status(500).json({ detail: 'Failed to toggle publish status' });
  }
};
