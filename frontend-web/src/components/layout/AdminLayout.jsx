import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, Settings, User, ChevronDown, Calendar, Home, Package, Globe, ListChecks, Search, BookOpen, MessageSquare, DollarSign, Gavel, Megaphone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import InventoryTab from '../Inventory/InventoryTab.jsx';
import MarketplaceListingTab from '../Inventory/MarketplaceListingTab.jsx';
import ActiveListingsTab from '../Inventory/ActiveListingsTab.jsx';
import AppointmentsList from '../Visitor/AppointmentsList.jsx';
import LearningManagementTab from '../Inventory/LearningManagementTab.jsx';
import AdManagementTab from '../Inventory/AdManagementTab.jsx';
import MessagesPage from '../../pages/MessagesPage.jsx';
import BiddingManagementTab from '../Inventory/BiddingManagementTab.jsx';
import AuctionManagementTab from '../Inventory/AuctionManagementTab.jsx';
import AdminFeedbackView from '../AdminFeedbackView.jsx';
import AdminInquiryTab from '../Inquiry/AdminInquiryTab.jsx';

const ADMIN_TABS = [
  { id: 'inventory', label: 'Internal Inventory', icon: Package },
  { id: 'marketplace', label: 'Marketplace Listings', icon: Globe },
  { id: 'active-listings', label: 'Active Listings', icon: ListChecks },
  { id: 'appointments', label: 'Appointments', icon: Calendar },
  { id: 'auctions', label: 'Auctions', icon: Gavel },
  { id: 'bidding', label: 'Bidding & Offers', icon: DollarSign },
  { id: 'ads', label: 'Manage Advertisements', icon: Megaphone },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'learning', label: 'Learning Hub', icon: BookOpen },
  { id: 'feedback', label: 'System Feedback', icon: MessageSquare },
  { id: 'inquiries', label: 'Support Tickets', icon: MessageSquare },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'inventory';

  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'inventory':
        return <InventoryTab />;
      case 'marketplace':
        return <MarketplaceListingTab mode="wizard" />;
      case 'active-listings':
        return <ActiveListingsTab />;
      case 'appointments':
        return <AppointmentsList role="admin" />;
      case 'auctions':
        return <AuctionManagementTab />;
      case 'bidding':
        return <BiddingManagementTab />;
      case 'ads':
        return <AdManagementTab />;
      case 'messages':
        return <MessagesPage />;
      case 'learning':
        return <LearningManagementTab />;
      case 'feedback':
        return <AdminFeedbackView />;
        case 'inquiries':
  return <AdminInquiryTab />;
      case 'settings':
        return (
          <div className="bg-white border border-blue-100 rounded-2xl p-6">
            <h2 className="text-2xl font-black text-slate-900">Settings</h2>
            <p className="text-sm text-slate-500 mt-1">Account and dashboard settings.</p>
          </div>
        );
      default:
        return <InventoryTab />;
    }
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
              <button
                onClick={() => navigate('/home')}
                className="w-full mb-4 flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-bold hover:bg-blue-100 transition-all"
              >
                <Home size={16} />
                Go to Home
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#004AAD] to-[#00B4D8] flex items-center justify-center">
                  <span className="text-white font-bold text-lg">PG</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Pinnawala</h2>
                  <p className="text-xs text-slate-500">Admin Portal</p>
                </div>
              </div>
            </div>

            {/* Sidebar Links */}
            <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
              {ADMIN_TABS.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-[#004AAD] to-[#00B4D8] text-white shadow-md shadow-blue-500/20'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon size={18} strokeWidth={2.5} />
                    {item.label}
                    {isActive && <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>}
                  </motion.button>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-100">
              <p className="text-[11px] text-slate-400 font-semibold">Pinnawala Admin Console</p>
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
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-all"
            >
              {sidebarOpen ? <X size={24} className="text-slate-600" /> : <Menu size={24} className="text-slate-600" />}
            </button>
            <div className="hidden md:block min-w-[180px]">
              <h1 className="text-lg font-black text-slate-900">Pinnawala Admin</h1>
            </div>
            <div className="relative w-[320px] max-w-[40vw]">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search dashboard..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-300"
              />
            </div>
          </div>

          {/* Top Right Profile/Logout */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 rounded-lg transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#004AAD] to-[#00B4D8] flex items-center justify-center">
                  <User size={16} className="text-white" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-bold text-slate-900">{user?.name || 'Administrator'}</p>
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
                      <p className="text-sm font-bold text-slate-900">{user?.name || 'Administrator'}</p>
                      <p className="text-xs text-slate-500 mt-1">{user?.email || 'admin@pinnawala.com'}</p>
                    </div>
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
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {renderTabContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}