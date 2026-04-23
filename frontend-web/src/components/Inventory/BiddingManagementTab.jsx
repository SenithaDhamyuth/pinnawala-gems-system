import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Trash2,
  AlertCircle,
  Package,
  Loader,
  X,
  Check,
  Search,
  DollarSign,
  Clock,
  CreditCard,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const RESOLVED_API_ROOT = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token') || localStorage.getItem('authToken') || ''}`,
});

const BiddingManagementTab = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [responding, setResponding] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
const [paymentModal, setPaymentModal] = useState({
  isOpen: false,
  offerId: null,
  offerAmount: 0,
  gemName: '',
});
const [paymentProcessing, setPaymentProcessing] = useState(false);
const [cardData, setCardData] = useState({ number: '', expiry: '', cvc: '' });
const [counterModal, setCounterModal] = useState({
  isOpen: false,
  offerId: null,
  gemName: '',
});
const [counterProcessing, setCounterProcessing] = useState(false);
const [counterPrice, setCounterPrice] = useState('');
const [userRole, setUserRole] = useState(() => localStorage.getItem('role'));

  const STATUSES = ['All', 'Pending', 'Accepted', 'Rejected', 'Countered', 'Paid'];

  const fetchOffers = useCallback(async () => {
    const storedRole = localStorage.getItem('role');
    setUserRole(storedRole);

    try {
      setLoading(true);
      let endpoint = '/api/offers/seller';
      if (storedRole === 'buyer') {
        endpoint = '/api/offers/buyer';
      }
      const response = await axios.get(`${RESOLVED_API_ROOT}${endpoint}`, { headers: authHeaders() });
      const data = Array.isArray(response.data) ? response.data : [];
      setOffers(data);
    } catch (error) {
      console.error('Failed to fetch offers:', error);
      toast.error(error.response?.data?.message || 'Failed to load offers');
      setOffers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  const handleRespondToOffer = async (offerId, status, counterAmount = null) => {
    const existing = offers.find((o) => o._id === offerId);
    if (!existing) {
      toast.error('Offer not found.');
      return;
    }
    if (existing.status !== 'Pending') {
      toast.error(`This offer is already ${existing.status}.`);
      return;
    }

    if (!window.confirm(`Are you sure you want to ${status.toLowerCase()} this offer?`)) return;

    try {
      setResponding(offerId);
      const payload = { status };
      if (status === 'Countered' && counterAmount) {
        payload.counter_amount = counterAmount;
      }

      const response = await axios.patch(
        `${RESOLVED_API_ROOT}/api/offers/${offerId}/respond`,
        payload,
        { headers: authHeaders() }
      );

      setOffers((prev) => prev.map((o) => (o._id === offerId ? response.data : o)));
      toast.success(`Offer ${status.toLowerCase()}!`);
    } catch (error) {
      console.error('Failed to respond to offer:', error);
      toast.error(error.response?.data?.message || 'Failed to respond to offer');
    } finally {
      setResponding(null);
    }
  };

  const handlePayNowClick = (offer) => {
    if (offer.status !== 'Accepted') {
      toast.error('Payment is only available for accepted offers.');
      return;
    }
    setPaymentModal({
      isOpen: true,
      offerId: offer._id,
      offerAmount: offer.offer_amount,
      gemName: offer.gem_name || offer.gem_id?.name || 'Gem',
    });
    setCardData({ number: '', expiry: '', cvc: '' });
  };

  const handleProcessPayment = async () => {
    if (!cardData.number || !cardData.expiry || !cardData.cvc) {
      toast.error('Please fill in all card details');
      return;
    }

    try {
      setPaymentProcessing(true);

      await new Promise((resolve) => setTimeout(resolve, 1500));

      const response = await axios.post(
        `${RESOLVED_API_ROOT}/api/offers/${paymentModal.offerId}/pay`,
        {},
        { headers: authHeaders() }
      );

      const paidOffer = response.data?.offer ?? response.data;
      if (paidOffer && paidOffer._id) {
        setOffers((prev) => prev.map((o) => (o._id === paidOffer._id ? paidOffer : o)));
      } else {
        await fetchOffers();
      }

      toast.success('Payment successful! Gem is now sold.');
      setPaymentModal({ isOpen: false, offerId: null, offerAmount: 0, gemName: '' });
      setCardData({ number: '', expiry: '', cvc: '' });
    } catch (error) {
      console.error('Payment failed:', error);
      toast.error(error.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setPaymentProcessing(false);
    }
  };

const handleDeleteOffer = async (offerId) => {
  if (!window.confirm('Are you sure you want to permanently delete this offer?')) return;
  try {
    await axios.delete(`${RESOLVED_API_ROOT}/api/offers/${offerId}`, { headers: authHeaders() });
    setOffers((prev) => prev.filter((o) => o._id !== offerId));
    toast.success('Offer deleted successfully');
  } catch (error) {
    console.error('Failed to delete offer:', error);
    toast.error(error.response?.data?.message || 'Failed to delete offer');
  }
};

const handleCounterOffer = async (offerId, counterPrice) => {
  try {
    setResponding(offerId);
    const response = await axios.patch(
      `${RESOLVED_API_ROOT}/api/offers/${offerId}/counter`,
      { counter_price: counterPrice },
      { headers: authHeaders() }
    );
    
    setOffers((prev) => prev.map((o) => (o._id === offerId ? response.data : o)));
    toast.success('Counter offer sent!');
  } catch (error) {
    console.error('Failed to send counter offer:', error);
    toast.error(error.response?.data?.message || 'Failed to send counter offer');
  } finally {
    setResponding(null);
  }
};

const getStatusBadge = (status) => {
    const statusConfig = {
      Pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Clock },
      Accepted: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle },
      Rejected: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: XCircle },
      Countered: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: Clock },
      Paid: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: CheckCircle },
    };

    const config = statusConfig[status] || statusConfig.Pending;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border ${config.bg} ${config.text} ${config.border}`}
      >
        <Icon size={14} />
        {status}
      </span>
    );
  };

  const filteredOffers = offers.filter((offer) => {
    const matchesSearch =
      offer.gem_name?.toLowerCase().includes(search.toLowerCase()) ||
      offer.buyer_name?.toLowerCase().includes(search.toLowerCase()) ||
      offer.buyer_email?.toLowerCase().includes(search.toLowerCase()) ||
      offer.seller_name?.toLowerCase().includes(search.toLowerCase()) ||
      offer.seller_id?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      offer.seller_id?.email?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = filterStatus === 'All' || offer.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const showSellerActions = userRole === 'seller' || userRole === 'admin';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading offers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-blue-100 rounded-2xl p-6">
        <div className="mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <DollarSign className="text-blue-600" size={28} />
              {userRole === 'buyer' ? 'My Offers' : 'Bidding & Offers Management'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {userRole === 'buyer'
                ? 'Track your offers and complete payment when a seller accepts.'
                : 'Manage incoming offers and counter-bids from buyers.'}
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by gem name, buyer, or seller..."
              className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {STATUSES.map((status) => (
              <button
                key={status}
                type="button"
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
        </div>
      </div>

      <div className="bg-white border border-blue-100 rounded-2xl overflow-hidden">
        {filteredOffers.length === 0 ? (
          <div className="p-12 text-center">
            <DollarSign size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium mb-4">
              {offers.length === 0
                ? userRole === 'buyer'
                  ? 'No offers yet. Start placing offers on gems!'
                  : 'No offers yet. Buyers will start making offers when you enable negotiable pricing.'
                : 'No offers match your filters.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Gem Details
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Base Price
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Offer Amount
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {userRole === 'buyer' ? 'Seller' : 'Buyer'}
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Date
                  </th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredOffers.map((offer) => (
                  <motion.tr
                    key={offer._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {offer.gem_id?.image_url ? (
                          <img
                            src={offer.gem_id.image_url}
                            alt={offer.gem_name}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">
                            <Package size={18} className="text-slate-400" />
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-900 text-sm line-clamp-1">{offer.gem_name}</div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            ID:{' '}
                            {offer.gem_id?._id
                              ? `${String(offer.gem_id._id).slice(0, 8)}…`
                              : '—'}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 text-sm">
                        LKR {offer.gem_id?.base_price?.toLocaleString() || '—'}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-bold text-blue-600 text-sm">
                        LKR {offer.offer_amount?.toLocaleString() || '—'}
                      </div>
                      {offer.offer_amount && offer.gem_id?.base_price && (
                        <div className="text-xs text-slate-500 mt-0.5">
                          {Math.round((offer.offer_amount / offer.gem_id.base_price) * 100)}% of base
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 text-sm">
                        {userRole === 'buyer'
                          ? offer.seller_id?.full_name || offer.seller_id?.email || 'Seller'
                          : offer.buyer_name}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                        {userRole === 'buyer' ? offer.seller_id?.email || '' : offer.buyer_email}
                      </div>
                    </td>

                    <td className="px-6 py-4">{getStatusBadge(offer.status)}</td>

                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-600">
                        {new Date(offer.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 flex-wrap">
{showSellerActions && offer.status === 'Pending' && (
                           <>
                             <motion.button
                               type="button"
                               onClick={() => handleRespondToOffer(offer._id, 'Accepted')}
                               disabled={responding === offer._id}
                               whileHover={{ scale: 1.08 }}
                               whileTap={{ scale: 0.95 }}
                               className="w-9 h-9 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors border border-emerald-200 disabled:opacity-50"
                               title="Accept Offer"
                             >
                               {responding === offer._id ? (
                                 <Loader size={16} className="animate-spin" />
                               ) : (
                                 <Check size={16} />
                               )}
                             </motion.button>
                             <motion.button
                               type="button"
                               onClick={() => handleRespondToOffer(offer._id, 'Rejected')}
                               disabled={responding === offer._id}
                               whileHover={{ scale: 1.08 }}
                               whileTap={{ scale: 0.95 }}
                               className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors border border-red-200 disabled:opacity-50"
                               title="Reject Offer"
                             >
                               {responding === offer._id ? (
                                 <Loader size={16} className="animate-spin" />
                               ) : (
                                 <X size={16} />
                               )}
                             </motion.button>
                             {userRole === 'admin' && (
                               <motion.button
                                 type="button"
                                 onClick={() => {
                                   const counterPrice = prompt('Enter counter price (LKR):');
                                   if (counterPrice && !isNaN(counterPrice) && parseFloat(counterPrice) > 0) {
                                     handleCounterOffer(offer._id, parseFloat(counterPrice));
                                   }
                                 }}
                                 disabled={responding === offer._id}
                                 whileHover={{ scale: 1.08 }}
                                 whileTap={{ scale: 0.95 }}
                                 className="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors border border-blue-200"
                                 title="Counter Offer"
                               >
                                 {responding === offer._id ? (
                                   <Loader size={16} className="animate-spin" />
                                 ) : (
                                   <Check size={16} />
                                 )}
                               </motion.button>
                             )}
                           </>
                         )}

                        {offer.status === 'Accepted' && userRole === 'buyer' && (
                          <motion.button
                            type="button"
                            onClick={() => handlePayNowClick(offer)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-green-500/30"
                          >
                            <CreditCard size={16} />
                            Pay Now
                          </motion.button>
                        )}

                        {offer.status === 'Accepted' && userRole !== 'buyer' && (
                          <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                            Awaiting buyer payment
                          </div>
                        )}

                        {offer.status === 'Paid' && (
                          <div className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
                            Paid
                          </div>
                        )}

                        {offer.status === 'Rejected' && userRole !== 'buyer' && (
                          <div className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">
                            Rejected
                          </div>
                        )}

                        {offer.status === 'Countered' && (
                          <div className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
                            Counter: LKR {offer.counter_amount?.toLocaleString()}
                          </div>
                        )}

                        {userRole === 'admin' && (
                          <motion.button
                            type="button"
                            onClick={() => handleDeleteOffer(offer._id)}
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors border border-red-200"
                            title="Delete offer"
                          >
                            <Trash2 size={16} />
                          </motion.button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {offers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              label: 'Total Offers',
              value: offers.length,
              box: 'bg-blue-50 border-blue-200',
              labelCls: 'text-blue-600',
              valCls: 'text-blue-700',
            },
            {
              label: 'Pending',
              value: offers.filter((o) => o.status === 'Pending').length,
              box: 'bg-amber-50 border-amber-200',
              labelCls: 'text-amber-600',
              valCls: 'text-amber-700',
            },
            {
              label: 'Accepted',
              value: offers.filter((o) => o.status === 'Accepted').length,
              box: 'bg-emerald-50 border-emerald-200',
              labelCls: 'text-emerald-600',
              valCls: 'text-emerald-700',
            },
            {
              label: 'Paid',
              value: offers.filter((o) => o.status === 'Paid').length,
              box: 'bg-green-50 border-green-200',
              labelCls: 'text-green-600',
              valCls: 'text-green-700',
            },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              whileHover={{ scale: 1.02 }}
              className={`border rounded-xl p-4 text-center ${stat.box}`}
            >
              <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${stat.labelCls}`}>{stat.label}</p>
              <p className={`text-3xl font-black ${stat.valCls}`}>{stat.value}</p>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {paymentModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => !paymentProcessing && setPaymentModal({ isOpen: false, offerId: null, offerAmount: 0, gemName: '' })}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <CreditCard size={28} />
                  <h3 className="text-2xl font-black">Secure Payment</h3>
                </div>
                <p className="text-blue-100 text-sm">Complete your purchase of {paymentModal.gemName}</p>
              </div>

              <div className="p-6 space-y-6">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-sm text-slate-600 font-medium mb-1">Total Amount</p>
                  <p className="text-3xl font-black text-blue-600">
                    LKR {paymentModal.offerAmount?.toLocaleString()}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Card Number</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    maxLength="16"
                    value={cardData.number}
                    onChange={(e) =>
                      setCardData({ ...cardData, number: e.target.value.replace(/\D/g, '').slice(0, 16) })
                    }
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition font-mono text-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      placeholder="12/25"
                      maxLength="5"
                      value={cardData.expiry}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, '');
                        if (val.length >= 2) {
                          val = `${val.slice(0, 2)}/${val.slice(2, 4)}`;
                        }
                        setCardData({ ...cardData, expiry: val });
                      }}
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">CVC</label>
                    <input
                      type="text"
                      placeholder="123"
                      maxLength="3"
                      value={cardData.cvc}
                      onChange={(e) =>
                        setCardData({ ...cardData, cvc: e.target.value.replace(/\D/g, '').slice(0, 3) })
                      }
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition font-mono"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <motion.button
                    type="button"
                    onClick={() => setPaymentModal({ isOpen: false, offerId: null, offerAmount: 0, gemName: '' })}
                    disabled={paymentProcessing}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={handleProcessPayment}
                    disabled={paymentProcessing}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-green-500/30 disabled:opacity-70"
                  >
                    {paymentProcessing ? (
                      <>
                        <Loader size={18} className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard size={18} />
                        Confirm Payment
                      </>
                    )}
                  </motion.button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-blue-700">
                    This is a simulated payment. In production, integrate with Stripe or PayPal.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BiddingManagementTab;
