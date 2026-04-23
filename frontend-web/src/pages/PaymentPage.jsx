import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard, Lock, CheckCircle, Diamond, ArrowLeft,
  ShieldCheck, Zap, ChevronRight, AlertCircle
} from 'lucide-react';
import { processPayment } from '../services/api';

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatCard(val) {
  return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}
function formatExpiry(val) {
  const digits = val.replace(/\D/g, '').slice(0, 4);
  return digits.length >= 3 ? `${digits.slice(0,2)}/${digits.slice(2)}` : digits;
}

export default function PaymentPage() {
  const { state }  = useLocation();
  const navigate   = useNavigate();
  const gem        = state?.gem;

  const [card, setCard]       = useState({ number: '', name: '', expiry: '', cvv: '' });
  // Lazy initializer: detect missing gem data on the VERY FIRST render,
  // before any effects fire, preventing a blank/crashed form render.
  const [step, setStep]       = useState(() => (!state?.gem?._id) ? 'error' : 'form');
  const [error, setError]     = useState('');
  const [flipped, setFlipped] = useState(false);

  // Redirect helper used by the error state CTA
  const handlePaymentError = () => navigate('/marketplace');

  const handlePay = async (e) => {

    e.preventDefault();
    setError('');
    const digits = card.number.replace(/\s/g, '');
    if (digits.length < 16)   { setError('Please enter a valid 16-digit card number.'); return; }
    if (!card.expiry.includes('/')) { setError('Please enter a valid expiry (MM/YY).'); return; }
    if (card.cvv.length < 3)  { setError('CVV must be 3 digits.'); return; }
    if (!card.name.trim())    { setError('Please enter the cardholder name.'); return; }

    setStep('processing');
    try {
      await processPayment({ 
        gem_id: gem._id, 
        offer_id: gem.offer_id, 
        card_last4: digits.slice(-4) 
      });
      setStep('success');
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
      setStep('form');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient glow blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-600/8 rounded-full blur-[120px] pointer-events-none" />

      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate(-1)}
        className="absolute top-8 left-8 flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm font-semibold"
      >
        <ArrowLeft size={16} /> Back
      </motion.button>

      <AnimatePresence mode="wait">

        {/* ── ERROR STATE (Missing Gem Data) ── */}
        {step === 'error' && (
          <motion.div key="error"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6 text-center max-w-md"
          >
            <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/30">
              <AlertCircle size={48} className="text-red-400" strokeWidth={1.5} />
            </div>
            <h2 className="text-3xl font-black text-white">Payment Unavailable</h2>
            <p className="text-white/60 font-medium leading-relaxed">
              We couldn't process your payment. The gem information is missing or invalid. Please return to the marketplace and try again.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handlePaymentError}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-500/25 hover:bg-blue-500 transition-colors flex items-center justify-center gap-2"
            >
              Return to Marketplace <ChevronRight size={16} />
            </motion.button>
          </motion.div>
        )}
        {step === 'processing' && (
          <motion.div key="processing"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6 text-white"
          >
            <div className="relative">
              <div className="w-24 h-24 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
              <Diamond size={32} className="text-blue-400 absolute inset-0 m-auto" />
            </div>
            <h2 className="text-2xl font-bold">Securing your transaction…</h2>
            <p className="text-white/60 text-sm">Processing with 256-bit encryption</p>
          </motion.div>
        )}

        {/* ── SUCCESS ── */}
        {step === 'success' && (
          <motion.div key="success"
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-6 text-center max-w-md"
          >
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
              className="w-28 h-28 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/30"
            >
              <CheckCircle size={56} className="text-emerald-400" strokeWidth={1.5} />
            </motion.div>
            <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="text-3xl font-black text-white"
            >Payment Successful!</motion.h2>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="text-white/60 font-medium leading-relaxed"
            >
              <span className="text-white font-bold">{gem?.name || 'Your gem'}</span> is now yours!<br />
              The seller has been notified. Enjoy your rare gem.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-5 w-full text-left space-y-3"
            >
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Gem</span>
                <span className="text-white font-bold">{gem?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Amount Paid</span>
                <span className="text-white font-bold">LKR {gem?.base_price?.toLocaleString() || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-white/10 pt-3">
                <span className="text-white/60">Status</span>
                <span className="text-emerald-400 font-black">✓ COMPLETED</span>
              </div>
            </motion.div>
            <motion.button
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/marketplace')}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-500/25 hover:bg-blue-500 transition-colors flex items-center justify-center gap-2"
            >
              Continue Browsing <ChevronRight size={16} />
            </motion.button>
          </motion.div>
        )}

        {/* ── PAYMENT FORM ── */}
        {step === 'form' && (
          <motion.div key="form"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Lock size={14} className="text-emerald-400" />
                <span className="text-emerald-400 text-xs font-black uppercase tracking-widest">Secure Checkout</span>
              </div>
              <h1 className="text-3xl font-black text-white mb-1">Complete Purchase</h1>
              <p className="text-white/50 text-sm">Powered by Pinnawala Payments</p>
            </div>

            {/* Order Summary Card */}
            <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-5 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0">
                  {gem?.image_url
                    ? <img src={gem.image_url} alt={gem.name} className="w-full h-full object-contain mix-blend-luminosity" />
                    : <Diamond size={28} className="text-white/40" />
                  }
                </div>
                <div className="flex-1">
                  <p className="text-white/50 text-[10px] font-black uppercase tracking-widest">Purchasing</p>
                  <h3 className="text-white font-bold text-lg leading-tight">{gem?.name || 'Gem'}</h3>
                  <p className="text-white/50 text-xs">{gem?.gem_type || 'N/A'} · {gem?.weight_carats || 'N/A'} CT</p>
                </div>
                <div className="text-right">
                  <p className="text-white/50 text-[10px] font-black uppercase tracking-widest">Total</p>
                  <p className="text-white font-black text-xl">LKR {gem?.base_price?.toLocaleString() || '0'}</p>
                </div>
              </div>
            </div>

            {/* Visual Credit Card */}
            <div
              className="relative h-44 mb-6 cursor-pointer perspective-[1000px]"
              onClick={() => setFlipped(f => !f)}
            >
              <motion.div
                animate={{ rotateY: flipped ? 180 : 0 }}
                transition={{ duration: 0.5 }}
                className="w-full h-full [transform-style:preserve-3d] relative"
              >
                {/* Front */}
                <div className="absolute inset-0 [backface-visibility:hidden] rounded-3xl p-7 bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 shadow-2xl shadow-blue-900/50 border border-white/10 overflow-hidden">
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] rounded-full border border-white/50" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] rounded-full border border-white/30" />
                  </div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-10 h-8 rounded-md bg-gradient-to-br from-yellow-300 to-yellow-500 shadow-inner" />
                    <div className="flex items-center gap-1">
                      <div className="w-7 h-7 rounded-full bg-red-500 opacity-80" />
                      <div className="w-7 h-7 rounded-full bg-orange-400 opacity-80 -ml-3" />
                    </div>
                  </div>
                  <p className="text-white font-mono text-xl tracking-[0.25em] mb-4 drop-shadow-lg">
                    {card.number || '•••• •••• •••• ••••'}
                  </p>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-white/50 text-[9px] uppercase tracking-widest mb-0.5">Card Holder</p>
                      <p className="text-white font-bold text-sm uppercase tracking-wide">{card.name || 'YOUR NAME'}</p>
                    </div>
                    <div>
                      <p className="text-white/50 text-[9px] uppercase tracking-widest mb-0.5">Expires</p>
                      <p className="text-white font-bold text-sm">{card.expiry || 'MM/YY'}</p>
                    </div>
                  </div>
                </div>
                {/* Back */}
                <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 shadow-2xl border border-white/10 overflow-hidden">
                  <div className="h-12 bg-slate-700 mt-7" />
                  <div className="px-7 mt-6">
                    <div className="bg-white/10 rounded-lg px-4 py-3 flex items-center justify-end">
                      <p className="text-white font-mono font-bold tracking-widest">{card.cvv || '•••'}</p>
                    </div>
                    <p className="text-white/30 text-[10px] text-right mt-2 uppercase tracking-widest">CVV / Security Code</p>
                  </div>
                </div>
              </motion.div>
            </div>
            <p className="text-white/30 text-xs text-center mb-6">Click card to flip · This is a demo payment</p>

            {/* Form */}
            <form onSubmit={handlePay} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-white/50 uppercase tracking-widest mb-2">Card Number</label>
                <div className="relative">
                  <CreditCard size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="text" inputMode="numeric" placeholder="1234 5678 9012 3456"
                    value={card.number} maxLength={19}
                    onChange={e => setCard(c => ({ ...c, number: formatCard(e.target.value) }))}
                    className="w-full pl-11 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-mono placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-white/50 uppercase tracking-widest mb-2">Cardholder Name</label>
                <input
                  type="text" placeholder="John Doe"
                  value={card.name}
                  onChange={e => setCard(c => ({ ...c, name: e.target.value }))}
                  className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-white/50 uppercase tracking-widest mb-2">Expiry Date</label>
                  <input
                    type="text" placeholder="MM/YY"
                    value={card.expiry} maxLength={5}
                    onChange={e => setCard(c => ({ ...c, expiry: formatExpiry(e.target.value) }))}
                    className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-white/50 uppercase tracking-widest mb-2">CVV</label>
                  <input
                    type="text" inputMode="numeric" placeholder="•••"
                    value={card.cvv} maxLength={4}
                    onFocus={() => setFlipped(true)} onBlur={() => setFlipped(false)}
                    onChange={e => setCard(c => ({ ...c, cvv: e.target.value.replace(/\D/g,'').slice(0,4) }))}
                    className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  />
                </div>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.p initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="text-red-400 text-sm font-medium text-center py-2"
                  >{error}</motion.p>
                )}
              </AnimatePresence>

              {/* Trust badges */}
              <div className="flex items-center justify-center gap-6 py-2">
                {[
                  { icon: Lock,        label: '256-bit SSL' },
                  { icon: ShieldCheck, label: 'PCI Compliant' },
                  { icon: Zap,         label: 'Instant' },
                ].map(b => (
                  <div key={b.label} className="flex items-center gap-1.5 text-white/30 text-[10px] font-bold uppercase tracking-wider">
                    <b.icon size={11} /> {b.label}
                  </div>
                ))}
              </div>

              {/* Pay Button */}
              <motion.button
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-2xl font-black text-base shadow-2xl shadow-blue-500/30 hover:from-blue-500 hover:to-blue-400 transition-all flex items-center justify-center gap-3"
              >
                <Lock size={16} />
                Pay LKR {gem?.base_price?.toLocaleString() || '0'}
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
