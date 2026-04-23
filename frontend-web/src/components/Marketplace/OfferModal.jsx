import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { X, CheckCircle2, SendHorizonal, ShoppingCart, Diamond } from 'lucide-react';
import { createOffer } from '../../services/api';

export default function OfferModal({ gem, onClose, onSuccess }) {
  const [amount, setAmount]   = useState(gem.base_price);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const [lockedPrice, setLockedPrice] = useState(null);
  const [error, setError]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      const msg = 'Please enter a valid offer amount.';
      setError(msg);
      toast.error(msg);
      return;
    }
    if (Number(amount) < 1) {
      const msg = 'Offer cannot be negative or zero.';
      setError(msg);
      toast.error(msg);
      return;
    }
    const minAllowed = gem.base_price * 0.5;
    if (Number(amount) < minAllowed) {
      const msg = `Offer must be at least 50% of the asking price (LKR ${minAllowed.toLocaleString()}).`;
      setError(msg);
      toast.error(msg);
      return;
    }
    setLoading(true);
    setError('');
    try {
      await createOffer({ gem_id: gem._id, offer_amount: Number(amount), message });
      setLockedPrice(Number(amount));
      setDone(true);
      // Store in cart (localStorage)
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      cart.push({ gem_id: gem._id, name: gem.name, negotiatedPrice: Number(amount), image_url: gem.image_url });
      localStorage.setItem('cart', JSON.stringify(cart));
      toast.success('Offer submitted successfully.');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit offer. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-emerald-500" />

        <AnimatePresence mode="wait">
          {done ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="px-8 pb-10 pt-10 flex flex-col items-center text-center"
            >
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
                className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100 mb-5"
              >
                <CheckCircle2 size={40} className="text-emerald-500" strokeWidth={1.5} />
              </motion.div>
              <h3 className="text-xl font-serif font-bold text-slate-900 mb-2">Offer Submitted!</h3>
              <p className="text-slate-500 font-medium mb-1">Your offer of</p>
              <div className="text-3xl font-black text-blue-600 mb-2">LKR {lockedPrice?.toLocaleString()}</div>
              <p className="text-slate-500 font-medium text-sm mb-1">has been sent to the seller.</p>
              <div className="mt-4 w-full bg-blue-50 rounded-2xl p-4 flex items-center gap-3 border border-blue-100">
                <ShoppingCart size={20} className="text-blue-600 flex-shrink-0" />
                <p className="text-sm font-bold text-blue-700">
                  Price locked in your cart at LKR {lockedPrice?.toLocaleString()} pending seller confirmation.
                </p>
              </div>
              <button onClick={onSuccess} className="mt-6 w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20">
                Continue Browsing
              </button>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Header */}
              <div className="px-8 pt-7 pb-5 flex items-start justify-between border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
                    <Diamond size={18} className="text-blue-600" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif font-bold text-slate-900">{gem.name}</h3>
                    <p className="text-xs text-slate-400 font-medium">Base: LKR {gem.base_price.toLocaleString()}</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Your Offer Amount (LKR)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">LKR</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      min="1"
                      className="w-full pl-14 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                    />
                  </div>
                  {Number(amount) < gem.base_price && (
                    <p className="text-amber-600 text-xs font-semibold mt-1.5">
                      ⚠️ Your offer is {((1 - amount / gem.base_price) * 100).toFixed(1)}% below the asking price.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Message to Seller (Optional)</label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Introduce yourself or add context to your offer…"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 resize-none transition-all"
                  />
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-50 text-red-600 border border-red-100 text-sm font-bold">{error}</div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 hover:bg-blue-500 transition-colors disabled:opacity-70"
                >
                  {loading ? 'Submitting…' : <>Submit Offer <SendHorizonal size={16} /></>}
                </motion.button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
