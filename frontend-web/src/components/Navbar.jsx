import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserCircle2, Home, LayoutDashboard, LogOut, ChevronDown, MessageSquare, ShoppingBag, Settings, Store, Menu, X, Gavel,Calendar } from 'lucide-react';
import NotificationBell from './NotificationBell'; // Ensure this file exists

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role') || 'buyer';
  const userName = localStorage.getItem('name') || 'User';

  // Hide navbar completely on auth pages
  const hiddenRoutes = ['/login', '/register', '/seller-register'];
  const shouldHide = hiddenRoutes.includes(location.pathname);

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
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    sessionStorage.clear();
    navigate('/login', { replace: true });
  };

  if (shouldHide) return null;

  // ==========================================
  // PUBLIC NAVBAR (NOT LOGGED IN)
  // ==========================================
  if (!token) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate('/')}
            className="text-xl font-black text-slate-900 flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#004AAD] to-[#00B4D8] flex items-center justify-center shadow-md">
              <span className="text-white font-black text-sm">PG</span>
            </div>
            Pinnawala
          </motion.button>

          <div className="hidden md:flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
              className="px-6 py-2 text-slate-700 font-bold hover:bg-slate-100 rounded-xl transition-all"
            >
              Login
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/register')}
              className="px-6 py-2 bg-gradient-to-r from-[#004AAD] to-[#00B4D8] text-white font-bold rounded-xl shadow-md hover:opacity-90 transition-all"
            >
              Register
            </motion.button>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-all"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden border-t border-slate-200 bg-white"
          >
            <div className="px-6 py-4 space-y-3 flex flex-col">
              <button
                onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
                className="w-full px-4 py-3 text-slate-700 font-bold hover:bg-slate-100 rounded-lg transition-all text-left"
              >
                Login
              </button>
              <button
                onClick={() => { navigate('/register'); setMobileMenuOpen(false); }}
                className="w-full px-4 py-3 bg-gradient-to-r from-[#004AAD] to-[#00B4D8] text-white font-bold rounded-lg hover:opacity-90 transition-all"
              >
                Register
              </button>
            </div>
          </motion.div>
        )}
      </nav>
    );
  }

  // ==========================================
  // AUTHENTICATED NAVBAR (PREMIUM UI)
  // ==========================================
  const getNavItems = () => {
    const baseItems = [
      { label: 'Home', icon: Home, path: '/', onClick: () => navigate('/') },
      { label: 'Marketplace', icon: ShoppingBag, path: '/marketplace', onClick: () => navigate('/marketplace') },
      { label: 'Appointments', icon: Calendar, path: '/dashboard/appointments', onClick: () => navigate('/dashboard/appointments') }
    ];

    if (role === 'seller') {
      baseItems.push(
        { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard/inventory', onClick: () => navigate('/dashboard/inventory') },
        { label: 'Messages', icon: MessageSquare, path: '/messages', onClick: () => navigate('/messages') }
      );
     } else if (role === 'buyer') {
       baseItems.push(
         { label: 'My Offers', icon: Store, path: '/dashboard/my-offers', onClick: () => navigate('/dashboard/my-offers') },
         { label: 'Auctions', icon: Gavel, path: '/dashboard/auctions', onClick: () => navigate('/dashboard/auctions') },
         { label: 'Messages', icon: MessageSquare, path: '/messages', onClick: () => navigate('/messages') }
       );
     }
    return baseItems;
  };

  const navItems = getNavItems();

  const getDashboardByRole = (role) => {
    if (role === 'admin') return '/admin';
    if (role === 'seller') return '/dashboard/inventory';
    return '/buyer';
  };

  return (
    <nav className="fixed top-0 w-full h-[72px] bg-white/90 backdrop-blur-md border-b border-slate-200 z-[100] shadow-sm">
      <div className="h-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between h-full">
          
          <div 
            className="flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform"
            onClick={() => navigate('/')}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-[#004AAD] to-[#00B4D8] rounded-2xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm">PG</span>
            </div>
            <span className="text-xl font-serif font-bold text-slate-900 tracking-tight hidden sm:block">Pinnawala Gems</span>
          </div>

          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <motion.button
                key={item.label}
                onClick={item.onClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                  location.pathname === item.path || location.pathname.startsWith(item.path) && item.path !== '/'
                    ? 'bg-blue-50 text-[#004AAD]'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </motion.button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-50 rounded-xl p-2 border border-slate-200">
              <NotificationBell /> 
            </div>

            <div className="relative" ref={menuRef}>
              <motion.button
                type="button"
                onClick={() => setOpen(v => !v)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all"
              >
                <UserCircle2 size={20} className="text-[#004AAD]" />
                <span className="hidden sm:block text-sm font-bold text-slate-800">{userName}</span>
                <ChevronDown size={14} className={`text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
              </motion.button>

              {open && (
                <motion.div 
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="absolute top-full right-0 mt-3 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-[100]"
                >
                  <div className="px-4 py-3 border-b border-slate-100 mb-2">
                    <p className="text-sm font-bold text-slate-900">{userName}</p>
                    <p className="text-xs text-slate-500 mt-1 capitalize">{role}</p>
                  </div>

                  <button
                    onClick={() => { navigate(getDashboardByRole(role)); setOpen(false); }}
                    className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-[#004AAD] rounded-xl flex items-center gap-3 transition-colors"
                  >
                    <LayoutDashboard size={16} /> Dashboard
                  </button>

                  <button
                    onClick={() => { navigate('/profile'); setOpen(false); }}
                    className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-3 transition-colors"
                  >
                    <UserCircle2 size={16} /> Profile
                  </button>

                  <div className="h-px bg-slate-100 my-1"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-3 transition-colors"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </motion.div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X size={20} className="text-slate-700"/> : <Menu size={20} className="text-slate-700"/>}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="md:hidden border-t border-slate-200 py-2 bg-white absolute left-0 right-0 top-full shadow-lg"
          >
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => { item.onClick(); setMobileMenuOpen(false); }}
                className={`w-full px-6 py-3 text-sm font-bold transition-colors flex items-center gap-3 ${
                  location.pathname === item.path ? 'bg-blue-50 text-[#004AAD]' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </div>
    </nav>
  );
}