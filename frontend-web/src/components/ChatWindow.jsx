import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Send, Shield, Loader2, Diamond, CheckCheck,
  Check, Minimize2, Maximize2, Phone, MoreHorizontal,
  Image as ImageIcon, Smile, Paperclip, Trash2, MessageCircle
} from 'lucide-react';
import { io } from 'socket.io-client';
import API from '../services/api';
import { useLocation } from 'react-router-dom';
import { getImageUrl } from '../utils/imageUtil';
import toast from 'react-hot-toast';

const SOCKET_URL = 'http://localhost:5001';

// Socket singleton - initialized outside component to prevent React 18 double-mount issues
// Auth will be set dynamically in useEffect when token is available
const socket = io(SOCKET_URL, { transports: ['websocket'] });

function parseJwt(token) {
  try { return JSON.parse(atob(token.split('.')[1])); }
  catch { return null; }
}

const ROLE_COLORS = {
  buyer:  { bg: 'bg-blue-50',    text: 'text-blue-700',    dot: 'bg-blue-500'   },
  seller: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  admin:  { bg: 'bg-purple-50',  text: 'text-purple-700',  dot: 'bg-purple-500'  },
};

function MessageBubble({ msg, isOwn, prevMsg, onDelete, onReact }) {
  const [showPicker, setShowPicker] = useState(false);
  const REACTIONS = ['👍', '❤️', '🔥', '😂', '😮'];
  
  if (!msg) return null;
  const showAvatar = !prevMsg || prevMsg.sender_id !== msg.sender_id;
  const rc = ROLE_COLORS[msg.sender_role] || ROLE_COLORS.buyer;
  const time = new Date(msg?.createdAt ?? Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`flex items-end gap-2.5 ${isOwn ? 'flex-row-reverse' : 'flex-row'} ${!showAvatar ? (isOwn ? 'pr-10' : 'pl-10') : ''} mb-1`}
    >
      {/* Avatar */}
      {showAvatar && !isOwn && (
        <div className="w-8 h-8 rounded-full bg-slate-100 flex-shrink-0 flex items-center justify-center overflow-hidden mb-1 border border-slate-200">
          <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
            {msg.sender_name?.charAt(0) || '?'}
          </span>
        </div>
      )}
      {showAvatar && isOwn && (
        <div className="w-8 h-8 rounded-full bg-slate-900 flex-shrink-0 flex items-center justify-center overflow-hidden mb-1 shadow-sm">
          <span className="text-[11px] font-black text-white uppercase tracking-wider">
            {msg.sender_name?.charAt(0) || 'Y'}
          </span>
        </div>
      )}

      <div className={`flex flex-col gap-1 max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* Name and Role Badge */}
        {showAvatar && (
          <div className={`flex items-center gap-2 px-1 mb-0.5 ${isOwn ? 'flex-row-reverse' : ''}`}>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {isOwn ? 'You' : msg.sender_name}
            </span>
            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-white/50 ${rc.bg} ${rc.text}`}>
              {msg.sender_role}
            </span>
          </div>
        )}

        {/* Message Bubble Container */}
        <div className={`group relative ${msg.type === 'image' ? 'p-1.5 bg-white border border-slate-100' : 'px-4 py-3'} rounded-[20px] text-[14px] leading-relaxed break-words transition-all shadow-sm ${
          isOwn
            ? msg.type === 'image' ? 'rounded-br-sm' : 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-sm shadow-blue-500/20'
            : msg.type === 'image' ? 'rounded-bl-sm' : 'bg-white border border-slate-100 text-slate-800 rounded-bl-sm hover:bg-slate-50'
        }`}>
          {msg?.type === 'image' ? (
             <img src={getImageUrl(msg?.text || '')} className="max-w-[220px] rounded-xl object-contain" alt="Attachment" />
          ) : (
             msg?.text
          )}

          {/* Reaction Hover Button */}
          <div className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all z-20 flex gap-1 ${isOwn ? '-left-10' : '-right-10'}`}>
             <button onClick={() => setShowPicker(!showPicker)} className="p-1.5 rounded-full text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-all bg-white shadow-md border border-slate-100">
                <Smile size={14} />
             </button>
          </div>
          
          {/* Emoji Picker Popover */}
          {showPicker && (
            <div className={`absolute top-0 -translate-y-[110%] ${isOwn ? 'right-0' : 'left-0'} bg-white border border-slate-100 shadow-xl rounded-full px-2 py-1.5 flex items-center gap-1 z-30`}>
               {REACTIONS.map(emoji => (
                 <button key={emoji} onClick={() => { onReact?.(msg._id, emoji); setShowPicker(false); }} className="hover:scale-125 transition-transform text-lg leading-none p-1.5">{emoji}</button>
               ))}
            </div>
          )}

          {/* Active Reactions */}
          {msg?.reactions?.length > 0 && (
            <div className={`absolute -bottom-3 flex items-center gap-1 bg-white border border-slate-100 px-2 py-0.5 rounded-full shadow-sm z-10 text-xs ${isOwn ? 'right-4' : 'left-4'}`}>
              {Array.from(new Set(msg.reactions.map(r => r.emoji))).map(e => (
                <span key={e}>{e}</span>
              ))}
              <span className="font-black text-slate-400 ml-1 text-[10px]">{msg.reactions.length}</span>
            </div>
          )}

          {/* Unseen Deletion Button */}
          {isOwn && !msg?.is_read && (
            <button
              onClick={() => onDelete?.(msg?._id)}
              className="absolute -left-10 top-1/2 -translate-y-1/2 p-1.5 bg-red-50 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white border border-red-100"
              title="Delete message"
            >
              <Trash2 size={12} />
            </button>
          )}

          {/* Time and Read Receipt */}
          <div className={`flex items-center gap-1.5 mt-1.5 ${isOwn ? 'justify-end' : 'justify-start'} ${msg.type==='image'?'absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-slate-900/70 backdrop-blur-md text-white/90':''}`}>
            <span className={`text-[9px] font-bold tracking-wider ${isOwn ? (msg.type==='image' ? 'text-white/90' : 'text-blue-100') : 'text-slate-400'} ${msg.type==='image'?'text-white/90':''}`}>{time}</span>
            {isOwn && (
              msg.is_read 
                ? <CheckCheck size={12} className={msg.type === 'image' ? "text-emerald-400" : "text-blue-200"} strokeWidth={2.5} /> 
                : <Check size={12} className={msg.type === 'image' ? "text-white/60" : "text-blue-300/50"} strokeWidth={2.5} />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function TypingIndicator({ name }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
      className="flex items-end gap-2.5 pl-2 mt-2"
    >
      <div className="w-8 h-8 rounded-full bg-slate-100 flex-shrink-0 flex items-center justify-center border border-slate-200">
        <span className="text-[11px] font-black text-slate-400 uppercase">{name?.charAt(0) || '?'}</span>
      </div>
      <div className="bg-white border border-slate-100 shadow-sm px-4 py-3.5 rounded-[20px] rounded-bl-sm flex items-center gap-1.5">
        {[0, 1, 2].map(i => (
          <motion.div key={i}
            className="w-1.5 h-1.5 rounded-full bg-slate-300"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </motion.div>
  );
}

export default function ChatWindow({ gem, onClose, initialMessage }) {
  const token     = localStorage.getItem('token');
  const decoded   = parseJwt(token);
  const currentUserId   = decoded?.id;
  const currentUserRole = localStorage.getItem('role') || 'buyer';

  const gemId = gem?._id;
  const gemName = gem?.name ?? '';
  const buyerId  = currentUserRole === 'seller' ? gem?.buyer_id_for_room : currentUserId;
  const sellerId = gem?.seller_id;
  const roomId   = gemId && buyerId != null && sellerId != null ? `${gemId}_${buyerId}_${sellerId}` : null;

  const [messages,    setMessages]    = useState([]);
  const [input,       setInput]       = useState(initialMessage || '');
  const [connected,   setConnected]   = useState(false);
  const [loading,     setLoading]     = useState(true);
  const [typingUser,  setTypingUser]  = useState(null);
  const [minimized,   setMinimized]   = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOnline,    setIsOnline]    = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSending,   setIsSending]   = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);

  const bottomRef     = useRef(null);
  const inputRef      = useRef(null);
  const typingTimeout = useRef(null);
  const isAtBottom    = useRef(true);

  const roomDataRef   = useRef({ roomId, gemId, gemName, gemImage: gem?.image_url, buyerId, sellerId });

  // Update room data ref whenever room details change so socket callbacks always have fresh data 
  // without needing to be re-registered.
  useEffect(() => {
    roomDataRef.current = { roomId, gemId, gemName, gemImage: gem?.image_url, buyerId, sellerId };
  }, [roomId, gemId, gemName, gem?.image_url, buyerId, sellerId]);

  useEffect(() => {
    const loadHistory = async () => {
      if (!roomId) { setLoading(false); return; }
      try {
        const { data } = await API.get(`/chat/room/${roomId}`);
        setMessages(data.messages || []);
      } catch { /* silent */ } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, [roomId]);

    // Socket event listeners setup and cleanup - EXACT PATTERN REQUESTED
    useEffect(() => {
      if (!token) return;

      // Set auth for socket connection
      socket.auth = { token };
      
      // Connect socket if not already connected
      if (!socket.connected) {
        socket.connect();
      }

      const handleReceive = (data) => {
        // Add to state ONLY if it doesn't already exist to prevent UI duplicates
        setMessages((prev) => {
          if (prev.some(msg => msg._id === data._id)) return prev;
          return [...prev, data];
        });
      };
      
      socket.on("receive_message", handleReceive);
      
      socket.on('connect', () => {
        const rd = roomDataRef.current;
        if (!rd.roomId || !rd.gemId) return;
        
        setConnected(true);
        setIsOnline(true);
        socket.emit('join_room', {
          room_id:       rd.roomId,
          gem_id:        rd.gemId,
          gem_name:      rd.gemName,
          gem_image_url: rd.gemImage || null,
          buyer_id:      rd.buyerId,
          seller_id:     rd.sellerId,
        });
      });

      socket.on('user_typing', ({ sender_id, sender_name }) => {
        // Decode inside to avoid closure staleness
        const currentId = parseJwt(localStorage.getItem('token'))?.id;
        if (sender_id !== currentId) setTypingUser(sender_name || 'Someone');
      });

      socket.on('user_stop_typing', () => setTypingUser(null));
      
      socket.on('messages_read', ({ reader_id }) => {
        const currentId = parseJwt(localStorage.getItem('token'))?.id;
        if (reader_id !== currentId) {
          setMessages(prev => prev.map(m => m.sender_id === currentId ? { ...m, is_read: true } : m));
        }
      });

      socket.on('message_deleted', (deletedId) => {
        setMessages(prev => prev.filter(m => m._id !== deletedId));
      });

      socket.on('reaction_updated', (payload) => {
        const { message_id, reactions } = payload;
        if (!message_id) return;
        setMessages(prev => prev.map(m => m._id === message_id ? { ...m, reactions } : m));
      });

      socket.on('disconnect', () => { 
        setConnected(false); 
        setIsOnline(false); 
      });

      // Cleanup function to remove listeners (but keep socket connected)
      return () => {
        socket.off("receive_message", handleReceive);
        socket.off('connect');
        socket.off('user_typing');
        socket.off('user_stop_typing');
        socket.off('messages_read');
        socket.off('message_deleted');
        socket.off('reaction_updated');
        socket.off('disconnect');
      };
    }, [token]); // Re-setup listeners only if token changes

   useEffect(() => {
     if (connected && !minimized && roomId) {
       socket.emit('mark_read', { room_id: roomId });
     }
   }, [connected, minimized, messages.length]);

  useEffect(() => {
    if (!minimized) {
      setUnreadCount(0);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  }, [messages, minimized]);

    const handleDeleteMessage = (message_id) => {
      if (!socket.connected || !roomId) return;
      socket.emit('delete_message', { room_id: roomId, message_id });
    };

    const handleReact = (message_id, emoji) => {
      if (!socket.connected || !roomId) return;
      socket.emit('add_reaction', { room_id: roomId, message_id, emoji });
    };

   const handleSend = useCallback(() => {
     const text = input.trim();
     if (!text || !socket.connected || !roomId || isSending) return;
     
     setIsSending(true);
     
     // Real-Time Message State Update (Frontend) Fix
     const newMessage = {
       _id: `__temp__${Date.now()}_${Math.random()}`,
       room_id: roomId,
       sender_id: currentUserId,
       sender_role: currentUserRole,
       sender_name: 'You',
       text: text,
       type: 'text',
       createdAt: new Date().toISOString()
     };
     
     setMessages(prev => [...prev, newMessage]);
 
     socket.emit('send_message', { room_id: roomId, text });
     setInput('');
     clearTimeout(typingTimeout.current);
     socket.emit('stop_typing', { room_id: roomId });
     setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 60);
 
     setTimeout(() => { setIsSending(false); }, 300);
   }, [input, roomId, currentUserId, currentUserRole, isSending]);

    const handleImageUpload = async (e) => {
      const files = Array.from(e.target.files);
      if (!files.length || !socket.connected || !roomId || isUploading) return;

      // Calculate total images if these new ones are added
      const currentTotal = selectedImages.length;
      const newFilesTotal = e.target.files.length;

      if (currentTotal + newFilesTotal > 3) {
        toast.error("You can only attach a maximum of 3 images per message!");
        e.target.value = "";
        return;
      }

      const validFiles = [];
      const tempMessages = [];

      // Strict 5MB file limit validation entirely before interacting with the DOM
      for (const file of files) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error('File size must be under 5MB!');
          e.target.value = '';
          return;
        }
        validFiles.push(file);
      }

      if (validFiles.length === 0) {
        e.target.value = '';
        return;
      }

      // Set uploading state to prevent duplicate submissions
      setIsUploading(true);

      // ── Step 1 & 2: Local Optimistic Rendering ──────────
      for (const file of validFiles) {
        const localPreviewUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (ev) => resolve(ev.target.result);
          reader.readAsDataURL(file);
        });
        
        const optimisticMsg = {
          _id:         `__temp__${Date.now()}_${Math.random()}`,
          room_id:     roomId,
          sender_id:   currentUserId,
          sender_role: currentUserRole,
          sender_name: 'You',
          text:        localPreviewUrl,
          type:        'image',
          createdAt:   new Date().toISOString(),
          is_read:     false,
          reactions:   [],
          __isOptimistic: true,
        };
        tempMessages.push(optimisticMsg);
      }

      // Track selected images for current message composition
      setSelectedImages(prev => [...prev, ...validFiles]);
      setMessages(prev => [...prev, ...tempMessages]);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 60);

      // ── Step 3: Bundle & dispatch securely directly towards Cloudinary via node server ────
      const formData = new FormData();
      validFiles.forEach(file => formData.append('images', file));

      try {
        const { data } = await API.post('/chat/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        const imageUrls = data?.imageUrls || [];

        // Sequentially map each returned real Cloudinary URL to the optimistic models
        setMessages(prev => {
          let newMsgs = [...prev];
          for(let i = 0; i < tempMessages.length; i++) {
            if (imageUrls[i]) {
              newMsgs = newMsgs.map(m => m._id === tempMessages[i]._id ? { ...m, _id: tempMessages[i]._id + '_confirmed', text: imageUrls[i], __isOptimistic: false } : m);
            }
          }
          return newMsgs;
        });

        // Propagate universally through sockets
        for (const realUrl of imageUrls) {
          socket.emit('send_message', { room_id: roomId, text: realUrl, type: 'image' });
        }
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 60);
        
        // Clear selected images after successful upload
        setSelectedImages([]);
      } catch (err) {
        console.error('Image upload failed', err);
        toast.error('Image upload failed');
        const tempIds = tempMessages.map(m => m._id);
        setMessages(prev => prev.filter(m => !tempIds.includes(m._id)));
        
        // Clear selected images on failure
        setSelectedImages([]);
      } finally {
        // Reset uploading state
        setIsUploading(false);
      }
      
      e.target.value = '';
    };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

   const handleInputChange = (e) => {
     setInput(e.target.value);
     if (!socket.connected || !roomId) return;
     socket.emit('typing', { room_id: roomId });
     clearTimeout(typingTimeout.current);
     typingTimeout.current = setTimeout(() => {
       socket.emit('stop_typing', { room_id: roomId });
     }, 1800);
   };

  const toggleMinimize = () => {
    setMinimized(m => !m);
    if (minimized) setUnreadCount(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 24, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      style={{ zIndex: 100 }}
      className={`fixed bottom-6 right-4 sm:right-6 flex flex-col bg-slate-50 rounded-[28px] shadow-2xl border border-slate-200 overflow-hidden transition-all duration-500 ${
        minimized ? 'w-[320px] h-auto' : 'w-[400px] h-[600px] max-h-[calc(100vh-100px)]'
      }`}
    >
      {/* ── Premium Header ── */}
      <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 bg-slate-900 border-b border-slate-800 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full mix-blend-screen filter blur-[50px] opacity-20"></div>
        
        <div className="flex items-center gap-3 min-w-0 relative z-10">
          <div className="relative flex-shrink-0">
            {gem?.image_url ? (
              <img src={getImageUrl(gem.image_url)} alt={gemName}
                className="w-10 h-10 rounded-[14px] object-cover ring-2 ring-white/10 shadow-sm" />
            ) : (
              <div className="w-10 h-10 rounded-[14px] bg-slate-800 flex items-center justify-center border border-white/5">
                <Diamond size={18} className="text-slate-400" />
              </div>
            )}
            {/* Online Status Indicator */}
         </div>
          <div className="min-w-0">
            <p className="text-sm font-black text-white truncate">{gemName || 'Negotiation'}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              Encrypted Channel
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0 relative z-10">
          <button onClick={toggleMinimize}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all relative">
            {minimized ? <Maximize2 size={14} strokeWidth={2.5} /> : <Minimize2 size={14} strokeWidth={2.5} />}
            {minimized && unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-slate-900">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 hover:bg-red-500/20 text-slate-300 hover:text-red-400 transition-all">
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Security Banner */}
      {!minimized && (
        <div className="flex-shrink-0 flex items-center justify-center gap-2 py-2 bg-blue-50 border-b border-blue-100/50">
          <Shield size={12} className="text-blue-500" strokeWidth={2.5} />
          <p className="text-[10px] font-bold text-blue-700 uppercase tracking-widest">
            End-to-End Secure Negotiation
          </p>
        </div>
      )}

      <AnimatePresence>
        {!minimized && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex flex-col flex-1 overflow-hidden"
          >
            {/* ── Messages Area ── */}
            <div
              className="flex-1 overflow-y-auto px-4 py-6 space-y-4 scroll-smooth"
              onScroll={(e) => {
                const el = e.currentTarget;
                isAtBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
              }}
            >
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <Loader2 size={24} className="text-slate-300 animate-spin" />
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Syncing Messages</span>
                </div>
              ) : (messages || []).length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6">
                  <div className="w-16 h-16 rounded-[20px] bg-white border border-slate-100 shadow-sm flex items-center justify-center">
                    <MessageCircle size={28} className="text-blue-500" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-base font-black text-slate-900 mb-1">Start the Conversation</p>
                    <p className="text-xs font-medium text-slate-500 leading-relaxed">Ask about the gemstone's authenticity, negotiate the price, or arrange delivery.</p>
                  </div>
                </div>
              ) : (
                (messages || [])
                  .filter(Boolean)
                  .map((msg, idx) => (
                    <MessageBubble
                      key={msg._id || idx}
                      msg={msg}
                      isOwn={msg.sender_id === currentUserId}
                      prevMsg={messages[idx - 1]}
                      onDelete={handleDeleteMessage}
                      onReact={handleReact}
                    />
                  ))
              )}

              <AnimatePresence>
                {typingUser && <TypingIndicator name={typingUser} />}
              </AnimatePresence>
              <div ref={bottomRef} className="h-2" />
            </div>

            {/* ── Input Area ── */}
            <div className="flex-shrink-0 p-4 bg-white border-t border-slate-100 relative z-20">
              <div className="flex items-end gap-2 bg-slate-50 rounded-[20px] border border-slate-200 p-2 focus-within:bg-white focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all shadow-inner">
                
                {/* Image Upload Button */}
                <label className="p-2.5 cursor-pointer text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all flex-shrink-0">
                   <ImageIcon size={20} strokeWidth={2} />
                   <input type="file" accept="image/*" multiple hidden onChange={handleImageUpload} />
                </label>
                
                {/* Text Area */}
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  rows={1}
                  style={{ resize: 'none', maxHeight: '120px' }}
                  className="flex-1 bg-transparent text-[14px] font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none py-3 px-1 custom-scrollbar"
                />
                
                 {/* Send Button */}
                 <motion.button
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                   onClick={handleSend}
                   disabled={!input.trim() || !connected || isSending || isUploading}
                   className="w-10 h-10 flex-shrink-0 bg-slate-900 text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-600/20 mb-0.5"
                 >
                   {isSending || isUploading ? (
                     <Loader2 size={14} strokeWidth={2} className="ml-0.5 animate-spin" />
                   ) : (
                     <Send size={16} strokeWidth={2.5} className="ml-0.5" />
                   )}
                 </motion.button>
              </div>
              
              {/* Connection Status Text */}
              {!connected && (
                <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mt-2 flex items-center justify-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Reconnecting to server...
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}