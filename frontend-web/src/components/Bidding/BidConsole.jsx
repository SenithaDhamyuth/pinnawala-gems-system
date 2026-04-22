import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Activity, User, AlertCircle, ArrowUpRight } from 'lucide-react';
import axios from 'axios';

const RESOLVED_API_ROOT = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function BidConsole({ auction, onClose, onUpdate, role }) {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newBid, setNewBid] = useState('');

  const fetchBids = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const res = await axios.get(`${RESOLVED_API_ROOT}/api/bids/${auction.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBids(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBids();
    // Simulate web sockets or polling for active auctions
    const interval = setInterval(fetchBids, 5000);
    return () => clearInterval(interval);
  }, [auction.id]);

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    if (!newBid) return;
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      await axios.post(`${RESOLVED_API_ROOT}/api/bids`, {
        auctionId: auction.id,
        amount: Number(newBid),
        bidderName: "Current User" 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewBid('');
      fetchBids();
      onUpdate();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to place bid. Ensure amount is higher than current bid + LKR 5000.");
    }
  };

  const isActive = auction.status === 'active';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-4xl h-[80vh] flex bg-[#F8FAFC] rounded-[2rem] shadow-2xl relative overflow-hidden"
      >
        {/* Left Side: Summary */}
        <div className="w-1/3 bg-slate-900 text-white p-8 border-r border-slate-800 flex flex-col">
          <button onClick={onClose} className="p-2 ml-auto mb-6 hover:bg-slate-800 rounded-full transition-colors"><X size={20} className="text-slate-400" /></button>
          
          <h2 className="text-2xl font-black mb-2 leading-tight">{auction.title}</h2>
          <span className={`w-fit px-3 py-1 text-[10px] uppercase font-black tracking-widest rounded-md mb-8 ${isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
            {auction.status}
          </span>

          <div className="space-y-6 flex-1">
            <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Starting Bid</p>
              <p className="font-bold">LKR {auction.startingBid.toLocaleString()}</p>
            </div>
            <div className="bg-blue-600/10 rounded-2xl p-5 border border-blue-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Activity size={40} />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-1">Current Highest</p>
              <p className="font-black text-2xl text-white">LKR {auction.currentBid.toLocaleString()}</p>
            </div>
            
            <div className="pt-4 border-t border-slate-800">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Closes On</p>
              <p className="font-medium text-sm text-slate-300">{new Date(auction.endDate).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Right Side: Bid Feed */}
        <div className="flex-1 flex flex-col relative">
          <div className="p-6 border-b border-slate-200 bg-white z-10 flex items-center justify-between">
            <h3 className="font-black text-slate-900">Live Bid Feed</h3>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 tracking-widest uppercase">
              <Activity size={14} className={isActive ? "text-emerald-500 animate-pulse" : "text-slate-300"} />
              {bids.length} Active Bids
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 custom-scrollbar">
            {loading ? (
              <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div></div>
            ) : bids.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <AlertCircle size={32} className="mb-4 opacity-50" />
                <p className="font-medium">No bids have been placed yet.</p>
              </div>
            ) : (
              bids.map((bid, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  key={bid.id} 
                  className={`p-4 rounded-2xl border ${i === 0 ? 'bg-white shadow-sm border-blue-200 ring-1 ring-blue-600/10' : 'bg-white/60 border-slate-200 opacity-70'} flex items-center justify-between`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${i === 0 ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                      <User size={16} strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className={`font-bold text-sm ${i === 0 ? 'text-slate-900' : 'text-slate-700'}`}>{bid.bidderName || 'Anonymous Bidder'}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(bid.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-black tracking-tight ${i === 0 ? 'text-blue-600 text-lg' : 'text-slate-900'}`}>
                      LKR {bid.amount.toLocaleString()}
                    </p>
                    {bid.tie_flag && <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded uppercase tracking-wider">Tie Found</span>}
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Bid Input */}
          {role === 'buyer' && isActive && (
            <div className="p-6 bg-white border-t border-slate-200">
              <form onSubmit={handlePlaceBid} className="flex items-center gap-4">
                <input 
                  type="number" 
                  required
                  value={newBid}
                  onChange={e => setNewBid(e.target.value)}
                  placeholder={`Minimum LKR ${(auction.currentBid + 5000).toLocaleString()}...`}
                  className="flex-1 px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all placeholder:text-slate-400"
                />
                <button type="submit" className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 active:scale-95 shadow-md shadow-blue-600/20">
                  Place Bid <ArrowUpRight size={18} strokeWidth={3} />
                </button>
              </form>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
