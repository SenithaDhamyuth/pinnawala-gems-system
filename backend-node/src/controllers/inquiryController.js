const Inquiry = require('../models/Inquiry');

const formatInquiry = (doc, isAdmin = false) => {
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  obj.id = obj._id.toString();
  delete obj._id;
  delete obj.__v;
  if (!isAdmin) {
    obj.messages = (obj.messages || []).filter(m => !m.is_internal);
  }
  return obj;
};

// POST /api/inquiries
exports.createInquiry = async (req, res) => {
  try {
    const { subject, category, priority, message } = req.body;
    if (!subject || !category) {
      return res.status(400).json({ detail: 'Subject and category are required.' });
    }

    const inquiry = new Inquiry({
      user_id:  req.user.id,
      subject:  subject.trim(),
      category,
      priority: priority || 'Medium',
      messages: [],
    });

    await inquiry.save();

    if (message && message.trim()) {
      await Inquiry.updateOne(
        { _id: inquiry._id },
        { $push: { messages: {
          sender:      req.user.email,
          text:        message.trim(),
          is_internal: false,
          timestamp:   new Date(),
        }}}
      );
    }

    const created = await Inquiry.findById(inquiry._id).populate('user_id', 'full_name email');
    res.status(201).json(formatInquiry(created));
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
};

// GET /api/inquiries
exports.getInquiries = async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const query   = isAdmin ? {} : { user_id: req.user.id };

    const inquiries = await Inquiry.find(query)
      .populate('user_id', 'full_name email')
      .sort({ createdAt: -1 });

    res.json(inquiries.map(i => formatInquiry(i, isAdmin)));
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
};

// GET /api/inquiries/:id
exports.getInquiry = async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const inquiry = await Inquiry.findById(req.params.id).populate('user_id', 'full_name email');
    if (!inquiry) return res.status(404).json({ detail: 'Ticket not found.' });

    if (!isAdmin && inquiry.user_id._id.toString() !== req.user.id) {
      return res.status(403).json({ detail: 'Access denied.' });
    }

    res.json(formatInquiry(inquiry, isAdmin));
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
};

// POST /api/inquiries/:id/messages
exports.addMessage = async (req, res) => {
  try {
    const { text, is_internal } = req.body;
    const isAdmin = req.user.role === 'admin';

    if (!text || !text.trim()) {
      return res.status(400).json({ detail: 'Message text is required.' });
    }
    if (is_internal && !isAdmin) {
      return res.status(403).json({ detail: 'Only admins can post internal notes.' });
    }

    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) return res.status(404).json({ detail: 'Ticket not found.' });

    if (!isAdmin && inquiry.user_id.toString() !== req.user.id) {
      return res.status(403).json({ detail: 'Access denied.' });
    }

    const newStatus = isAdmin && inquiry.status === 'Open' ? 'In Progress' : inquiry.status;

    await Inquiry.updateOne(
      { _id: inquiry._id },
      {
        $push: { messages: {
          sender:      req.user.email,
          text:        text.trim(),
          is_internal: isAdmin ? !!is_internal : false,
          timestamp:   new Date(),
        }},
        $set: { status: newStatus },
      }
    );

    const updated = await Inquiry.findById(inquiry._id).populate('user_id', 'full_name email');
    res.json(formatInquiry(updated, isAdmin));
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
};

// PATCH /api/inquiries/:id — admin only
exports.updateInquiry = async (req, res) => {
  try {
    const allowed = ['status', 'priority'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k]) updates[k] = req.body[k]; });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ detail: 'No valid fields to update.' });
    }

    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    ).populate('user_id', 'full_name email');

    if (!inquiry) return res.status(404).json({ detail: 'Ticket not found.' });
    res.json(formatInquiry(inquiry, true));
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
};
