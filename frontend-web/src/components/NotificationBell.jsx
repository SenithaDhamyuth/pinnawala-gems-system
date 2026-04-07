import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, X, Check, ExternalLink, Inbox, ShieldCheck, MessageCircle, Tag, CheckCheck, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const SOCKET_URL = 'http://localhost:5001';

const TYPE_CONFIG = {
  message: {
    icon: MessageCircle,
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    iconColor: 'text-blue-500',
    label: 'Message',
    labelBg: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400',
    toastIcon: '💬',
  },
  offer: {
    icon: Tag,
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    iconColor: 'text-emerald-500',
    label: 'Offer',
    labelBg: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400',
    toastIcon: '💎',
  },
  kyc: {
    icon: ShieldCheck,
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    iconColor: 'text-amber-500',
    label: 'KYC',
    labelBg: 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400',
    toastIcon: '🛡️',
  },
  system: {
    icon: Bell,
    bg: 'bg-slate-50 dark:bg-slate-800/40',
    iconColor: 'text-slate-500',
    label: 'System',
    labelBg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
    toastIcon: '🔔',
  },
};

function timeAgo(dateStr) {
  if (!dateStr) return '—';
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return '—';
  const diff = Date.now() - parsed.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [isOpen,        setIsOpen]        = useState(false);
  const [activeFilter,  setActiveFilter]  = useState('all');
  const [loading,       setLoading]       = useState(true);

  const dropdownRef = useRef(null);
  const navigate    = useNavigate();

  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch('http://localhost:5001/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return;
      const data = await response.json();
      const list = Array.isArray(data) ? data : [];
      setNotifications(list);
      setUnreadCount(list.filter(n => !n?.isRead).length);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = async (id) => {
    if (!id) return;
    try {
      await fetch(`http://localhost:5001/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setNotifications(prev => (Array.isArray(prev) ? prev : []).map(n => n?._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { /* silent */ }
  };

  const markAllAsRead = async () => {
    try {
      if (!localStorage.getItem('token')) return;
      await fetch('http://localhost:5001/api/notifications/read-all', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setNotifications(prev => (Array.isArray(prev) ? prev : []).map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch { /* silent */ }
  };

  const deleteNotification = async (e, id) => {
    if (!id) return;
    e.stopPropagation();
    try {
      await fetch(`http://localhost:5001/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setNotifications(prev => {
        const safePrev = Array.isArray(prev) ? prev : [];
        const n = safePrev.find(x => x?._id === id);
        if (n && !n.isRead) setUnreadCount(c => Math.max(0, c - 1));
        return safePrev.filter(x => x?._id !== id);
      });
    } catch { /* silent */ }
  };

  useEffect(() => {
    fetchNotifications();

    const token = localStorage.getItem('token');
    if (!token) return;

    const socket = io(SOCKET_URL, { auth: { token }, transports: ['websocket'] });

    socket.on('new_notification', (notification) => {
      if (!notification) return;
      setNotifications(prev => {
        const safePrev = Array.isArray(prev) ? prev : [];
        return [notification, ...safePrev].filter(Boolean).slice(0, 30);
      });
      setUnreadCount(prev => prev + (!notification?.isRead ? 1 : 0));

      const cfg = TYPE_CONFIG[notification.type] || TYPE_CONFIG.system;
      toast(notification.content, {
        icon: cfg.toastIcon,
        duration: 4000,
        style: {
          background: 'var(--toast-bg, #1e293b)',
          color: 'var(--toast-text, #f1f5f9)',
          fontSize: '13px',
          fontWeight: '500',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.08)',
          maxWidth: '340px',
        },
      });
    });

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      socket.disconnect();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [fetchNotifications]);

  const handleNotificationClick = (n) => {
    if (!n || typeof n !== 'object') return;
    if (!n?.isRead) markAsRead(n?._id);

    // Dynamic fallback based on role
    const role = localStorage.getItem('role') || 'buyer';
    const fallback = role === 'admin' ? '/admin' : role === 'seller' ? '/seller' : '/buyer';

    let targetPath = fallback;

    // Hardcoded Business Rules per Module Requirement
    if (n.type === 'message' || n.type === 'offer') {
      targetPath = '/messages';
    } else if (n.type === 'kyc') {
      targetPath = '/admin'; // Admin dashboard manages KYC
    } else if (typeof n?.link === 'string' && n.link && n.link !== 'undefined' && n.link !== 'null') {
      // Allow valid dynamic links if they aren't the primary types above
      targetPath = n.link;
    }

    try {
      navigate(targetPath);
    } catch (err) {
      console.error('[Notifications] Navigation failed:', err.message);
      navigate(fallback);
    }
    
    setIsOpen(false);
  };

  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const filtered = activeFilter === 'all'
    ? safeNotifications
    : activeFilter === 'unread'
      ? safeNotifications.filter(n => !n?.isRead)
      : safeNotifications.filter(n => n?.type === activeFilter);

  const filters = ['all', 'unread', 'offer', 'message', 'kyc'];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
      >
        <motion.div animate={unreadCount > 0 ? { rotate: [0, -12, 12, -8, 8, 0] } : {}} transition={{ duration: 0.5, delay: 0.2 }}>
          <Bell size={20} strokeWidth={1.8} />
        </motion.div>

        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold leading-none shadow-sm"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="absolute right-0 mt-2 w-[380px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-black/10 dark:shadow-black/40 overflow-hidden z-50"
            style={{ maxHeight: '520px' }}
          >
            {/* Header */}
            <div className="px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 text-[10px] font-bold rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead}
                  className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
                  <CheckCheck size={12} />
                  Mark all read
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="px-4 py-2.5 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 overflow-x-auto scrollbar-none">
              {filters.map(f => (
                <button key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`flex-shrink-0 px-3 py-1 rounded-full text-[11px] font-semibold capitalize transition-all ${
                    activeFilter === f
                      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {f === 'all' ? `All (${notifications.length})` : f}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="overflow-y-auto" style={{ maxHeight: '360px' }}>
              {!Array.isArray(filtered) || loading ? (
                <div className="py-12 flex flex-col items-center gap-2">
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-slate-400">Loading…</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-12 flex flex-col items-center gap-3 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Inbox size={20} className="text-slate-400" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">All caught up</p>
                    <p className="text-xs text-slate-400 mt-0.5">No notifications here</p>
                  </div>
                </div>
              ) : (
                filtered.filter(Boolean).map((n, i) => {
                  const cfg = TYPE_CONFIG[n?.type] || TYPE_CONFIG.system;
                  const Icon = cfg.icon;
                  return (
                    <motion.div
                      key={n?._id ?? i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => handleNotificationClick(n)}
                      className={`group relative flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-colors border-b border-slate-50 dark:border-slate-800/60 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                        !n?.isRead ? 'bg-blue-50/40 dark:bg-blue-950/10' : ''
                      }`}
                    >
                      {/* Unread dot */}
                      {!n?.isRead && (
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-500" />
                      )}

                      {/* Icon */}
                      <div className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center ${cfg.bg}`}>
                        <Icon size={16} className={cfg.iconColor} strokeWidth={1.8} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md ${cfg.labelBg}`}>
                            {cfg.label}
                          </span>
                          <span className="text-[10px] text-slate-400">{timeAgo(n?.createdAt)}</span>
                        </div>
                        <p className={`text-[13px] leading-relaxed ${!n?.isRead ? 'font-semibold text-slate-800 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'}`}>
                          {n?.content ?? ''}
                        </p>
                        {typeof n?.link === 'string' && n.link && (
                          <p className="text-[11px] text-blue-500 mt-0.5 flex items-center gap-0.5">
                            <ExternalLink size={10} />View details
                          </p>
                        )}
                      </div>

                      {/* Delete (hover) */}
                      <button
                        onClick={(e) => deleteNotification(e, n?._id)}
                        className="opacity-0 group-hover:opacity-100 flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-300 hover:text-red-500 transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  Close panel
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}