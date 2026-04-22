import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, Settings, Bell, User, ChevronDown, Home, BarChart3, Users, Package, FileText, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const SIDEBAR_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/admin/dashboard' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
  { id: 'users', label: 'Users', icon: Users, path: '/admin/users' },
  { id: 'products', label: 'Products', icon: Package, path: '/admin/products' },
  { id: 'reports', label: 'Reports', icon: FileText, path: '/admin/reports' },
  { id: 'system', label: 'System', icon: Zap, path: '/admin/system' }
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/admin/login');
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
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={sidebarVariants}
            className="w-72 bg-white border-r border-slate-200 shadow-sm flex flex-col relative z-40"
          >
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#004AAD] to-[#00B4D8] flex items-center justify-center">
                  <span className="text-white font-bold text-lg">PG</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Pinnawala</h2>
                  <p className="text-xs text-slate-500">Gems Admin</p>
                </div>
              </div>
            </div>

            <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
              {SIDEBAR_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <motion.button
                    key={item.id}
                    whileHover={{ x: 4 }}
                    onClick={() => navigate(item.path)}
                    className={`w-full px-4 py-3 rounded-lg font-medium transition-all flex items-center gap-3 ${
                      isActive
                        ? 'bg-gradient-to-r from-[#004AAD]/10 to-[#00B4D8]/10 text-[#004AAD] border-l-2 border-[#004AAD]'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                    {isActive && <div className="ml-auto w-2 h-2 bg-[#004AAD] rounded-full"></div>}
                  </motion.button>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-100">
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => navigate('/admin/settings')}
                className="w-full px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50 font-medium flex items-center gap-3 transition-all"
              >
                <Settings size={20} />
                <span>Settings</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm md:hidden z-30"
          />
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
            <div className="hidden md:block">
              <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
              <p className="text-xs text-slate-500">Welcome back</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors relative"
            >
              <Bell size={20} className="text-slate-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </motion.button>

            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-50 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#004AAD] to-[#00B4D8] flex items-center justify-center">
                  <User size={18} className="text-white" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-slate-900">{user?.name || 'Admin'}</p>
                  <p className="text-xs text-slate-500">{user?.email || 'admin@pinnawala.com'}</p>
                </div>
                <ChevronDown size={16} className={`text-slate-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </motion.button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden z-50"
                  >
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-900">{user?.name || 'Administrator'}</p>
                      <p className="text-xs text-slate-500 mt-1">{user?.email || 'admin@pinnawala.com'}</p>
                    </div>
                    <motion.button
                      whileHover={{ backgroundColor: '#f1f5f9' }}
                      onClick={() => navigate('/admin/profile')}
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-700 font-medium flex items-center gap-2 transition-colors"
                    >
                      <User size={16} />
                      Profile
                    </motion.button>
                    <motion.button
                      whileHover={{ backgroundColor: '#f1f5f9' }}
                      onClick={() => navigate('/admin/settings')}
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-700 font-medium flex items-center gap-2 transition-colors border-b border-slate-100"
                    >
                      <Settings size={16} />
                      Settings
                    </motion.button>
                    <motion.button
                      whileHover={{ backgroundColor: '#fef2f2' }}
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 font-medium flex items-center gap-2 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={16} />
                      Logout
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-[#F8FAFC]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
