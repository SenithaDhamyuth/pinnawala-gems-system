import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserCircle2, Home, LayoutDashboard, LogOut, ChevronDown, MessageSquare, ShoppingBag, Settings, Store } from 'lucide-react';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role') || 'buyer';

  const shouldShow = useMemo(() => {
    if (!token) return false;
    const hiddenRoutes = ['/login', '/register', '/seller-register'];
    return !hiddenRoutes.includes(location.pathname);
  }, [token, location.pathname]);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e) => {
      if (!menuRef.current) return;
      if (menuRef.current.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    sessionStorage.clear();
    navigate('/login', { replace: true });
  };

  if (!shouldShow) return null;

  // Role-based navigation items
  const getNavItems = () => {
    const baseItems = [
      {
        label: 'Home',
        icon: Home,
        path: '/',
        onClick: () => navigate('/'),
        show: true
      }
    ];

    if (role === 'seller') {
      baseItems.push(
        {
          label: 'Marketplace',
          icon: ShoppingBag,
          path: '/marketplace',
          onClick: () => navigate('/marketplace'),
          show: true
        },
        {
          label: 'My Shop',
          icon: Store,
          path: '/shop-customization',
          onClick: () => navigate('/shop-customization'),
          show: true
        },
        {
          label: 'Messages',
          icon: MessageSquare,
          path: '/messages',
          onClick: () => navigate('/messages'),
          show: true
        }
      );
    } else if (role === 'buyer') {
      baseItems.push(
        {
          label: 'Marketplace',
          icon: ShoppingBag,
          path: '/marketplace',
          onClick: () => navigate('/marketplace'),
          show: true
        },
        {
          label: 'My Orders',
          icon: ShoppingBag,
          path: '/buyer',
          onClick: () => navigate('/buyer'),
          show: true
        },
        {
          label: 'Messages',
          icon: MessageSquare,
          path: '/messages',
          onClick: () => navigate('/messages'),
          show: true
        }
      );
    } else if (role === 'admin') {
      baseItems.push(
        {
          label: 'Marketplace',
          icon: ShoppingBag,
          path: '/marketplace',
          onClick: () => navigate('/marketplace'),
          show: true
        },
        {
          label: 'Dashboard',
          icon: LayoutDashboard,
          path: '/admin',
          onClick: () => navigate('/admin'),
          show: true
        },
        {
          label: 'Support Tickets',
          icon: MessageSquare,
          path: '/admin/support',
          onClick: () => navigate('/admin/support'),
          show: true
        }
      );
    }

    return baseItems;
  };

  const navItems = getNavItems();

  return (
    <nav className="fixed top-0 w-full h-[72px] glass border-b border-white/10 z-[100] shadow-lg">
      <div className="h-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between h-full">
          {/* Premium Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform"
            onClick={() => navigate('/')}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="text-white font-bold text-sm">PG</span>
            </div>
            <span className="text-xl font-serif font-bold text-slate-900 tracking-tight">Pinnawala Gems</span>
          </div>

          {/* Premium Navigation Items */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <motion.button
                key={item.label}
                onClick={item.onClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className={`px-5 py-3 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 ${
                  location.pathname === item.path
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20'
                    : 'text-slate-600 hover:bg-white/50 hover:text-slate-900'
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </motion.button>
            ))}
          </div>

          {/* Right side - Premium Notifications and User Menu */}
          <div className="flex items-center gap-3">
            {/* Premium Notification Bell */}
            <div className="glass rounded-2xl p-2 border border-white/20">
              <NotificationBell />
            </div>

            {/* Premium User Menu */}
            <div className="relative" ref={menuRef}>
              <motion.button
                type="button"
                onClick={() => setOpen(v => !v)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl glass border border-white/20 hover:bg-white/30 transition-all"
              >
                <UserCircle2 size={20} className="text-slate-700" />
                <ChevronDown size={14} className={`text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
              </motion.button>

              {open && (
                <motion.div 
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="absolute top-full right-0 mt-3 w-52 glass border border-white/20 rounded-2xl shadow-2xl shadow-slate-900/10 p-2 z-[100]"
                >
                  <button
                    type="button"
                    onClick={() => navigate(getDashboardByRole(role))}
                    className="w-full px-4 py-3 rounded-xl text-sm font-bold text-slate-700 hover:bg-white/50 flex items-center gap-3 transition-all"
                  >
                    <LayoutDashboard size={16} />
                    Dashboard
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </motion.div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setOpen(v => !v)}
                className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50"
              >
                <ChevronDown size={20} className={`text-slate-700 transition-transform ${open ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="md:hidden border-t border-slate-200 py-2"
          >
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  item.onClick();
                  setOpen(false);
                }}
                className={`w-full px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                  location.pathname === item.path
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </div>
    </nav>
  );
}

function getDashboardByRole(role) {
  if (role === 'admin') return '/admin';
  if (role === 'seller') return '/seller';
  return '/buyer';
}
