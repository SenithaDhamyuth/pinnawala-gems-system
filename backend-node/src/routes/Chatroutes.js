const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const path    = require('path');
const { 
  getRoomHistory, 
  getMyRooms, 
  getOrCreateSupportRoom, 
  getOrCreateDirectAdminChat,
  deleteFolder,
  addLabel,
  removeLabel,
  moveRoomToFolder,
  markRoomAsRead
} = require('../controllers/Chatcontroller');
const { protect } = require('../middleware/authMiddleware');

// ── Multer Storage For Chat Images ──
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename:    (req, file, cb) => cb(null, `chat_${Date.now()}_${Math.round(Math.random()*1E5)}${path.extname(file.originalname)}`)
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase());
    ok ? cb(null, true) : cb(new Error('Only .jpg, .jpeg, .png, and .gif files are allowed'));
  }
});

// POST /api/chat/upload
router.post('/upload', protect, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const imageUrl = `http://localhost:5001/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});
router.post('/upload-image', protect, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const imageUrl = `http://localhost:5001/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

// Load message history for a specific room (buyer opens chat window → fetch old messages)
router.get('/room/:roomId', protect, getRoomHistory);

// List all rooms the current user is part of (seller/buyer chat list)
router.get('/my-rooms', protect, getMyRooms);
router.post('/direct-admin', protect, getOrCreateDirectAdminChat);
router.post('/support-room', protect, getOrCreateSupportRoom);

// Aliases for Frontend Compatibility
router.post('/admin-room', protect, getOrCreateDirectAdminChat);
router.get('/:roomId', protect, getRoomHistory);

// Folder & Label Management
router.put('/folder/delete', protect, deleteFolder);
router.put('/folder/move', protect, moveRoomToFolder);
router.put('/label/add', protect, addLabel);
router.put('/label/remove', protect, removeLabel);
router.put('/room/:roomId/mark-read', protect, markRoomAsRead);

module.exports = router;