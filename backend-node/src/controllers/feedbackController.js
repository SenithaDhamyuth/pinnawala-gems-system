const Feedback = require('../models/Feedback');

exports.submitFeedback = async (req, res) => {
  try {
    const { rating, message } = req.body;
    const { id: user_id, email, role: user_role } = req.user;

    // Validate input
    if (!rating || !message || message.trim() === '') {
      return res.status(400).json({ message: 'Rating and message are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Create new feedback
    const feedback = new Feedback({
      user_id,
      user_name: email.split('@')[0],
      user_role,
      rating,
      message: message.trim()
    });

    await feedback.save();
    res.status(201).json({ success: true, feedback });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getAllFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find()
      .sort({ createdAt: -1 })
      .populate('user_id', 'full_name email');
    
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
