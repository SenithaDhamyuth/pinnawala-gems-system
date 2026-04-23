const User = require('../models/User');

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