import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Package, Lock, Globe, AlertCircle } from 'lucide-react';
import axios from 'axios';
import InventoryTab from './InventoryTab';
import MarketplaceListingTab from './MarketplaceListingTab';

const InventoryDashboard = () => {
  const [activeTab, setActiveTab] = useState('internal'); // 'internal' | 'marketplace'
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalInventory: 0,
    activeMarketplace: 0,
    internal: 0,
  });

  const kycStatus = localStorage.getItem('kycStatus') || 'Pending';
  const isKycApproved = kycStatus === 'Approved';
  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  // Fetch stats on mount and refresh
  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(
        `${apiUrl}/api/gems/inventory/all`,
        { headers }
      );
      
      const allGems = response.data || [];
      const internalGems = allGems.filter(g => g.listing_status === 'Internal_Inventory');
      const marketplaceGems = allGems.filter(g => g.listing_status === 'Marketplace_Active');
      
      setStats({
        totalInventory: allGems.length,
        activeMarketplace: marketplaceGems.length,
        internal: internalGems.length,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh stats whenever tab changes (gems might have been promoted)
  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  if (loading && activeTab === 'internal') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-semibold">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* KYC Alert */}
      {!isKycApproved && role === 'seller' && (
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-40 mx-6 mt-6 p-5 bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 rounded-2xl flex items-start gap-4 shadow-lg"
        >
          <AlertCircle size={22} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-bold text-amber-900 mb-1">KYC Verification Required</h3>
            <p className="text-sm text-amber-800 mb-2">
              Your account is awaiting KYC approval. You can still register gems in your internal inventory, but cannot publish to marketplace until approved.
            </p>
            <p className="text-xs text-amber-700 font-semibold">
              Status: <span className="font-black text-amber-900">{kycStatus}</span>
            </p>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-6">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
              {role === 'admin' ? '💎 Master Inventory' : '📦 My Inventory & Marketplace'}
            </h1>
            <p className="text-slate-600 font-medium">
              {role === 'admin'
                ? 'View and manage all gems across inventory and marketplace'
                : 'Register gems privately, then promote to marketplace'}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
              className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">Total Gems</p>
                  <p className="text-2xl font-black text-blue-900 mt-1">{stats.totalInventory}</p>
                </div>
                <Package size={32} className="text-blue-300" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-emerald-50 to-green-100 border border-emerald-200 rounded-xl p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide">Marketplace Active</p>
                  <p className="text-2xl font-black text-emerald-900 mt-1">{stats.activeMarketplace}</p>
                </div>
                <Globe size={32} className="text-emerald-300" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Private Inventory</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{stats.internal}</p>
                </div>
                <Lock size={32} className="text-slate-300" />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-t border-slate-200/50 bg-white/40 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 flex gap-1">
            <button
              onClick={() => {
                setActiveTab('internal');
                fetchStats();
              }}
              className={`px-6 py-4 font-bold text-sm border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'internal'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Package size={16} />
              Internal Inventory
              {stats.internal > 0 && (
                <span className="ml-2 px-2 py-1 bg-slate-200 text-slate-700 rounded-full text-xs font-black">
                  {stats.internal}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab('marketplace');
                fetchStats();
              }}
              className={`px-6 py-4 font-bold text-sm border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'marketplace'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe size={16} />
              Marketplace Listing
              {stats.activeMarketplace > 0 && (
                <span className="ml-2 px-2 py-1 bg-emerald-200 text-emerald-700 rounded-full text-xs font-black">
                  {stats.activeMarketplace}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <AnimatePresence mode="wait">
          {/* Internal Inventory Tab */}
          {activeTab === 'internal' && (
            <motion.div
              key="internal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <InventoryTab onRefresh={fetchStats} />
            </motion.div>
          )}

          {/* Marketplace Listing Tab */}
          {activeTab === 'marketplace' && (
            <motion.div
              key="marketplace"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {!isKycApproved && role === 'seller' ? (
                <div className="bg-white rounded-2xl p-16 text-center border-2 border-amber-300 shadow-sm">
                  <AlertCircle size={56} className="mx-auto text-amber-500 mb-4" />
                  <h3 className="text-2xl font-black text-amber-900 mb-2">KYC Verification Required</h3>
                  <p className="text-amber-800 mb-8">
                    Please complete KYC verification before you can publish gems to the marketplace. 
                    In the meantime, you can register gems in your internal inventory.
                  </p>
                </div>
              ) : (
                <MarketplaceListingTab onRefresh={fetchStats} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default InventoryDashboard;
