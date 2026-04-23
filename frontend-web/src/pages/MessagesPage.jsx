import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import { 
  MessageSquare, 
  Search, 
  Send, 
  Smile, 
  Plus, 
  X, 
  Tag, 
  Pin, 
  PinOff, 
  Folder, 
  Trash2, 
  Loader2, 
  Save,
  Shield,
  MoreVertical,
  NotepadText,
  StickyNote,
  Image as ImageIcon
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Constants
const ROLE_COLORS = {
  admin: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  seller: 'bg-amber-50 text-amber-600 border-amber-100', 
  buyer: 'bg-emerald-50 text-emerald-600 border-emerald-100'
};

const REACTIONS = ['👍', '❤️', '🙏', '💎', '🔥', '👏'];
const DEFAULT_FOLDERS = ['Inbox', 'All'];

// FORCE PORT 5001 - Backend server confirmed running on this port
const BACKEND_PORT = '5001';
const BACKEND_URL = `http://localhost:${BACKEND_PORT}`;

export default function MessagesPage() {
  // State Management
  const [socket, setSocket] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [notes, setNotes] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  
  // Loading & Connection States
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [connected, setConnected] = useState(false);
  const [pageError, setPageError] = useState(null);
  
  // UI Features States
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(null);
  const [showLabelMenuModal, setShowLabelMenuModal] = useState(null);
  const [showNotesView, setShowNotesView] = useState(false);
  const [noteInput, setNoteInput] = useState('');
  const [showContextMenu, setShowContextMenu] = useState(null);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  
  // Folder & Label Management Arrays defaults
  const [folders, setFolders] = useState(DEFAULT_FOLDERS);
  const [folderDraft, setFolderDraft] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [labelDefs, setLabelDefs] = useState([]);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#3b82f6');
  const [pinnedRooms, setPinnedRooms] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  
  // Admin-only tab state for separating Buyer Inquiries vs Seller Support
  const [adminTab, setAdminTab] = useState('Buyer Inquiries');
  const ADMIN_TABS = ['Buyer Inquiries', 'Seller Support'];

  // Refs
  const messagesEndRef = useRef(null);
  const notesEndRef = useRef(null);
  const socketRef = useRef(null);
  
  // CRITICAL FIX: Safe reference to active room to prevent React State Bailout
  const activeRoomIdRef = useRef(activeRoomId);
  useEffect(() => {
    activeRoomIdRef.current = activeRoomId;
  }, [activeRoomId]);

  // User Data Safe Access
  const currentUserId = typeof localStorage !== 'undefined' ? localStorage.getItem('userId') : null;
  const currentUserRole = typeof localStorage !== 'undefined' ? localStorage.getItem('role') || 'buyer' : 'buyer';
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;

  const isVerifiedSeller = currentUserRole === 'seller' && !!token;

  // ── 0. AUTO-OPEN ROOM FROM NAVIGATION STATE (Chat with Seller button) ──────
  const { state: navState } = useLocation();
  useEffect(() => {
    if (navState?.gemId && navState?.sellerId && currentUserId) {
      // room_id format: gemId_buyerId_sellerId
      const roomId = `${navState.gemId}_${currentUserId}_${navState.sellerId}`;
      setActiveRoomId(roomId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navState?.gemId, navState?.sellerId, currentUserId]);

  const fetchRooms = useCallback(async () => {
    if (!token) return;
    try {
      setLoadingRooms(true);
      const res = await fetch(`${BACKEND_URL}/api/chat/my-rooms`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const roomsArr = Array.isArray(data) ? data : [];
        setRooms(roomsArr);
        
        // Sync unread counts dynamically from the DB query
        const initialUnreads = {};
        roomsArr.forEach(r => {
          initialUnreads[r.room_id] = r.unread_count || 0;
        });
        setUnreadCounts(initialUnreads);

      } else {
        console.warn('Failed to fetch rooms via API.');
        setRooms([]);
        setUnreadCounts({});
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setRooms([]);
    } finally {
      setLoadingRooms(false);
    }
  }, [token]);

  const fetchChatHistory = useCallback(async (roomId) => {
    if (!token || !roomId) return;
    try {
      setLoadingChat(true);
      const res = await fetch(`${BACKEND_URL}/api/chat/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const incomingMessages = data?.messages;
        const incomingNotes = data?.notes;
        setMessages(Array.isArray(incomingMessages) ? incomingMessages : []);
        setNotes(Array.isArray(incomingNotes) ? incomingNotes : []);
      } else {
        console.warn('Failed to fetch chat history via API.');
        setMessages([]);
        setNotes([]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
      setNotes([]);
    } finally {
      setLoadingChat(false);
    }
  }, [token]);

  const handleRoomSelect = useCallback((roomId) => {
    setActiveRoomId(roomId);
    
    // Auto-clear unread badge locally for Optimistic UI UX
    setUnreadCounts(prev => {
      if (prev[roomId] > 0) {
        // Broadcast reset to backend securely in background
        if (token) {
          fetch(`${BACKEND_URL}/api/chat/room/${roomId}/mark-read`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` }
          }).catch(console.warn);
        }
        return { ...prev, [roomId]: 0 };
      }
      return prev;
    });
  }, [token]);

  // ── 2. SOCKET MANAGEMENT ──
  
  // Connection Effect
  useEffect(() => {
    if (!token) {
      setPageError('Authentication token missing. Please log in.');
      setLoadingRooms(false);
      return;
    }

    const newSocket = io(BACKEND_URL, {
      auth: { token },
      reconnectionAttempts: 5,
      timeout: 10000
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    fetchRooms();

    return () => {
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [token, fetchRooms]);

  // Listeners Effect 
  useEffect(() => {
    const s = socketRef.current;
    if (!s) return;

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    
    // CRITICAL FIX: Safe Message Handler
    const onNewMessage = (message) => {
      if (!message) return;
      
      const currentActive = activeRoomIdRef.current;
      const msgRoomId = message.room_id || currentActive;

      if (msgRoomId === currentActive) {
        // Active room — append message cleanly avoiding duplicates
        setMessages(prev => {
          const safePrev = Array.isArray(prev) ? prev : [];
          if (safePrev.some(m => m?._id === message._id || (m.text === message.text && m.sender_id === message.sender_id && String(m._id).startsWith('temp')))) {
            return safePrev.map(m => (m.text === message.text && m.sender_id === message.sender_id && String(m._id).startsWith('temp')) ? message : m);
          }
          return [...safePrev, message];
        });
      } else {
        // Background room — increment its unread badge SAFELY
        setUnreadCounts(prev => ({
          ...prev,
          [message.room_id]: (prev[message.room_id] || 0) + 1,
        }));
      }

      // Update last_message preview in the sidebar
      setRooms(prev => (Array.isArray(prev) ? prev : []).map(r => 
        r?.room_id === message.room_id 
          ? { ...r, last_message: message.text, updatedAt: message.createdAt || new Date() }
          : r
      ));
    };

    const onMessageDeleted = ({ message_id, text }) => {
      if (!message_id) return;
      setMessages(prev => (Array.isArray(prev) ? prev : []).map(m => 
        m?._id === message_id ? { ...m, is_deleted: true, text: text || 'This message was deleted' } : m
      ));
    };

    const onReactionUpdated = ({ message_id, reactions }) => {
      if (!message_id || !reactions) return;
      setMessages(prev => (Array.isArray(prev) ? prev : []).map(m => 
        m?._id === message_id ? { ...m, reactions } : m
      ));
    };

    const onNoteAdded = ({ room_id, note }) => {
      if (!room_id || !note) return;
      if (room_id === activeRoomIdRef.current) {
        setNotes(prev => {
          const safePrev = Array.isArray(prev) ? prev : [];
          const exists = safePrev.find(n => n?._id === note._id);
          if (exists) return safePrev.map(n => n?._id === note._id ? note : n);
          return [...safePrev, note];
        });
      }
    };

    const onNoteDeleted = ({ room_id, note_id }) => {
      if (!room_id || !note_id) return;
      if (room_id === activeRoomIdRef.current) {
        setNotes(prev => (Array.isArray(prev) ? prev : []).filter(n => n?._id !== note_id));
      }
    };

    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);
    s.on('receive_message', onNewMessage);
    s.on('message_deleted', onMessageDeleted);
    s.on('reaction_updated', onReactionUpdated);
    s.on('note_added', onNoteAdded);
    s.on('note_deleted', onNoteDeleted);

    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
      s.off('receive_message', onNewMessage);
      s.off('message_deleted', onMessageDeleted);
      s.off('reaction_updated', onReactionUpdated);
      s.off('note_added', onNoteAdded);
      s.off('note_deleted', onNoteDeleted);
    };
  }, [socket]);

  // Active Room Join Effect
  useEffect(() => {
    if (activeRoomId) {
      setUnreadCounts(prev => ({ ...prev, [activeRoomId]: 0 }));
      
      // Sync with backend to permanently mark messages as read
      if (token) {
        fetch(`${BACKEND_URL}/api/chat/room/${activeRoomId}/mark-read`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` }
        }).catch(err => console.warn('Failed to mark read', err));
      }

      fetchChatHistory(activeRoomId);
      
      if (socketRef.current?.connected) {
        // FIX: Split the activeRoomId to satisfy backend security requirements
        const parts = activeRoomId.split('_');
        socketRef.current.emit('join_room', { 
          room_id: activeRoomId,
          gem_id: parts[0] || null,
          buyer_id: parts[1] || null,
          seller_id: parts[2] || null
        });
      }
    } else {
      setMessages([]); setNotes([]); setShowNotesView(false);
    }
  }, [activeRoomId, fetchChatHistory, token]);

  // CRITICAL FIX: Safe Join All Rooms with full payload to satisfy backend
  const roomIdsString = rooms.map(r => r?.room_id).join(',');
  useEffect(() => {
    if (socketRef.current?.connected && Array.isArray(rooms)) {
      rooms.forEach(room => {
        if (room?.room_id) {
          const parts = room.room_id.split('_');
          socketRef.current.emit('join_room', { 
            room_id: room.room_id,
            gem_id: parts[0] || null,
            buyer_id: parts[1] || null,
            seller_id: parts[2] || null
          });
        }
      });
    }
  }, [roomIdsString, connected]);

  // Scroll Effect
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => { notesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [notes]);

  // ── 3. DATA PERSISTENCE ──
  useEffect(() => {
    try {
      const savedFolders = localStorage.getItem('chatFolders');
      const savedLabels = localStorage.getItem('labelDefinitions');
      const savedPinned = localStorage.getItem('pinnedRooms');
      
      if (savedFolders) setFolders(JSON.parse(savedFolders));
      if (savedLabels) setLabelDefs(JSON.parse(savedLabels));
      if (savedPinned) setPinnedRooms(JSON.parse(savedPinned));
    } catch (e) {
      console.warn("Could not load local storage data", e);
    }
  }, []);

  useEffect(() => {
    if (Array.isArray(folders) && folders.length > 0) {
      localStorage.setItem('chatFolders', JSON.stringify(folders));
    }
  }, [folders]);

  useEffect(() => {
    if (Array.isArray(labelDefs) && labelDefs.length > 0) {
      localStorage.setItem('labelDefinitions', JSON.stringify(labelDefs));
    }
  }, [labelDefs]);

  useEffect(() => {
    if (Array.isArray(pinnedRooms)) {
      localStorage.setItem('pinnedRooms', JSON.stringify(pinnedRooms));
    }
  }, [pinnedRooms]);

  // ── 4. UI INTERACTION HANDLERS ──
  const handleCreateFolder = () => {
    const name = folderDraft?.trim();
    if (!name) return;
    setFolders(prev => Array.from(new Set([...(Array.isArray(prev) ? prev : []), name])));
    setActiveCategory(name);
    setFolderDraft('');
    toast.success(`Folder "${name}" created`);
  };

  const handleDeleteFolder = async (folderName) => {
    if (!window.confirm(`Delete folder "${folderName}"?`)) return;
    try {
      const response = await fetch(`${BACKEND_URL}/api/chat/folder/delete`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ folder_name: folderName })
      });
      if (response.ok) {
        setFolders(prev => (Array.isArray(prev) ? prev : []).filter(f => f !== folderName));
        if (activeCategory === folderName) setActiveCategory('All');
        toast.success(`Folder deleted`);
      }
    } catch (error) {
      toast.error('Network error. Failed to delete folder');
    }
  };

  const handleCreateLabel = () => {
    const name = newLabelName?.trim();
    if (!name) return;
    
    const newLabel = { name, color: newLabelColor || '#3b82f6' };
    
    setLabelDefs(prev => {
      const safePrev = Array.isArray(prev) ? prev : [];
      const exists = safePrev.find(l => l?.name === name);
      if (exists) return safePrev.map(l => (l?.name === name ? newLabel : l));
      return [...safePrev, newLabel];
    });
    setNewLabelName('');

    if (showLabelMenuModal) {
      handleUpdateLabels(showLabelMenuModal, newLabel);
    }
  };

  const handleRemoveLabel = async (room_id, labelName) => {
    const safeRooms = Array.isArray(rooms) ? rooms : [];
    const room = safeRooms.find(r => r?.room_id === room_id);
    const existingRaw = Array.isArray(room?.labels) ? room.labels : [];
    const existing = existingRaw.map(l => typeof l === 'object' ? l : { name: l, color: '#3b82f6' });

    // Optimistic Update
    setRooms(prev => (Array.isArray(prev) ? prev : []).map(r =>
      r?.room_id === room_id
        ? { ...r, labels: existing.filter(l => l?.name !== labelName) }
        : r
    ));

    try {
      const response = await fetch(`${BACKEND_URL}/api/chat/label/remove`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ room_id, label_name: labelName })
      });
      if (!response.ok) {
        toast.error('Failed to remove label');
        // Rollback
        setRooms(prev => (Array.isArray(prev) ? prev : []).map(r =>
          r?.room_id === room_id ? { ...r, labels: existing } : r
        ));
      } else {
        toast.success('Label removed');
      }
    } catch (error) {
      toast.error('Network error');
      setRooms(prev => (Array.isArray(prev) ? prev : []).map(r =>
        r?.room_id === room_id ? { ...r, labels: existing } : r
      ));
    }
  };

  const handleUpdateLabels = async (room_id, label) => {
    const safeRooms = Array.isArray(rooms) ? rooms : [];
    const room = safeRooms.find(r => r?.room_id === room_id);
    const existingRaw = Array.isArray(room?.labels) ? room.labels : [];
    
    // Normalize existing labels to objects in case of legacy string arrays
    const existing = existingRaw.map(l => typeof l === 'object' ? l : { name: l, color: '#3b82f6' });
    const hasLabel = existing.some(l => l?.name === label?.name);

    if (hasLabel) {
      // Optimistic Update for removal
      setRooms(prev => (Array.isArray(prev) ? prev : []).map(r =>
        r?.room_id === room_id
          ? { ...r, labels: existing.filter(l => l?.name !== label?.name) }
          : r
      ));
      
      try {
        const response = await fetch(`${BACKEND_URL}/api/chat/label/remove`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ room_id, label_name: label?.name })
        });
        if (!response.ok) {
          toast.error('Failed to remove label');
          setRooms(prev => (Array.isArray(prev) ? prev : []).map(r => r?.room_id === room_id ? { ...r, labels: existing } : r));
        } else {
          toast.success('Label removed');
        }
      } catch (error) {
        toast.error('Network error');
        setRooms(prev => (Array.isArray(prev) ? prev : []).map(r => r?.room_id === room_id ? { ...r, labels: existing } : r));
      }
    } else {
      const newLabelObj = { name: label?.name, color: label?.color };
      
      // Optimistic Update for addition
      setRooms(prev => (Array.isArray(prev) ? prev : []).map(r =>
        r?.room_id === room_id
          ? { ...r, labels: [...existing, newLabelObj] }
          : r
      ));
      
      try {
        const response = await fetch(`${BACKEND_URL}/api/chat/label/add`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ room_id, label: newLabelObj.name, color: newLabelObj.color })
        });
        if (!response.ok) {
          toast.error('Failed to add label');
          setRooms(prev => (Array.isArray(prev) ? prev : []).map(r => r?.room_id === room_id ? { ...r, labels: existing } : r));
        } else {
          toast.success('Label added');
        }
      } catch (error) {
        toast.error('Network error');
        setRooms(prev => (Array.isArray(prev) ? prev : []).map(r => r?.room_id === room_id ? { ...r, labels: existing } : r));
      }
    }
  };

  const handleSendMessage = async () => {
    const safeText = messageInput?.trim();
    if (!activeRoomId || !socketRef.current || (!safeText && !imageFile)) return;
    
    const tempId = `temp-${Date.now()}`;
    let tempImageUrl = null;

    const fileToUpload = imageFile;

    if (fileToUpload) {
      tempImageUrl = URL.createObjectURL(fileToUpload);
    }
    
    const newMessage = {
      _id: `temp-${Date.now()}`,
      room_id: activeRoomId,
      sender_id: currentUserId,
      text: tempImageUrl || safeText,
      type: tempImageUrl ? 'image' : 'text',
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMessage]);
    setMessageInput(''); 
    setImagePreview(null); 
    setImageFile(null);

    let finalImageUrl = null;

    if (fileToUpload) {
      const formData = new FormData();
      formData.append('image', fileToUpload);
      formData.append('room_id', activeRoomId);
      
      try {
        const res = await fetch(`${BACKEND_URL}/api/messages/upload-image`, {
          method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData
        });
        if (res.ok) {
          const data = await res.json();
          finalImageUrl = data.imageUrl;
        } else {
          toast.error('Image upload failed');
          setMessages(prev => prev.filter(m => m._id !== tempId));
          return; 
        }
      } catch (e) { 
        toast.error('Network error'); 
        setMessages(prev => prev.filter(m => m._id !== tempId));
        return; 
      }
    }
    
    socketRef.current.emit('send_message', {
      room_id: activeRoomId,
      text: finalImageUrl || safeText,
      type: finalImageUrl ? 'image' : 'text'
    });
  };

  const handleDeleteMessage = (messageId) => {
    if (window.confirm('Delete this message for everyone?')) {
      setMessages(prev => prev.map(m => m._id === messageId ? { ...m, is_deleted: true, text: 'This message was deleted' } : m));
      socketRef.current?.emit('delete_message', { room_id: activeRoomId, message_id: messageId });
    }
  };

  const handleAddReaction = (messageId, emoji) => {
    socketRef.current?.emit('react_message', { room_id: activeRoomId, message_id: messageId, emoji });
    setShowEmojiPicker(null);
  };

  const handleAddNote = () => {
    const rawNote = noteInput?.trim();
    if (!rawNote || !activeRoomId) return;
    socketRef.current?.emit('add_note', { room_id: activeRoomId, text: rawNote });
    setNoteInput('');
  };

  const handleDeleteNote = (noteId) => {
    setNotes(prev => prev.filter(n => n._id !== noteId));
    socketRef.current?.emit('delete_note', { room_id: activeRoomId, note_id: noteId });
  };

  const handleMoveToFolder = async (roomId, folderName) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/chat/folder/move`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ room_id: roomId, folder_name: folderName })
      });
      if (response.ok) {
        setRooms(prev => (Array.isArray(prev) ? prev : []).map(r => 
          r?.room_id === roomId ? { ...r, category: folderName } : r
        ));
        toast.success(`Moved to ${folderName}`);
      }
    } catch (error) {
      toast.error('Failed to move chat');
    }
    setShowContextMenu(null);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleOpenAdminChat = async () => {
    if (!isVerifiedSeller) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/chat/admin-room`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ 
          user_id: currentUserId, 
          user_role: currentUserRole 
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data?.room_id) {
          setActiveRoomId(data.room_id);
          toast.success('Admin chat opened');
        } else {
          toast.error('Failed to open admin chat - no room ID');
        }
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || 'Failed to open admin chat');
      }
    } catch (e) {
      toast.error('Network error. Failed to open admin chat');
    }
  };

  const handleAddMediaToNotes = (url) => {
    socketRef.current?.emit('add_note', { room_id: activeRoomId, image_url: url, text: 'Saved from chat' });
    toast.success('Saved to notes');
    setShowNotesView(true);
  };

  // Safe Rendering Variables
  const safeRooms = Array.isArray(rooms) ? rooms : [];
  const safeMessages = Array.isArray(messages) ? messages : [];
  const safeNotes = Array.isArray(notes) ? notes : [];
  const safeFoldersArray = Array.isArray(folders) ? folders : DEFAULT_FOLDERS;
  const safeLabelDefs = Array.isArray(labelDefs) ? labelDefs : [];
  const safePinnedRooms = Array.isArray(pinnedRooms) ? pinnedRooms : [];
  const activeRoomData = safeRooms.find(r => r?.room_id === activeRoomId);

  // Filter and sort rooms
  const filteredRooms = safeRooms.filter(r => {
    if (!r) return false;
    const matchesSearch = !searchQuery || (r.gem_name || r.other_party_name || '').toLowerCase().includes((searchQuery || '').toLowerCase());
    const matchesCategory = activeCategory === 'All' || r.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedRooms = [...filteredRooms].sort((a, b) => {
    if (!a) return 1;
    if (!b) return -1;
    const aPin = safePinnedRooms.includes(a.room_id) ? 1 : 0;
    const bPin = safePinnedRooms.includes(b.room_id) ? 1 : 0;
    if (aPin !== bPin) return bPin - aPin;
    return new Date(b?.updatedAt || 0) - new Date(a?.updatedAt || 0);
  });

  const displayedRooms = currentUserRole === 'admin'
    ? sortedRooms.filter(r =>
        adminTab === 'Buyer Inquiries'
          ? r.other_party_role === 'buyer'
          : r.other_party_role === 'seller'
      )
    : sortedRooms;

  const contextMenuRoom = safeRooms.find(r => r?.room_id === showContextMenu);

  if (pageError) {
    return (
      <div className="h-[calc(100vh-6rem)] bg-slate-50 flex items-center justify-center">
        <p className="text-red-500 font-bold">{pageError}</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-6rem)] bg-slate-50 flex overflow-hidden font-sans text-slate-800">

      
      <style>{`
        .toast-container, .Toastify__toast-container, div[data-hot-toast="true"] {
          z-index: 999999 !important;
          margin-top: 80px !important;
        }
      `}</style>

      {/* Sidebar - Rooms List */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0 z-30">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-[14px] flex items-center justify-center shadow-md">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Chats</h1>
          </div>
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input 
              type="text" placeholder="Search conversations..." 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-slate-900 placeholder:text-slate-400"
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {currentUserRole === 'admin' && (
            <div className="mt-4 -mb-2">
              <div className="flex relative border-b border-slate-100">
                {ADMIN_TABS.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setAdminTab(tab)}
                    className="relative flex-1 py-2.5 text-xs font-bold text-center transition-colors"
                  >
                    <span className={adminTab === tab ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}>
                      {tab}
                    </span>
                    {adminTab === tab && (
                      <motion.div
                        layoutId="admin-tab-indicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Categories */}
        <div className="px-4 py-3 border-b border-slate-100">
          <div className="flex gap-2 flex-wrap">
            {safeFoldersArray.map((cat, index) => {
              const safeCat = cat || 'Unknown';
              return (
                <div key={`folder-${safeCat}-${index}`} className="flex items-center gap-1 group">
                  <button
                    onClick={() => setActiveCategory(safeCat)}
                    className={`flex-shrink-0 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeCategory === safeCat
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {safeCat}
                  </button>
                  {safeCat !== 'All' && safeCat !== 'Inbox' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteFolder(safeCat); }}
                      className="p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Create Folder Input */}
        <div className="px-4 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl focus-within:border-blue-400 focus-within:bg-white transition-all">
            <Folder className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={folderDraft || ''}
              onChange={(e) => setFolderDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreateFolder(); }}
              placeholder="Create folder..."
              className="flex-1 bg-transparent border-none text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none min-w-0"
            />
            {(folderDraft || '').trim() && (
              <button
               onClick={handleCreateFolder}
                className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
               >
                <Plus className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto px-3 space-y-1 custom-scrollbar">
          {loadingRooms ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-50">
              <Loader2 className="animate-spin w-8 h-8 text-blue-600 mb-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Syncing...</span>
            </div>
          ) : displayedRooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-70">
              <MessageSquare size={32} className="text-slate-300 mb-4" />
              <h4 className="text-sm font-bold text-slate-700 mb-1">No conversations</h4>
              <p className="text-xs text-slate-500">Chats will appear here</p>
            </div>
          ) : (
            displayedRooms.map((r) => {
              if (!r) return null;
              const safeRoomId = r.room_id || `temp-${Math.random()}`;
              const isPinned = safePinnedRooms.includes(safeRoomId);
              const isActive = activeRoomId === safeRoomId;
              const unreadCount = (unreadCounts || {})[safeRoomId] || 0;
              
              const thumbUrl = r.gem_image_url
                ? (r.gem_image_url.startsWith('http') ? r.gem_image_url : `${BACKEND_URL}${r.gem_image_url}`)
                : null;

              return (
                <div key={safeRoomId} className="relative group">
                  <button
                    onClick={() => handleRoomSelect(safeRoomId)}
                    className={`w-full p-3 rounded-2xl flex items-start gap-3 transition-all duration-200 border-2 ${
                      isActive ? 'bg-blue-50 border-blue-200 shadow-sm' : 'border-transparent hover:bg-slate-50'
                    }`}
                  >
                    {/* Avatar / Gem Thumbnail */}
                    <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                      {thumbUrl ? (
                        <img src={thumbUrl} alt={r.gem_name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-blue-600 font-bold text-lg">
                          {(r.gem_name || r.other_party_name || 'U').charAt(0)}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 text-left min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="font-bold text-slate-900 text-sm truncate flex items-center gap-1.5">
                          {(() => {
                            const firstLabel = Array.isArray(r.labels) && r.labels.length > 0 ? r.labels[0] : null;
                            if (firstLabel) {
                              return (
                                <span title={firstLabel.name} className="inline-block w-[8px] h-[8px] rounded-full shrink-0 shadow-sm" style={{ backgroundColor: firstLabel.color }}></span>
                              );
                            }
                            const cat = r.category || 'All';
                            const dotColor =
                              cat === 'Inbox'  ? 'bg-blue-500' :
                              cat === 'All'    ? 'bg-slate-300' :
                              cat === 'Urgent' ? 'bg-red-500'  :
                              cat === 'Closed' ? 'bg-slate-400' :
                              'bg-violet-500';
                            return (
                              <span
                                title={cat}
                                className={`inline-block w-[8px] h-[8px] rounded-full shrink-0 shadow-sm ${dotColor}`}
                              />
                            );
                          })()}
                          {r.gem_name || 'Conversation'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 shrink-0 ml-1">
                          {new Date(r.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate mb-0.5">
                        {r.other_party_name || '—'}
                        {r.other_party_role && (
                          <span className={`ml-1.5 px-1.5 py-0.5 rounded text-[8px] font-black ${
                            r.other_party_role === 'admin'  ? 'bg-indigo-50 text-indigo-500' :
                            r.other_party_role === 'seller' ? 'bg-amber-50 text-amber-500' :
                            'bg-emerald-50 text-emerald-500'
                          }`}>{r.other_party_role}</span>
                        )}
                      </p>
                      
                      <p className="text-xs font-medium text-slate-500 truncate leading-relaxed">
                        {typeof r.last_message === 'object'
                          ? (r.last_message?.type === 'image' ? '📷 Image' : r.last_message?.text)
                          : (r.last_message || 'Start chatting...')}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isPinned && <Pin className="w-3 h-3 fill-blue-600 text-blue-600" />}
                      
                      {unreadCount > 0 && (
                        <span className="min-w-[20px] h-5 px-1.5 bg-blue-600 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-md animate-pulse">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </div>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPinnedRooms(prev => {
                        const safePrev = Array.isArray(prev) ? prev : [];
                        return safePrev.includes(safeRoomId)
                          ? safePrev.filter(id => id !== safeRoomId)
                          : [...safePrev, safeRoomId];
                      });
                    }}
                    className="absolute top-3 right-3 p-1.5 bg-white border border-slate-200 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-slate-50"
                  >
                    {isPinned ? <PinOff className="w-3 h-3 text-blue-600" /> : <Pin className="w-3 h-3 text-slate-400" />}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowContextMenu(safeRoomId);
                      setContextMenuPosition({ x: e.clientX, y: e.clientY });
                    }}
                    className="absolute top-3 right-10 p-1.5 bg-white border border-slate-200 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-slate-50"
                  >
                    <MoreVertical className="w-3 h-3 text-slate-400" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {isVerifiedSeller && (
          <div className="p-4 bg-white border-t border-slate-100">
            <button 
              onClick={handleOpenAdminChat}
              className="w-full py-3.5 bg-slate-900 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-md"
            >
              <Shield className="w-4 h-4 text-emerald-400" /> Contact Support Team
            </button>
          </div>
        )}
      </div>

      {/* Main Chat View */}
      <div className="flex-1 flex flex-col relative min-w-0 bg-white shadow-xl z-20">
        {activeRoomId && activeRoomData ? (
          <>
            <div className="h-[76px] border-b border-slate-200 px-6 sm:px-8 flex items-center justify-between shrink-0 bg-white sticky top-0 z-10">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 bg-slate-50 rounded-[14px] flex items-center justify-center border border-slate-200 shrink-0">
                  {activeRoomData.other_party_role === 'admin' ? <Shield className="w-6 h-6 text-blue-600" /> : <span className="text-2xl">💎</span>}
                </div>
              <div className="min-w-0">
                  <h2 className="font-black text-slate-900 text-base flex items-center gap-2 leading-tight">
                    {activeRoomData.other_party_name}
                    {activeRoomData.other_party_role === 'admin' && <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-200 uppercase tracking-widest">ADMIN</span>}
                  </h2>
                  {activeRoomData.gem_name && (
                    <p className="text-[11px] font-black text-blue-600 tracking-tight truncate mt-0.5">
                      💎 {activeRoomData.gem_name}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 mt-1.5 cursor-default">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{activeRoomData.other_party_role}</span>
                    {Array.isArray(activeRoomData.labels) && activeRoomData.labels.map((lbl, idx) => {
                       const labelObj = typeof lbl === 'object' ? lbl : { name: lbl, color: '#3b82f6' };
                       if (!labelObj.name) return null;
                       return (
                         <span key={`${labelObj.name}-${idx}`} className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black shadow-sm" style={{ backgroundColor: labelObj.color, color: '#ffffff' }}>
                           {labelObj.name}
                           <button 
                             onClick={(e) => { e.stopPropagation(); handleRemoveLabel(activeRoomId, labelObj.name); }} 
                             className="hover:text-red-200 transition-colors opacity-80 hover:opacity-100 flex items-center justify-center"
                             title="Remove Label"
                           >
                             <X size={10} strokeWidth={3} />
                           </button>
                         </span>
                       );
                    })}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowNotesView(!showNotesView)}
                  className={`p-2.5 rounded-xl transition-all border ${showNotesView ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50 hover:text-slate-600'}`}
                  title="Private Notes"
                >
                  <NotepadText className="w-5 h-5" />
                </button>
                <div className="h-6 w-[1px] bg-slate-200 mx-2"></div>
                <button 
                  onClick={() => setShowLabelMenuModal(activeRoomId)}
                  className="p-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl hover:bg-slate-50 hover:text-slate-600 transition-all shadow-sm"
                  title="Manage Labels"
                >
                  <Tag className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 flex overflow-hidden bg-slate-50">
              
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 custom-scrollbar">
                {loadingChat ? (
                  <div className="flex flex-col items-center justify-center h-full opacity-40">
                    <Loader2 className="animate-spin w-8 h-8 text-blue-600 mb-4" />
                  </div>
                ) : (
                  safeMessages.map((msg) => {
                    if (!msg) return null;
                    const isOwn = msg.sender_id === currentUserId;
                    const reactions = Array.isArray(msg.reactions) ? msg.reactions : [];
                    
                    return (
                      <div key={msg._id} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} ${msg.isOptimistic ? 'opacity-70' : ''}`}>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1 flex items-center gap-2">
                          {isOwn ? 'You' : (msg.sender_name || activeRoomData?.other_party_name || 'User')}
                          {msg.isOptimistic && <Loader2 size={10} className="animate-spin text-slate-400" />}
                        </span>
                        <div className="group relative flex items-center gap-3 max-w-[85%]">
                          {isOwn && !msg.isOptimistic && (
                            <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center gap-1 order-1">
                              <button onClick={() => setShowEmojiPicker(msg._id)} className="p-1.5 bg-white rounded-lg shadow-sm border border-slate-200 text-slate-400 hover:text-blue-500"><Smile size={16}/></button>
                              <button onClick={() => handleDeleteMessage(msg._id)} className="p-1.5 bg-white rounded-lg shadow-sm border border-slate-200 text-slate-400 hover:text-red-500"><Trash2 size={16}/></button>
                            </div>
                          )}
                          
                          <div className={`relative px-5 py-3.5 break-words shadow-sm transition-all duration-300 ${
                            isOwn 
                              ? 'bg-blue-600 text-white rounded-[24px_24px_4px_24px] order-2' 
                              : 'bg-white border border-slate-200 text-slate-900 rounded-[24px_24px_24px_4px] order-2 shadow-sm'
                          } ${msg.is_deleted ? 'bg-slate-100 text-slate-500 border border-dashed border-slate-300 shadow-none' : ''}`}>
                            
                            {msg.is_deleted ? (
                              <p className="italic text-sm font-medium">This message was deleted</p>
                            ) : msg.type === 'image' ? (
                              <div className="relative group/img">
                                <img src={msg.text} className="max-w-[280px] rounded-xl border border-black/10" alt="Shared" />
                                {!isOwn && !msg.isOptimistic && (
                                  <button onClick={() => handleAddMediaToNotes(msg.text)} className="absolute bottom-2 right-2 p-2 bg-white/90 backdrop-blur rounded-lg shadow-sm text-blue-600 opacity-0 group-hover/img:opacity-100 transition-all"><Save size={14}/></button>
                                )}
                              </div>
                            ) : (
                              <p className="text-[14.5px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                            )}
                            
                            {reactions.length > 0 && !msg.is_deleted && (
                              <div className={`absolute -bottom-3 ${isOwn ? 'right-2' : 'left-2'} flex gap-1 bg-white border border-slate-200 px-2 py-0.5 rounded-full shadow-sm z-10 scale-90`}>
                                {Array.from(new Set(reactions.map(r => r.emoji))).map(em => <span key={em} className="text-xs">{em}</span>)}
                                <span className="text-[9px] font-black text-slate-400 ml-1">{reactions.length}</span>
                              </div>
                            )}

                            <AnimatePresence>
                              {showEmojiPicker === msg._id && (
                                <motion.div 
                                  initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                  className={`absolute -top-12 ${isOwn ? 'right-0' : 'left-0'} bg-white shadow-xl border border-slate-200 rounded-full px-1.5 py-1.5 flex gap-1 z-50`}
                                >
                                  {REACTIONS.map(em => <button key={em} onClick={() => handleAddReaction(msg._id, em)} className="text-lg hover:scale-125 transition-transform p-1">{em}</button>)}
                                  <button onClick={() => setShowEmojiPicker(null)} className="p-1 px-2 text-slate-300 hover:text-slate-600 text-[10px] font-bold">X</button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          {!isOwn && !msg.isOptimistic && (
                            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-1 order-3">
                              <button onClick={() => setShowEmojiPicker(msg._id)} className="p-1.5 bg-white rounded-lg shadow-sm border border-slate-200 text-slate-400 hover:text-blue-500"><Smile size={16}/></button>
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold mt-1.5 px-1 uppercase tracking-widest">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <AnimatePresence>
                {showNotesView && (
                  <motion.div 
                    initial={{ width: 0, opacity: 0 }} 
                    animate={{ width: 340, opacity: 1 }} 
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="bg-white border-l border-slate-200 flex flex-col shrink-0 shadow-[-10px_0_30px_rgba(0,0,0,0.03)] z-30 overflow-hidden"
                  >
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-100">
                          <StickyNote size={14} className="text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-black text-sm text-slate-900 tracking-tight">Private Notes</h3>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Visible only to you</p>
                        </div>
                      </div>
                      <button onClick={() => setShowNotesView(false)} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-all">
                        <X size={16} strokeWidth={2.5} />
                      </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-slate-50/50">
                      {safeNotes.length === 0 ? (
                        <div className="text-center py-16 px-4">
                          <NotepadText className="w-12 h-12 text-slate-200 mx-auto mb-3" strokeWidth={1.5} />
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No notes yet</p>
                          <p className="text-xs font-medium text-slate-400 mt-2 leading-relaxed">Save details about pricing, gem quality, or shipping info here.</p>
                        </div>
                      ) : (
                        safeNotes.map((note, index) => (
                          <motion.div 
                            layout key={note._id}
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="group relative bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all"
                          >
                            {note.image_url && <img src={note.image_url} className="w-full h-32 object-cover rounded-xl mb-3 border border-slate-100" alt="Note Attachment" />}
                            <p className="text-[13px] text-slate-700 font-medium leading-relaxed mb-3">{note.text}</p>
                            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                {new Date(note.created_at).toLocaleDateString()}
                              </span>
                              <button onClick={() => handleDeleteNote(note._id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </motion.div>
                        ))
                      )}
                      <div ref={notesEndRef} />
                    </div>
                    
                    <div className="p-4 bg-white border-t border-slate-100 shrink-0">
                      <div className="flex flex-col gap-3">
                        <textarea
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-medium text-slate-900 placeholder:text-slate-400 resize-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all custom-scrollbar"
                          placeholder="Type a secret note..."
                          value={noteInput} onChange={e => setNoteInput(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddNote(); } }}
                          rows={3}
                        />
                        <button onClick={handleAddNote} disabled={!noteInput.trim()} className="w-full py-3 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-md disabled:bg-slate-200 disabled:text-slate-400 hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                          <Save size={16} /> Save Note
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 bg-white sticky bottom-0 z-20">
               {imagePreview && (
                <div className="mb-4 relative inline-block">
                  <img src={imagePreview} className="h-24 rounded-2xl border-4 border-white shadow-xl" alt="Preview"/>
                  <button onClick={() => {setImagePreview(null); setImageFile(null);}} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform"><X size={12}/></button>
                </div>
              )}
              <div className="flex items-end gap-3 max-w-5xl mx-auto">
                <div className="relative group shrink-0">
                  <input type="file" id="chat-file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  <label htmlFor="chat-file" className="w-12 h-12 bg-white text-slate-400 border-2 border-slate-200 rounded-[16px] flex items-center justify-center cursor-pointer hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all shadow-sm">
                    <ImageIcon className="w-5 h-5" strokeWidth={2} />
                  </label>
                </div>
                 
                <div className="flex-1 bg-white border-2 border-slate-200 rounded-[28px] flex items-end p-1.5 transition-all focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 shadow-sm">
                   <textarea 
                    rows={1}
                    value={messageInput} onChange={e => setMessageInput(e.target.value)}
                    onKeyDown={e => {if(e.key === 'Enter' && !e.shiftKey) {e.preventDefault(); handleSendMessage();}}}
                    placeholder="Type your message here..."
                    className="flex-1 bg-transparent border-none py-2.5 px-3.5 text-[15px] font-medium text-slate-900 outline-none resize-none max-h-32 placeholder:text-slate-400 placeholder:font-normal custom-scrollbar"
                  />
                  <motion.button 
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={handleSendMessage} disabled={!messageInput.trim() && !imageFile}
                    className="w-11 h-11 bg-blue-600 text-white rounded-[16px] flex items-center justify-center shadow-md disabled:bg-slate-200 disabled:shadow-none hover:bg-blue-500 transition-all shrink-0"
                  >
                    <Send className="w-4 h-4 ml-0.5" strokeWidth={2.5} />
                  </motion.button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-20 gap-6 bg-slate-50/50">
             <div className="relative">
                <div className="absolute -inset-4 bg-blue-500/10 blur-2xl rounded-full"></div>
                <div className="relative w-24 h-24 bg-white rounded-[32px] flex items-center justify-center shadow-xl border border-slate-100 text-blue-500">
                  <MessageSquare size={40} strokeWidth={1.5} />
                </div>
             </div>
             <div>
               <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Select a conversation</h3>
               <p className="text-slate-500 text-sm font-medium max-w-xs mx-auto leading-relaxed">Choose a chat from the left menu to start negotiating securely.</p>
             </div>
          </div>
        )}
      </div>

      {/* Context Menu Modal */}
      <AnimatePresence>
        {showContextMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-transparent"
              onClick={() => setShowContextMenu(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{ left: contextMenuPosition.x, top: contextMenuPosition.y }}
              className="fixed bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 min-w-[200px]"
            >
              <div className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Move to Folder</div>
              {safeFoldersArray.filter(f => f !== 'All').map(folder => (
                <button
                  key={folder}
                  onClick={() => handleMoveToFolder(showContextMenu, folder)}
                  className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors flex items-center gap-3"
                >
                  <Folder className="w-4 h-4 text-slate-400" />
                  {folder}
                </button>
              ))}
              <div className="border-t border-slate-100 my-2"></div>
              <div className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Apply Label</div>
              {safeLabelDefs.map(label => (
                <button
                  key={label.name}
                  onClick={() => {
                    handleUpdateLabels(showContextMenu, label);
                    setShowContextMenu(null);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors flex items-center gap-3"
                >
                  <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: label.color || '#ccc' }} />
                  {label.name}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Label Management Modal */}
      <AnimatePresence>
        {showLabelMenuModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowLabelMenuModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[32px] p-8 w-full max-w-sm shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Manage Labels</h3>
                <button onClick={() => setShowLabelMenuModal(null)} className="text-slate-400 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 p-2 rounded-xl transition-all"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-3 mb-8 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                {safeLabelDefs.map(label => {
                  if (!label || !label.name) return null;
                  const room = safeRooms.find(r => r?.room_id === showLabelMenuModal);
                  const roomLabels = Array.isArray(room?.labels) ? room.labels.map(l => typeof l === 'object' ? l : { name: l }) : [];
                  const isActive = roomLabels.some(l => l?.name === label.name);
                  return (
                    <button
                      key={label.name}
                      onClick={() => handleUpdateLabels(showLabelMenuModal, label)}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all border-2 ${
                        isActive ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full shadow-inner border border-black/10" style={{ backgroundColor: label.color || '#ccc' }} />
                      <span className={`text-sm font-bold ${isActive ? 'text-blue-700' : 'text-slate-700'}`}>{label.name}</span>
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <input type="text" placeholder="New label name..." value={newLabelName || ''} onChange={e => setNewLabelName(e.target.value)} className="flex-1 px-4 py-3 bg-slate-50 border-2 border-slate-100 focus:border-blue-400 focus:bg-white rounded-xl text-sm font-medium outline-none transition-all" />
                <input type="color" value={newLabelColor || '#3b82f6'} onChange={e => setNewLabelColor(e.target.value)} className="w-12 h-12 border-0 rounded-xl p-0 bg-transparent shrink-0 cursor-pointer" />
                <button onClick={handleCreateLabel} disabled={!(newLabelName?.trim())} className="px-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white rounded-xl text-sm font-bold transition-all shadow-md">Add</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}