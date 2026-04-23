import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Gavel, Clock, Plus, Trash2, AlertCircle, Package, Loader, Edit2, X, Check,
  Activity, RefreshCcw, Eye, TrendingUp, Users, DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import io from 'socket.io-client';
import AddAuctionForm from '../Bidding/AddAuctionForm';
import BidConsole from '../Bidding/BidConsole';

const AuctionManagementTab = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeAuction, setActiveAuction] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [socket, setSocket] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const socketRef = useRef(null);

  const token = localStorage.getItem('token');
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
  const role = localStorage.getItem('role');

  const STATUSES = ['All', 'upcoming', 'active', 'completed'];

  // Initialize Socket.io connection for real-time updates
  useEffect(() => {
    const newSocket = io(apiUrl, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('[Socket] Connected to auction server');
    });

    // Listen for real-time bid updates
    newSocket.on('bid_placed', (data) => {
      setAuctions((prev) =>
        prev.map((auction) =>
          auction.id === data.auctionId
            ? { ...auction, currentBid: data.newBid }
            : auction
        )
      );
    });

    newSocket.on('auction_ended', (data) => {
      setAuctions((prev) =>
        prev.map((auction) =>
          auction.id === data.auctionId
            ? { ...auction, status: 'completed' }
            : auction
        )
      );
    });

    return () => {
      newSocket.disconnect();
    };
  }, [token, apiUrl]);

  useEffect(() => {
    fetchAuctions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(`${apiUrl}/api/auctions`, { headers });
      setAuctions(response.data);
    } catch (error) {
      console.error('Failed to fetch auctions:', error);
      toast.error('Failed to load auctions');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to cancel this auction?')) return;

    try {
      setDeleting(id);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      await axios.delete(`${apiUrl}/api/auctions/${id}`, { headers });
      setAuctions(auctions.filter((a) => a.id !== id));
      toast.success('✓ Auction cancelled!');
    } catch (error) {
      console.error('Failed to delete auction:', error);
      toast.error(error.response?.data?.detail || 'Cannot delete active or completed auctions');
    } finally {
      setDeleting(null);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      upcoming: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Clock },
      active: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: Activity },
      completed: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', icon: Check },
    };

    const style = config[status] || config.upcoming;
    const Icon = style.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${style.bg} ${style.text} ${style.border}`}>
        <Icon size={14} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredAuctions = auctions.filter((auction) => {
    const matchesSearch =
      auction.title?.toLowerCase().includes(search.toLowerCase()) ||
      auction.description?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = filterStatus === 'All' || auction.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: auctions.length,
    active: auctions.filter((a) => a.status === 'active').length,
    upcoming: auctions.filter((a) => a.status === 'upcoming').length,
    completed: auctions.filter((a) => a.status === 'completed').length,
    totalValue: auctions.reduce((sum, a) => sum + (a.currentBid || a.startingBid), 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading auctions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-blue-100 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Gavel className="text-blue-600" size={28} />
              Auction Management
            </h2>
            <p className="text-sm text-slate-500 mt-1">Host live auctions and monitor real-time bids.</p>
          </div>
          <motion.button
            onClick={() => setShowAddForm(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            <Plus size={20} strokeWidth={3} />
            Host Auction
          </motion.button>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
          <div className="flex-1 relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by auction title or description..."
              className="w-full pl-4 pr-4 py-3 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {STATUSES.map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <button
            onClick={fetchAuctions}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-bold text-sm transition-colors"
          >
            <RefreshCcw size={18} className="inline-block" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {auctions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { label: 'Total Auctions', value: stats.total, icon: Gavel, color: 'blue' },
            { label: 'Active Now', value: stats.active, icon: Activity, color: 'emerald' },
            { label: 'Upcoming', value: stats.upcoming, icon: Clock, color: 'amber' },
            { label: 'Completed', value: stats.completed, icon: Check, color: 'slate' },
            { label: 'Total Value', value: `LKR ${(stats.totalValue / 1000000).toFixed(1)}M`, icon: TrendingUp, color: 'blue' },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              whileHover={{ scale: 1.02 }}
              className={`bg-${stat.color}-50 border border-${stat.color}-200 rounded-xl p-4`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-[10px] font-black text-${stat.color}-600 uppercase tracking-widest mb-1`}>
                    {stat.label}
                  </p>
                  <p className={`text-2xl font-black text-${stat.color}-700`}>{stat.value}</p>
                </div>
                <stat.icon className={`text-${stat.color}-600 opacity-50`} size={24} />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Auctions Grid */}
      <div className="bg-white border border-blue-100 rounded-2xl overflow-hidden">
        {filteredAuctions.length === 0 ? (
          <div className="p-12 text-center">
            <Gavel size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium mb-6">
              {auctions.length === 0 ? 'No auctions yet. Create your first auction!' : 'No auctions match your filters.'}
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              Host Auction
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {filteredAuctions.map((auction) => (
              <motion.div
                key={auction.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow group flex flex-col"
              >
                {/* Image */}
                <div className="h-40 bg-slate-100 relative overflow-hidden">
                  {auction.media && auction.media[0] ? (
                    <img
                      src={auction.media[0].url}
                      alt={auction.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Gavel size={32} className="text-slate-300" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    {getStatusBadge(auction.status)}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-slate-900 text-sm line-clamp-2 mb-2">{auction.title}</h3>
                  
                  <div className="text-xs text-slate-500 mb-4 line-clamp-2">{auction.description}</div>

                  {/* Bid Info */}
                  <div className="grid grid-cols-2 gap-3 mb-4 mt-auto">
                    <div className="bg-slate-50 rounded-lg p-2 text-center border border-slate-200">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Starting</p>
                      <p className="font-bold text-slate-900 text-sm">LKR {auction.startingBid?.toLocaleString() || '—'}</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-2 text-center border border-blue-200">
                      <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-0.5">Current</p>
                      <p className="font-black text-blue-700 text-sm">LKR {auction.currentBid?.toLocaleString() || '—'}</p>
                    </div>
                  </div>

                  {/* End Time */}
                  <div className="text-[10px] text-slate-500 font-medium mb-4 flex items-center gap-1">
                    <Clock size={12} />
                    Ends: {new Date(auction.endDate).toLocaleString()}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <motion.button
                      onClick={() => setActiveAuction(auction)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 py-2 bg-slate-900 text-white rounded-lg font-bold text-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                    >
                      <Activity size={14} /> Monitor
                    </motion.button>
                    {auction.status === 'upcoming' && (
                      <motion.button
                        onClick={() => handleDelete(auction.id)}
                        disabled={deleting === auction.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 transition-colors border border-red-200 rounded-lg font-bold text-sm disabled:opacity-50"
                        title="Cancel"
                      >
                        {deleting === auction.id ? (
                          <Loader size={14} className="animate-spin" />
                        ) : (
                          <X size={14} />
                        )}
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showAddForm && <AddAuctionForm onClose={() => setShowAddForm(false)} onAdded={fetchAuctions} />}
        {activeAuction && (
          <BidConsole
            auction={activeAuction}
            onClose={() => setActiveAuction(null)}
            onUpdate={fetchAuctions}
            role={role}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AuctionManagementTab;
