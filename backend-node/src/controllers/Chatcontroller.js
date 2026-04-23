const Chat = require('../models/Chat');
const User = require('../models/User');

// GET /api/chat/:roomId
// Returns the full message history for a room.
exports.getRoomHistory = async (req, res) => {
  try {
    const chat = await Chat.findOne({ room_id: req.params.roomId }).lean();
    if (!chat) return res.json({ room_id: req.params.roomId, messages: [] });
    
    // SECURITY FIX: Check if the user is a participant OR an admin
    const userId = req.user.id;
    const isParticipant = String(chat.buyer_id) === userId || String(chat.seller_id) === userId;
    const isAdmin = req.user.role === 'admin';

    if (!isParticipant && !isAdmin) {
      return res.status(403).json({ message: 'Unauthorized: You do not have access to this chat room' });
    }
    
    // Privacy rule: users can only fetch their own private notes
    if (chat.notes) {
      chat.notes = chat.notes.filter(note => note.user_id === req.user.id);
    }
    
    res.json(chat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/chat/my-rooms
// Returns all chat rooms that involve the currently logged-in user
exports.getMyRooms = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // SECURITY: This correctly filters only the logged-in user's chats
    const rooms = await Chat.find({
      $or: [{ buyer_id: userId }, { seller_id: userId }]
    })
      .select('room_id gem_id gem_name gem_image_url buyer_id seller_id messages labels category isSupport isDirectAdmin updatedAt')
      .sort({ updatedAt: -1 });

    // Batch-load all unique user IDs so we can attach other_party_name / other_party_role
    const allUserIds = [
      ...new Set(rooms.flatMap(r => [r.buyer_id, r.seller_id]).filter(Boolean))
    ];
    const users = await User.find({ _id: { $in: allUserIds } })
      .select('_id name email role')
      .lean();
    const userMap = {};
    users.forEach(u => { userMap[String(u._id)] = u; });

    // Return each room with last message preview + other party info
    const preview = rooms.map(r => {
      const otherPartyId = String(r.buyer_id) === userId ? String(r.seller_id) : String(r.buyer_id);
      const otherParty   = userMap[otherPartyId] || {};
      const displayName  = otherParty.name || (otherParty.email ? otherParty.email.split('@')[0] : null) || 'Unknown';

      return {
        room_id:          r.room_id,
        gem_id:           r.gem_id,
        gem_name:         r.gem_name || (r.isDirectAdmin ? 'Admin Support' : 'Conversation'),
        gem_image_url:    r.gem_image_url || null,
        buyer_id:         r.buyer_id,
        seller_id:        r.seller_id,
        other_party_id:   otherPartyId,
        other_party_name: displayName,
        other_party_role: otherParty.role || 'buyer',
        labels:           Array.isArray(r.labels) ? r.labels : [],
        category:         r.category || (r.isDirectAdmin ? 'Admin Chat' : 'Inbox'),
        isSupport:        !!r.isSupport,
        isDirectAdmin:    !!r.isDirectAdmin,
        supportCategory:  r.supportCategory || '',
        updatedAt:        r.updatedAt,
        last_message: r.messages.length > 0
          ? r.messages[r.messages.length - 1]
          : null,
        unread_count: r.messages.filter(m => String(m.sender_id) !== String(userId) && m.is_read === false).length,
      };
    });

    res.json(preview);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/chat/admin-room
// Seller-only: create or fetch direct chat room with admin.
exports.getOrCreateDirectAdminChat = async (req, res) => {
  try {
    console.log('[Direct Admin Chat] Request received:', {
      userId: req.user.id,
      userRole: req.user.role,
      requestBody: req.body
    });

    const sellerId = req.user.id;
    const role = req.user.role;
    
    console.log('[Direct Admin Chat] Parsed data:', { sellerId, role });
    
    // SECURITY CONSTRAINT: Only sellers can initiate direct admin chat
    if (role !== 'seller') {
      console.log('[Direct Admin Chat] Error: User is not a seller, role:', role);
      return res.status(403).json({ message: 'Forbidden: Only sellers can initiate direct admin chat' });
    }

    console.log('[Direct Admin Chat] Looking for admin user...');
    const admin = await User.findOne({ role: 'admin' }).select('_id email');
    if (!admin?._id) {
      console.log('[Direct Admin Chat] Error: No admin user found in database');
      return res.status(404).json({ message: 'No admin account available' });
    }

    const adminId = String(admin._id);
    const room_id = `admin_${sellerId}_${adminId}`;
    
    console.log('[Direct Admin Chat] Checking for existing room:', { room_id });
    
    // FIRST: Check if room already exists
    let existingRoom = await Chat.findOne({ room_id }).lean();
    if (existingRoom) {
      console.log('[Direct Admin Chat] Room already exists, returning existing room:', existingRoom.room_id);
      
      // Update the room to ensure it has correct admin chat properties
      const updatedRoom = await Chat.findOneAndUpdate(
        { room_id },
        {
          $set: {
            isDirectAdmin: true,
            category: 'Admin Chat',
            gem_name: 'Admin Support',
          }
        },
                                                                                                                                                                                                     { returnDocument: 'after' }
      );
      
      const responseData = {
        room_id: updatedRoom.room_id,
        buyer_id: updatedRoom.buyer_id,
        seller_id: updatedRoom.seller_id,
        gem_name: updatedRoom.gem_name || 'Admin Support',
        category: updatedRoom.category || 'Admin Chat',
        isDirectAdmin: !!updatedRoom.isDirectAdmin,
      };

      console.log('[Direct Admin Chat] Returning existing room:', responseData);
      return res.json(responseData);
    }
    
    // SECOND: Create new room if it doesn't exist
    console.log('[Direct Admin Chat] Creating new room:', { 
      room_id, 
      adminId: adminId, 
      adminEmail: admin.email,
      sellerId 
    });

    const chat = await Chat.findOneAndUpdate(
      { room_id },
      {
        $setOnInsert: {
          room_id,
          buyer_id: sellerId,
          seller_id: adminId,
          isDirectAdmin: true,
          category: 'Admin Chat',
          gem_name: 'Admin Support',
          messages: [],
          notes: [],
          labels: [],
        },
      },
      { upsert: true, returnDocument: 'after' }
    );

    console.log('[Direct Admin Chat] New room created:', {
      roomId: chat.room_id,
      buyerId: chat.buyer_id,
      sellerId: chat.seller_id,
      isDirectAdmin: chat.isDirectAdmin
    });

    const responseData = {
      room_id: chat.room_id,
      buyer_id: chat.buyer_id,
      seller_id: chat.seller_id,
      gem_name: chat.gem_name || 'Admin Support',
      category: chat.category || 'Admin Chat',
      isDirectAdmin: !!chat.isDirectAdmin,
    };

    console.log('[Direct Admin Chat] Sending new room response:', responseData);
    res.json(responseData);
  } catch (err) {
    console.error('[Direct Admin Chat] Error:', err);
    res.status(500).json({ message: err.message });
  }
};

// POST /api/chat/support-room (DEPRECATED - Kept for backwards compatibility)
exports.getOrCreateSupportRoom = async (req, res) => {
  try {
    console.log('[Support Room] Request received:', {
      userId: req.user.id,
      userRole: req.user.role,
      requestBody: req.body
    });

    const sellerId = req.user.id;
    const role = req.user.role;
    const category = (req.body?.category || '').trim();
    
    console.log('[Support Room] Parsed data:', { sellerId, role, category });
    
    if (!category) {
      console.log('[Support Room] Error: Category is missing');
      return res.status(400).json({ message: 'Support category is required' });
    }

    if (role !== 'seller') {
      console.log('[Support Room] Error: User is not a seller, role:', role);
      return res.status(403).json({ message: 'Only sellers can open support chats' });
    }

    console.log('[Support Room] Looking for admin user...');
    const admin = await User.findOne({ role: 'admin' }).select('_id email');
    if (!admin?._id) {
      console.log('[Support Room] Error: No admin user found in database');
      return res.status(404).json({ message: 'No admin account available' });
    }

    const adminId = String(admin._id);
    const room_id = `support_${sellerId}_${adminId}`;
    
    console.log('[Support Room] Creating/updating room:', { 
      room_id, 
      adminId: adminId, 
      adminEmail: admin.email,
      sellerId 
    });

    const chat = await Chat.findOneAndUpdate(
      { room_id },
      {
        $setOnInsert: {
          room_id,
          buyer_id: sellerId,
          seller_id: adminId,
          isSupport: true,
          category: 'Support Tickets',
          gem_name: 'Admin Support',
          messages: [],
          notes: [],
          labels: [],
        },
        $set: {
          supportCategory: category,
        },
      },
      { upsert: true, returnDocument: 'after' }
    );

    const responseData = {
      room_id: chat.room_id,
      buyer_id: chat.buyer_id,
      seller_id: chat.seller_id,
      gem_name: chat.gem_name || 'Admin Support',
      category: chat.category || 'Support Tickets',
      isSupport: !!chat.isSupport,
      supportCategory: chat.supportCategory || category,
    };

    console.log('[Support Room] Sending response:', responseData);
    res.json(responseData);
  } catch (err) {
    console.error('[Support Room] Error:', err);
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/chat/folder/delete
exports.deleteFolder = async (req, res) => {
  try {
    const { folder_name } = req.body;
    // Clear the category from all rooms that have it (Already secure with $or)
    await Chat.updateMany(
      { $or: [{ buyer_id: req.user.id }, { seller_id: req.user.id }], category: folder_name },
      { $set: { category: 'Inbox' } }
    );
    res.json({ message: 'Folder deleted and rooms moved to Inbox' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/chat/label/add
exports.addLabel = async (req, res) => {
  try {
    const { room_id, label, color } = req.body;
    const labelName = typeof label === 'object' ? label.name : label;
    const labelColor = typeof label === 'object' ? label.color : color;
    const userId = req.user.id;
    const role = req.user.role;
    
    const query = role === 'admin' 
        ? { room_id } 
        : { room_id, $or: [{ buyer_id: userId }, { seller_id: userId }] };

    await Chat.updateOne(query, { $pull: { labels: { name: labelName } } });
    await Chat.updateOne(query, { $push: { labels: { name: labelName, color: labelColor } } });
    
    res.json({ message: 'Label added' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/chat/label/remove
exports.removeLabel = async (req, res) => {
  try {
    const { room_id, label_name } = req.body;
    const labelName = typeof label_name === 'object' ? label_name.name : label_name;
    const userId = req.user.id;
    const role = req.user.role;
    
    const query = role === 'admin' 
        ? { room_id } 
        : { room_id, $or: [{ buyer_id: userId }, { seller_id: userId }] };

    // Pull object-form label
    await Chat.updateOne(query, { $pull: { labels: { name: labelName } } });
    // Pull legacy string-form label gracefully
    await Chat.updateOne(query, { $pull: { labels: labelName } });
    
    res.json({ message: 'Label removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/chat/folder/move
exports.moveRoomToFolder = async (req, res) => {
  try {
    const { room_id, folder_name } = req.body;
    const userId = req.user.id;
    const role = req.user.role;
    
    const query = role === 'admin' 
        ? { room_id } 
        : { room_id, $or: [{ buyer_id: userId }, { seller_id: userId }] };

    await Chat.updateOne(query, { $set: { category: folder_name } });
    res.json({ message: 'Room moved to folder' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/chat/room/:roomId/mark-read
// Marks all unread messages sent by the other party as 'is_read': true
exports.markRoomAsRead = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;
    const role = req.user.role;

    const query = role === 'admin' 
        ? { room_id: roomId } 
        : { room_id: roomId, $or: [{ buyer_id: userId }, { seller_id: userId }] };

    // Set 'is_read' to true for all messages in the room where the sender is not the current user
    const result = await Chat.updateOne(
      query,
      { $set: { "messages.$[msg].is_read": true } },
      { arrayFilters: [ { "msg.sender_id": { $ne: userId } } ] } // Removed "msg.is_read" : false to simplify and make safer if slightly duplicated
    );

    res.json({ message: 'Messages marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};