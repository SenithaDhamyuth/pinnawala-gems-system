import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gavel, Clock, RefreshCcw, Plus, Activity, Timer } from 'lucide-react';
import axios from 'axios';
import AddAuctionForm from './AddAuctionForm';
import BidConsole from './BidConsole';
import { getImageUrl } from '../../utils/imageUtil';

const RESOLVED_API_ROOT = import.meta.env.VITE_API_URL || 'http://localhost:5001';

function useNowTick(ms = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}

function CountdownLabel({ auction }) {
  const now = useNowTick(1000);
  const status = auction.status;

  const target =
    status === 'upcoming'
      ? new Date(auction.startDate).getTime()
      : status === 'active'
        ? new Date(auction.endDate).getTime()
        : null;

  if (target === null) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
        <Clock size={12} /> Ended
      </span>
    );
  }

  const diff = Math.max(0, target - now);
  const hrs = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);

  const prefix = status === 'upcoming' ? 'Starts in' : 'Ends in';

  return (
    <span className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-slate-700 bg-white/90 px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
      <Timer size={12} className="text-blue-600" />
      {prefix}{' '}
      <span className="tabular-nums text-blue-700">
        {String(hrs).padStart(2, '0')}:{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </span>
    </span>
  );
}

export default function AuctionsList({ role }) {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeAuction, setActiveAuction] = useState(null);

  const fetchAuctions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const res = await axios.get(`${RESOLVED_API_ROOT}/api/auctions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAuctions(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, []);

  const visibleAuctions = useMemo(() => {
    if (role !== 'buyer') return auctions;
    return auctions.filter((a) => a.status === 'active' || a.status === 'upcoming');
  }, [auctions, role]);

  const handleDelete = async (id) => {
    if (!window.confirm('Cancel this auction?')) return;
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      await axios.delete(`${RESOLVED_API_ROOT}/api/auctions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAuctions();
    } catch (err) {
      alert('Cannot delete active or completed auctions.');
    }
  };

  const isBuyer = role === 'buyer';
  const canManage = role === 'seller' || role === 'admin';

  return (
    <div className="p-8 max-w-[1536px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {isBuyer ? 'Live Auctions' : 'Acquisition Hub'}
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            {isBuyer
              ? 'Browse active and upcoming gem auctions with live countdowns.'
              : 'Real-time auction monitoring and management.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            type="button"
            onClick={fetchAuctions}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="p-3 bg-white border border-slate-200 text-slate-600 rounded-full hover:bg-slate-50 transition-all shadow-sm"
          >
            <RefreshCcw size={20} strokeWidth={2.5} className={loading ? 'animate-spin text-blue-600' : ''} />
          </motion.button>
          {canManage && (
            <motion.button
              type="button"
              onClick={() => setShowAddForm(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition-all shadow-md flex items-center gap-2"
            >
              <Plus size={18} strokeWidth={3} /> Host Auction
            </motion.button>
          )}
        </div>
      </div>

      {loading && auctions.length === 0 ? (
        <div className="flex justify-center py-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
        </div>
      ) : visibleAuctions.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 py-32 flex flex-col items-center shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6">
            <Gavel size={32} className="text-slate-300" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">
            {isBuyer ? 'No auctions open right now' : 'No Active Auctions'}
          </h3>
          <p className="text-slate-500 font-medium text-center max-w-md px-4">
            {isBuyer
              ? 'When new auctions go live they will appear here with a countdown.'
              : 'There are currently no gems on the auction block.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {visibleAuctions.map((auction, index) => (
            <motion.div
              key={auction.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col"
            >
              <div className="h-48 bg-slate-100 relative p-2">
                {auction.media && auction.media[0] ? (
                  <img
                    src={getImageUrl(auction.media[0].url)}
                    alt={auction.title}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center rounded-2xl bg-slate-50">
                    <Gavel size={24} className="text-slate-300" />
                  </div>
                )}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <span
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-md ${
                      auction.status === 'active'
                        ? 'bg-emerald-500 text-white'
                        : auction.status === 'upcoming'
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-800 text-white'
                    }`}
                  >
                    {auction.status}
                  </span>
                  <CountdownLabel auction={auction} />
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="font-black text-xl text-slate-900 tracking-tight leading-tight mb-2">{auction.title}</h3>
                {auction.description && (
                  <p className="text-sm text-slate-600 line-clamp-2 mb-4">{auction.description}</p>
                )}
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                  <Clock size={12} /> Auction ends {new Date(auction.endDate).toLocaleString()}
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6 mt-auto">
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Starting Bid</p>
                    <p className="font-bold text-slate-900">LKR {(auction.startingBid ?? 0).toLocaleString()}</p>
                  </div>
                  <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-100 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500 mb-1">Current High</p>
                    <p className="font-black text-blue-700">
                      LKR {(auction.currentBid ?? auction.startingBid ?? 0).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    type="button"
                    onClick={() => setActiveAuction(auction)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors flex justify-center items-center gap-2 text-sm shadow-md"
                  >
                    <Activity size={16} /> {isBuyer ? 'View & Bid' : 'Track Bids'}
                  </motion.button>
                  {canManage && (
                    <motion.button
                      type="button"
                      onClick={() => handleDelete(auction.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-4 py-3 bg-white border border-slate-200 text-red-500 rounded-xl hover:bg-red-50 transition-colors font-bold text-sm"
                    >
                      Cancel
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showAddForm && <AddAuctionForm onClose={() => setShowAddForm(false)} onAdded={fetchAuctions} />}
        {activeAuction && (
          <BidConsole auction={activeAuction} onClose={() => setActiveAuction(null)} onUpdate={fetchAuctions} role={role} />
        )}
      </AnimatePresence>
    </div>
  );
}
