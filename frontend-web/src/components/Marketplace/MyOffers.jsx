import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getBuyerOffers, acceptCounter, respondToOffer } from '../../services/api';
import { Diamond, ArrowRight, Loader2, AlertCircle, CheckCircle, XCircle, Repeat2 } from 'lucide-react';
import toast from 'react-hot-toast';

const statusConfig = {
  Pending:    { color: 'bg-amber-50 text-amber-700', icon: AlertCircle, label: 'Pending' },
  Accepted:   { color: 'bg-emerald-50 text-emerald-700', icon: CheckCircle, label: 'Accepted' },
  Rejected:   { color: 'bg-red-50 text-red-700', icon: XCircle, label: 'Rejected' },
  Countered:  { color: 'bg-blue-50 text-blue-700', icon: Repeat2, label: 'Countered' },
};

export default function MyOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // offerId

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const data = await getBuyerOffers();
      setOffers(data || []);
    } catch (err) {
      toast.error('Failed to load your offers');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptCounter = async (offerId) => {
    setActionLoading(offerId);
    try {
      await acceptCounter(offerId);
      toast.success('Counter offer accepted!');
      fetchOffers();
    } catch (err) {
      toast.error('Failed to accept counter offer');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectCounter = async (offerId) => {
    setActionLoading(offerId);
    try {
      await respondToOffer(offerId, { status: 'Rejected' });
      toast.success('Counter offer rejected.');
      fetchOffers();
    } catch (err) {
      toast.error('Failed to reject counter offer');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-blue-100 selection:text-blue-900 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm p-8 border border-slate-200">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">My Offers</h1>
        <p className="text-slate-600 font-medium mb-8">Track your submitted offers and their status.</p>
        {loading ? (
          <div className="flex items-center justify-center min-h-64"><Loader2 className="animate-spin text-blue-500" size={32} /></div>
        ) : offers.length === 0 ? (
          <div className="text-center py-16">
            <Diamond size={48} className="mx-auto text-slate-200 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">No offers yet</h3>
            <p className="text-slate-600">You haven't submitted any offers. Make an offer on a gem to see it here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Gem</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Offered Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Counter Amount</th>
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
                      <td className="px-4 py-4 font-bold text-emerald-700">
                        {offer.status === 'Countered' && offer.counter_amount ? (
                          <>LKR {offer.counter_amount?.toLocaleString()}</>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {offer.status === 'Countered' && offer.counter_amount && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAcceptCounter(offer._id)}
                              disabled={actionLoading === offer._id}
                              className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition-all disabled:opacity-60"
                            >
                              {actionLoading === offer._id ? <Loader2 size={16} className="animate-spin" /> : 'Accept Counter'}
                            </button>
                            <button
                              onClick={() => handleRejectCounter(offer._id)}
                              disabled={actionLoading === offer._id}
                              className="px-4 py-2 rounded-lg bg-red-100 text-red-700 font-bold text-xs hover:bg-red-200 transition-all disabled:opacity-60"
                            >
                              {actionLoading === offer._id ? <Loader2 size={16} className="animate-spin" /> : 'Reject Counter'}
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
    </div>
  );
}
