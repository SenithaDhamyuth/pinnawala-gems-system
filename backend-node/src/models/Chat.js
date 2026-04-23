const mongoose = require('mongoose');

// A "room" is one conversation thread between a buyer and a seller about
// a specific gem. roomId format: "gemId_buyerId_sellerId" — built on
// both the frontend and backend so the two sides always join the same room.

const messageSchema = new mongoose.Schema({
  sender_id:   { type: String, required: true },   // user._id as string
  sender_name: { type: String, required: true },
  sender_role: { type: String, enum: ['buyer', 'seller', 'admin'], required: true },
  text:        { type: String, required: true },    // already masked before saving if type="message"
  type:        { type: String, enum: ['message', 'image'], default: 'message' },
  is_read:     { type: Boolean, default: false },
  reactions:   { type: [{ emoji: String, user_id: String }], default: [] },
  is_deleted:  { type: Boolean, default: false },
  createdAt:   { type: Date, default: Date.now },
});

const noteSchema = new mongoose.Schema({
  user_id:     { type: String, required: true },
  text:        { type: String, default: '' },
  image_url:   { type: String },
  created_at:  { type: Date, default: Date.now },
});

const chatSchema = new mongoose.Schema({
  room_id:       { type: String, required: true, unique: true, index: true },
  gem_id:        { type: mongoose.Schema.Types.ObjectId, ref: 'Gem', required: false },
  gem_name:      { type: String },
  gem_image_url: { type: String },   // thumbnail shown in admin chat list
  buyer_id:      { type: String, required: true },
  seller_id:     { type: String, required: true },
  isSupport:   { type: Boolean, default: false },
  isDirectAdmin: { type: Boolean, default: false },
  supportCategory: { type: String, default: '' },
  messages:    { type: [messageSchema], default: [] },
  notes:       { type: [noteSchema], default: [] },
  labels: [{ 
    name:  { type: String },
    color: { type: String } 
  }],
  category: { type: String, default: 'Inbox' }
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);