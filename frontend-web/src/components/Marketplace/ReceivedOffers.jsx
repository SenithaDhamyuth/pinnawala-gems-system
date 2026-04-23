import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSellerOffers, respondToOffer } from '../../services/api';
import { Diamond, Loader2, User, AlertCircle, CheckCircle, XCircle, Repeat2, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';

const statusConfig = {
  Pending:    { color: 'bg-amber-50 text-amber-700', icon: AlertCircle, label: 'Pending' },
  Accepted:   { color: 'bg-emerald-50 text-emerald-700', icon: CheckCircle, label: 'Accepted' },
  Rejected:   { color: 'bg-red-50 text-red-700', icon: XCircle, label: 'Rejected' },
  Countered:  { color: 'bg-blue-50 text-blue-700', icon: Repeat2, label: 'Countered' },
};

export default function ReceivedOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // offerId
  const [counterModal, setCounterModal] = useState({ open: false, offer: null, amount: '' });

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const data = await getSellerOffers();
      setOffers(data || []);
    } catch (err) {
      toast.error('Failed to load received offers');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (offerId) => {
    setActionLoading(offerId);
    try {
      await respondToOffer(offerId, { status: 'Accepted' });
      toast.success('Offer accepted!');
      fetchOffers();
    } catch (err) {
      toast.error('Failed to accept offer');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (offerId) => {
    setActionLoading(offerId);
    try {
      await respondToOffer(offerId, { status: 'Rejected' });
      toast.success('Offer rejected.');
      fetchOffers();
    } catch (err) {
      toast.error('Failed to reject offer');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCounter = (offer) => {
    setCounterModal({ open: true, offer, amount: '' });
  };

  const submitCounter = async () => {
    const { offer, amount } = counterModal;
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      toast.error('Enter a valid counter amount');
      return;
    }
    setActionLoading(offer._id);
    try {
      await respondToOffer(offer._id, { status: 'Countered', counter_amount: Number(amount) });
      toast.success('Counter offer sent!');
      setCounterModal({ open: false, offer: null, amount: '' });
      fetchOffers();
    } catch (err) {
      toast.error('Failed to send counter offer');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-blue-100 selection:text-blue-900 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm p-8 border border-slate-200">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Received Offers</h1>
        <p className="text-slate-600 font-medium mb-8">Manage incoming offers for your gems.</p>
        {loading ? (
          <div className="flex items-center justify-center min-h-64"><Loader2 className="animate-spin text-blue-500" size={32} /></div>
        ) : offers.length === 0 ? (
          <div className="text-center py-16">
            <Diamond size={48} className="mx-auto text-slate-200 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">No offers received</h3>
            <p className="text-slate-600">You haven't received any offers yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Buyer</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Gem</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Offered Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {offers.map((offer) => {
                  const status = offer.status;
                  const config = statusConfig[status] || statusConfig['Pending'];
                  return (
                    <tr key={offer._id} className="hover:bg-blue-50/20 transition-all">
                      <td className="px-4 py-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User size={18} className="text-blue-600" />
                        </div>
                        <span className="font-bold text-slate-900">{offer.buyer_name || 'N/A'}</span>
                      </td>
                      <td className="px-4 py-4 flex items-center gap-3">
                        {offer.gem_image_url ? (
                          <img src={offer.gem_image_url} alt={offer.gem_name} className="w-12 h-12 rounded-lg object-cover border border-slate-100" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                            <Diamond size={20} className="text-slate-300" />
                          </div>
                        )}
                        <span className="font-bold text-slate-900">{offer.gem_name}</span>
                      </td>
                      <td className="px-4 py-4 font-bold text-blue-700">LKR {offer.offer_amount?.toLocaleString()}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs ${config.color}`}>
                          <config.icon size={14} /> {config.label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {status === 'Pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAccept(offer._id)}
                              disabled={actionLoading === offer._id}
                              className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition-all disabled:opacity-60"
                            >
                              {actionLoading === offer._id ? <Loader2 size={16} className="animate-spin" /> : 'Accept'}
                            </button>
                            <button
                              onClick={() => handleReject(offer._id)}
                              disabled={actionLoading === offer._id}
                              className="px-4 py-2 rounded-lg bg-red-100 text-red-700 font-bold text-xs hover:bg-red-200 transition-all disabled:opacity-60"
                            >
                              {actionLoading === offer._id ? <Loader2 size={16} className="animate-spin" /> : 'Reject'}
                            </button>
                            <button
                              onClick={() => handleCounter(offer)}
                              disabled={actionLoading === offer._id}
                              className="px-4 py-2 rounded-lg bg-blue-100 text-blue-700 font-bold text-xs hover:bg-blue-200 transition-all disabled:opacity-60"
                            >
                              <Edit2 size={14} /> Counter Offer
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Counter Offer Modal */}
      <AnimatePresence>
        {counterModal.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center"
            onClick={() => setCounterModal({ open: false, offer: null, amount: '' })}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 border border-slate-200"
            >
              <h2 className="text-xl font-black text-slate-900 mb-4">Counter Offer</h2>
              <div className="mb-4">
                <label className="block text-sm font-bold text-slate-700 mb-2">Counter Amount (LKR)</label>
                <input
                  type="number"
                  min="1"
                  value={counterModal.amount}
                  onChange={e => setCounterModal({ ...counterModal, amount: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="Enter counter amount"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setCounterModal({ open: false, offer: null, amount: '' })}
                  className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 rounded-lg font-bold hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={submitCounter}
                  disabled={actionLoading === (counterModal.offer && counterModal.offer._id)}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading === (counterModal.offer && counterModal.offer._id) ? <Loader2 size={16} className="animate-spin" /> : 'Send Counter'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
