import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, Settings, Bell, User, ChevronDown, Calendar, Gavel, MessageSquare, Store } from 'lucide-react';
import toast from 'react-hot-toast';

const DashboardLayout = ({ children, role }) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const userName = localStorage.getItem('name') || 'User';
  const userEmail = localStorage.getItem('userEmail') || 'user@example.com';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userRole');
    localStorage.removeItem('name');
    localStorage.removeItem('kycStatus');
    localStorage.removeItem('userId');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const sidebarVariants = {
    open: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.3, ease: 'easeOut' }
    },
    closed: {
      x: -280,
      opacity: 0,
      transition: { duration: 0.3, ease: 'easeOut' }
    }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      {/* SIDEBAR */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={sidebarVariants}
            className="w-72 bg-white border-r border-slate-200 shadow-sm flex flex-col relative z-40"
          >
            {/* Sidebar Header */}
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#004AAD] to-[#00B4D8] flex items-center justify-center">
                  <span className="text-white font-bold text-lg">PG</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Pinnawala</h2>
                  <p className="text-xs text-slate-500">{role === 'seller' ? 'Seller Portal' : 'Dashboard'}</p>
                </div>
              </div>
            </div>

            {/* Sidebar Links */}
            <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
              {role === 'seller' && (
                <>
                  <motion.button
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/dashboard/inventory')}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm transition-all text-slate-600 hover:bg-slate-50"
                  >
                    <span>📦</span>
                    My Listings
                  </motion.button>
                  <motion.button
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/dashboard/received-offers')}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm transition-all text-blue-700 hover:bg-blue-50"
                  >
                    <span>💬</span>
                    Received Offers
                  </motion.button>
                  <motion.button
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/dashboard/auctions')}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm transition-all text-slate-600 hover:bg-slate-50"
                  >
                    <span>🔨</span>
                    Auctions
                  </motion.button>
                  <motion.button
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/dashboard/shop-settings')}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm transition-all text-amber-700 hover:bg-amber-50"
                  >
                    <Store size={17} className="text-amber-500" />
                    Shop Settings
                  </motion.button>
                </>
              )}
              {role === 'buyer' && (
                <>
                  <motion.button
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/dashboard/my-offers')}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm transition-all text-blue-700 hover:bg-blue-50"
                  >
                    <span>💼</span>
                    My Offers
                  </motion.button>
                  <motion.button
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/dashboard/auctions')}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm transition-all text-slate-600 hover:bg-slate-50"
                  >
                    <Gavel size={18} className="text-amber-600" strokeWidth={2.5} />
                    View Auctions
                  </motion.button>
                  <motion.button
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/dashboard/appointments')}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm transition-all text-slate-600 hover:bg-slate-50"
                  >
                    <Calendar size={18} className="text-blue-600" strokeWidth={2.5} />
                    Book Appointment
                  </motion.button>
                  <motion.button
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/dashboard/inquiries')}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm transition-all text-slate-600 hover:bg-slate-50"
                  >
                    <MessageSquare size={18} className="text-purple-600" strokeWidth={2.5} />
                    Help & Support
                  </motion.button>
                </>
              )}
            </nav>

            {/* Sidebar Footer (Settings & Logout) */}
            <div className="p-4 border-t border-slate-100 space-y-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => navigate('/profile')}
                className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg font-bold text-sm transition-all"
              >
                <Settings size={18} strokeWidth={2.5} />
                Settings
              </motion.button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg font-bold text-sm transition-all"
              >
                <LogOut size={18} strokeWidth={2.5} />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MOBILE OVERLAY */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={overlayVariants}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm md:hidden z-30"
          />
        )}
      </AnimatePresence>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 shadow-sm px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-all"
            >
              {sidebarOpen ? <X size={24} className="text-slate-600" /> : <Menu size={24} className="text-slate-600" />}
            </button>
            <div className="hidden md:block">
              <h1 className="text-xl font-black text-slate-900">Dashboard</h1>
            </div>
          </div>

          {/* Top Right Profile & Notifications */}
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-slate-100 rounded-full transition-all relative">
              <Bell size={20} className="text-slate-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 rounded-lg transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#004AAD] to-[#00B4D8] flex items-center justify-center">
                  <User size={16} className="text-white" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-bold text-slate-900">{userName}</p>
                </div>
                <ChevronDown size={16} className={`text-slate-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden z-50"
                  >
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-bold text-slate-900">{userName}</p>
                      <p className="text-xs text-slate-500 mt-1">{userEmail}</p>
                    </div>
                    <button
                      onClick={() => navigate('/profile')}
                      className="w-full text-left px-4 py-3 text-sm text-slate-700 font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors"
                    >
                      <User size={16} /> Profile
                    </button>
                    <button
                      onClick={() => navigate('/settings')}
                      className="w-full text-left px-4 py-3 text-sm text-slate-700 font-bold flex items-center gap-2 border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <Settings size={16} /> Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-sm text-red-600 font-bold flex items-center gap-2 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Dynamic Content Loading Area */}
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
