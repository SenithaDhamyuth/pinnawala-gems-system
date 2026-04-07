const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET || "pinnawala_secret_key_2026";

// Register User
exports.register = async (req, res) => {
  try {
    const { full_name, password, role } = req.body;
    const email = req.body.email?.toLowerCase().trim();

    if (!full_name || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered. Please login." });
    }

    // Hash password using bcryptjs
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      full_name,
      email,
      password: hashedPassword,
      role: role || 'buyer'
    });

    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("[Register Error]", error.message);
    res.status(500).json({ message: "Server error during registration.", error: error.message });
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase().trim();
    const { password } = req.body;

    // Find user (case-insensitive email match)
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`[Login] No user found for email: ${email}`);
      return res.status(400).json({ message: "No account found with that email. Please register." });
    }

    // Compare password using bcryptjs
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`[Login] Password mismatch for: ${email}`);
      return res.status(400).json({ message: "Incorrect password. Please try again." });
    }

    // Generate JWT with id, email, role
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      SECRET_KEY,
      { expiresIn: '1d', algorithm: 'HS256' }
    );

    console.log(`[Login] Success for: ${email} | role: ${user.role}`);
    res.status(200).json({
      token,
      role: user.role,
      name: user.full_name,
      email: user.email,
      kycStatus: user.kycStatus
    });
  } catch (error) {
    console.error("[Login Error]", error.message);
    res.status(500).json({ message: "Server error during login.", error: error.message });
  }
};
// Get all users — admin only
// ADMIN: Update user KYC status
exports.updateKYCStatus = async (req, res) => {
  try {
    const { kycStatus } = req.body;
    let updateFields = { kycStatus };
    if (kycStatus === 'Approved') {
      updateFields.role = 'seller';
    }
    const user = await User.findByIdAndUpdate(req.params.id, updateFields, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
};

// Seller uploads a document (Multer middleware handled the file)
exports.uploadKYC = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    
    // Save the file path to the user's kyc_documents array
    const filePath = `/uploads/kyc/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $push: { kyc_documents: filePath }, kycStatus: 'Pending' },
      { new: true }
    );

    // Notify ALL Admins
    const createNotification = req.app.get('createNotification');
    if (createNotification) {
      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
        await createNotification({
          recipient: admin._id,
          sender:    req.user.id,
          type:      'kyc',
          content:   `New KYC document uploaded by ${user.full_name}`,
          link:      `/admin/users` // Adjust as needed
        });
      }
    }
    
    res.json({ message: 'Document uploaded successfully', kycStatus: user.kycStatus, kyc_documents: user.kyc_documents });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
};
