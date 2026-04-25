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

const { uploadChat } = require('../middleware/uploadMiddleware');

// POST /api/chat/upload
router.post('/upload', protect, uploadChat.array('images', 3), (req, res) => {
  if (!req.files || req.files.length === 0) return res.status(400).json({ message: 'No images uploaded' });
  const imageUrls = req.files.map(file => file.path);
  res.json({ imageUrls });
});
router.post('/upload-image', protect, uploadChat.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  res.json({ imageUrl: req.file.path });
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