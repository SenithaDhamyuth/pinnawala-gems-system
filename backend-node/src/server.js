require('dotenv').config();

const express    = require('express');
const userRoutes = require('./routes/userRoutes');
const http       = require('http');          // needed to attach Socket.io
const { Server } = require('socket.io');
const mongoose   = require('mongoose');
const cors       = require('cors');
const path       = require('path');
const jwt        = require('jsonwebtoken');


const authRoutes  = require('./routes/authRoutes');
const gemRoutes   = require('./routes/gemRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const offerRoutes = require('./routes/offerRoutes');
const adRoutes    = require('./routes/adRoutes');
const chatRoutes  = require('./routes/Chatroutes');
const notificationRoutes = require('./routes/notificationRoutes');
const sellerRoutes = require('./routes/sellerRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const auctionRoutes = require('./routes/auctionRoutes');
const bidRoutes = require('./routes/bidRoutes');
const settingRoutes = require('./routes/settingRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const learningRoutes = require('./routes/learningRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');

const Chat = require('./models/Chat');
const Offer = require('./models/Offer');
const Gem   = require('./models/Gem');

const SECRET_KEY = process.env.JWT_SECRET || 'pinnawala_secret_key_2026';

// ─────────────────────────────────────────────────────────────────────────────
// 1.  Express app + HTTP server (Socket.io needs the raw http.Server)
// ─────────────────────────────────────────────────────────────────────────────
const app    = express();
const server = http.createServer(app);

// ─────────────────────────────────────────────────────────────────────────────
// 2.  Socket.io — allow the React dev server origin
// ─────────────────────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Map of userId -> number of active sockets
const onlineUsers = new Map();

// ─────────────────────────────────────────────────────────────────────────────
// 3.  Data-masking filter
// ─────────────────────────────────────────────────────────────────────────────
const PHONE_REGEX = /(\+?[\d\s\-().]{7,}[\d])/g;
const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
const SL_PHONE_REGEX = /(0\d{9})|(\+94\d{9})|(\+94\s\d{2}\s\d{3}\s\d{4})|(\d{2}-\d{7})/g;

function maskSensitiveData(text) {
  return text; // Data masking completely disabled per user instruction
}

// ─────────────────────────────────────────────────────────────────────────────
// 4.  Socket.io middleware — authenticate every socket connection via JWT
// ─────────────────────────────────────────────────────────────────────────────
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Authentication required'));
  try {
    const decoded = jwt.verify(token, SECRET_KEY, { algorithms: ['HS256'] });
    socket.user = decoded;  // { id, email, role }
    next();
  } catch {
    next(new Error('Invalid or expired token'));
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 5.  Socket.io events
// ─────────────────────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  const { id: userId, email, role } = socket.user;
  console.log(`[Socket] Connected: ${email} (${role}) — socket ${socket.id}`);

  // Track online presence
  const currentCount = onlineUsers.get(userId) || 0;
  onlineUsers.set(userId, currentCount + 1);
  if (currentCount === 0) {
    io.emit('user_online', userId);
  }
  socket.emit('sync_online_users', Array.from(onlineUsers.keys()));

  // Join personal room for notifications
  socket.join(`user_${userId}`);

  // ── join_room ──────────────────────────────────────────────────────────────
  socket.on('join_room', async ({ room_id, gem_id, gem_name, gem_image_url, buyer_id, seller_id }) => {
    if (role !== 'admin' && userId !== buyer_id && userId !== seller_id) {
       console.warn(`[Socket] Unauthorized join attempt to ${room_id} by ${email}`);
       return;
    }

    socket.join(room_id);
    console.log(`[Socket] ${email} joined room ${room_id}`);

     // Fix for BSON error: prevent invalid gem_id values like "admin" from being saved as ObjectId
     const validGemId = gem_id && typeof gem_id === 'string' && gem_id !== 'admin' && gem_id.length === 24 ? gem_id : null;
     if (validGemId && buyer_id && seller_id) {
       try {
         await Chat.findOneAndUpdate(
           { room_id },
           { $setOnInsert: { room_id, gem_id: validGemId, gem_name, gem_image_url: gem_image_url || null, buyer_id, seller_id } },
           { upsert: true, returnDocument: 'after' }
         );
       } catch (err) {
         console.error('[Socket] Error upserting chat room:', err.message);
       }
     }
  });

  // ── send_message ───────────────────────────────────────────────────────────
  socket.on('send_message', async ({ room_id, text, type = 'message' }) => {
    if (!room_id || !text?.trim()) return;

    const safeText = type === 'image' ? text.trim() : maskSensitiveData(text.trim());

    const messageDoc = {
      _id:         new mongoose.Types.ObjectId(), 
      room_id:     room_id,
      sender_id:   userId,
      sender_name: email.split('@')[0],
      sender_role: role,
      text:        safeText,
      type:        type,
      is_read:     false,
      createdAt:   new Date(),
    };

    try {
      await Chat.findOneAndUpdate(
        { room_id },
        { $push: { messages: messageDoc } }
      );
    } catch (err) {
      console.error('[Socket] Failed to save message:', err.message);
    }

    io.to(room_id).emit('receive_message', messageDoc);

    // Create Notification
    try {
      const chat = await Chat.findOne({ room_id });
      if (chat) {
        const recipientId = userId === chat.buyer_id.toString() ? chat.seller_id : chat.buyer_id;
        const createNotification = app.get('createNotification');
        const label = chat.isSupport ? 'Support chat' : (chat.gem_name || 'chat');
        if (createNotification) {
          await createNotification({
            recipient: recipientId,
            sender: userId,
            type: 'message',
            content: type === 'image'
              ? `Sent an image in ${label}`
              : `New message in ${label}: "${safeText.substring(0, 30)}${safeText.length > 30 ? '...' : ''}"`,
            link: `/messages?room=${room_id}`
          });
        }
      }
    } catch (err) {
      console.error('[Socket Notification] Error:', err.message);
    }
  });

  // ── mark_read ──────────────────────────────────────────────────────────────
  socket.on('mark_read', async ({ room_id }) => {
    if (!room_id) return;
    try {
      await Chat.updateOne(
        { room_id },
        { $set: { "messages.$[elem].is_read": true } },
        { arrayFilters: [{ "elem.sender_id": { $ne: userId }, "elem.is_read": false }], multi: true }
      );
      io.to(room_id).emit('messages_read', { reader_id: userId });
    } catch (err) {
      console.error('[Socket] Failed to mark read:', err.message);
    }
  });

  // ── delete_message ─────────────────────────────────────────────────────────
  socket.on('delete_message', async ({ room_id, message_id }) => {
    if (!room_id || !message_id) return;
    try {
      const chat = await Chat.findOne({ room_id });
      if (!chat) return;
      
      // FIXED BUG: 'msg' was undefined here in the original code
      const msg = chat.messages.id(message_id); 
      
      if (msg && msg.sender_id === userId) {
        msg.is_deleted = true;
        msg.text = 'This message was deleted';
        await chat.save();
        io.to(room_id).emit('message_deleted', { message_id, text: msg.text });
      }
    } catch (err) {
      console.error('[Socket] Failed to delete message:', err.message);
    }
  });

  // ── add_reaction alias (react_message) ───────────────────────────────────
  socket.on('react_message', async ({ room_id, message_id, emoji }) => {
    if (!room_id || !message_id || !emoji) return;
    try {
      const chat = await Chat.findOne({ room_id });
      if (!chat) return;

      const msg = chat.messages.id(message_id);
      if (!msg || msg.is_deleted) return;

      const existingReactionIndex = msg.reactions.findIndex(r => r.user_id === userId && r.emoji === emoji);
      if (existingReactionIndex > -1) {
         msg.reactions.splice(existingReactionIndex, 1);
      } else {
         msg.reactions.push({ emoji, user_id: userId });
      }

      await chat.save();
      io.to(room_id).emit('reaction_updated', { message_id, reactions: msg.reactions });
    } catch (err) {
      console.error('[Socket] Failed to add reaction:', err.message);
    }
  });

  // ── CRM: update_labels ──────────────────────────────────────────────────────
  socket.on('update_labels', async ({ room_id, labels }) => {
    if (!room_id) return;
    try {
      await Chat.updateOne({ room_id }, { $set: { labels } });
      io.to(room_id).emit('labels_updated', { room_id, labels });
    } catch (err) {
      console.error('[Socket] Failed to update labels:', err.message);
    }
  });

  // ── CRM: update_category ────────────────────────────────────────────────────
  socket.on('update_category', async ({ room_id, category }) => {
    if (!room_id) return;
    try {
      await Chat.updateOne({ room_id }, { $set: { category } });
      io.to(room_id).emit('category_updated', { room_id, category });
    } catch (err) {
      console.error('[Socket] Failed to update category:', err.message);
    }
  });

  // ── add_reaction ───────────────────────────────────────────────────────────
  socket.on('add_reaction', async ({ room_id, message_id, emoji }) => {
    if (!room_id || !message_id || !emoji) return;
    try {
      const chat = await Chat.findOne({ room_id });
      if (!chat) return;

      const msg = chat.messages.id(message_id);
      if (!msg) return;

      const existingReactionIndex = msg.reactions.findIndex(r => r.user_id === userId && r.emoji === emoji);
      
      if (existingReactionIndex > -1) {
         msg.reactions.splice(existingReactionIndex, 1);
      } else {
         msg.reactions.push({ emoji, user_id: userId });
      }

      await chat.save();
      io.to(room_id).emit('reaction_updated', { message_id, reactions: msg.reactions });
    } catch (err) {
      console.error('[Socket] Failed to add reaction:', err.message);
    }
  });

  // ── CRM: add_note ──────────────────────────────────────────────────────────
  socket.on('add_note', async ({ room_id, text, image_url }) => {
    if (!room_id || (!text && !image_url)) return;
    try {
      const safeText = typeof text === 'string' ? maskSensitiveData(text.trim()) : text;
      const note = { user_id: userId, text: safeText || '', image_url, created_at: new Date() };
      const chat = await Chat.findOneAndUpdate(
        { room_id },
        { $push: { notes: note } },
        { returnDocument: 'after' }
      );
      const savedNote = chat.notes[chat.notes.length - 1];
      socket.emit('note_added', { room_id, note: savedNote });
    } catch (err) {
      console.error('[Socket] Failed to add note:', err.message);
    }
  });

  // ── CRM: save_note (autosave) ─────────────────────────────────────────────
  socket.on('save_note', async ({ room_id, text, image_url }) => {
    if (!room_id || ((!text?.trim()) && !image_url)) return;
    try {
      const safeText = typeof text === 'string' ? maskSensitiveData(text.trim()) : text;
      const note = { user_id: userId, text: safeText || '', image_url, created_at: new Date() };
      const chat = await Chat.findOneAndUpdate(
        { room_id },
        { $push: { notes: note } },
        { returnDocument: 'after' }
      );
      const savedNote = chat.notes[chat.notes.length - 1];
      socket.emit('note_added', { room_id, note: savedNote });
    } catch (err) {
      console.error('[Socket] Failed to save note:', err.message);
    }
  });

  // ── CRM: delete_note ───────────────────────────────────────────────────────
  socket.on('delete_note', async ({ room_id, note_id }) => {
    if (!room_id || !note_id) return;
    try {
      await Chat.updateOne(
        { room_id },
        { $pull: { notes: { _id: note_id, user_id: userId } } }
      );
      socket.emit('note_deleted', { room_id, note_id });
    } catch (err) {
      console.error('[Socket] Failed to delete note:', err.message);
    }
  });

  // ── accept_offer ───────────────────────────────────────────────────────────
  socket.on('accept_offer', async ({ offer_id }) => {
    try {
      const offer = await Offer.findById(offer_id);
      if (!offer) return;
      if (offer.seller_id.toString() !== userId && role !== 'admin') return;

      const buyerRoom = `user_${offer.buyer_id}`;

      io.to(buyerRoom).emit('cart_update', {
        gem_id:            offer.gem_id.toString(),
        gem_name:          offer.gem_name,
        negotiated_price:  offer.offer_amount,
        offer_id:          offer._id.toString(),
        status:            'Accepted',
      });

      console.log(`[Socket] cart_update emitted to buyer ${offer.buyer_id}`);
    } catch (err) {
      console.error('[Socket] accept_offer error:', err.message);
    }
  });

  // ── typing indicator ───────────────────────────────────────────────────────
  socket.on('typing', ({ room_id }) => {
    socket.to(room_id).emit('user_typing', { sender_id: userId, sender_role: role });
  });

  socket.on('stop_typing', ({ room_id }) => {
    socket.to(room_id).emit('user_stop_typing', { sender_id: userId });
  });

  // ── disconnect ─────────────────────────────────────────────────────────────
  socket.on('disconnect', () => {
    console.log(`[Socket] Disconnected: ${email}`);
    const currentCount = onlineUsers.get(userId) || 0;
    if (currentCount <= 1) {
      onlineUsers.delete(userId);
      io.emit('user_offline', userId);
    } else {
      onlineUsers.set(userId, currentCount - 1);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6.  Express middleware & REST routes
// ─────────────────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth',   authRoutes);
app.use('/api/gems',   gemRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/ads',    adRoutes);
app.use('/api/chat',   chatRoutes);
app.use('/api/messages', chatRoutes); 
app.use('/api/notifications', notificationRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/users', userRoutes);

// ─────────────────────────────────────────────────────────────────────────────
// 7.  Export io so offerController can emit cart_update via REST path too
// ─────────────────────────────────────────────────────────────────────────────
app.set('io', io);

// Notification Helper
const Notification = require('./models/Notification');
async function createNotification({ recipient, sender, type, content, link }) {
  try {
    const notification = new Notification({ recipient, sender, type, content, link });
    await notification.save();
    
    io.to(`user_${recipient}`).emit('new_notification', {
      ...notification.toObject(),
      sender_name: sender ? 'Someone' : 'System' 
    });
    return notification;
  } catch (err) {
    console.error('[Notification Helper] Error:', err.message);
  }
}
app.set('createNotification', createNotification);

// ─────────────────────────────────────────────────────────────────────────────
// 8.  Connect to MongoDB then start the HTTP server
// ─────────────────────────────────────────────────────────────────────────────
// FIXED BUG: Changed MONGODB_URI to MONGO_URI to match your .env file
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('🔥 MongoDB Atlas Connected Perfectly!');
    server.listen(process.env.PORT || 5001, () =>
      console.log(`Server + Socket.io running on port ${process.env.PORT || 5001}`)
    );
  })
  .catch(err => console.error('[MongoDB] Connection error:', err));