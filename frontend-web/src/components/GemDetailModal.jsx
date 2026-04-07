import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Diamond, Tag, Gavel, Award, Scale, Palette, ShoppingCart, MessageCircle } from 'lucide-react';
import OfferModal from './OfferModal';
import ChatWindow from '../ChatWindow';   // adjust path if your folder structure differs

const LISTING_ICON = { Direct_Sale: Tag, Auction: Gavel };

const Field = ({ label, value, icon: Icon }) => (
  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-slate-100 flex-shrink-0">
      <Icon size={15} className="text-blue-600" />
    </div>
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-sm font-semibold text-slate-800 mt-0.5">{value || '—'}</p>
    </div>
  </div>
);

export default function GemDetailModal({ gem, onClose }) {
  const [showOffer, setShowOffer] = useState(false);
  const [showChat,  setShowChat]  = useState(false);

  const role      = localStorage.getItem('role');
  const ListingIcon = LISTING_ICON[gem.listing_type] || Tag;
  const isCompany   = gem.seller_type === 'Company';

  // Build the gem object that ChatWindow needs, including a buyer_id_for_room
  // so the seller-side chat can reconstruct the same room ID.
  // For a buyer, buyer_id comes from their own JWT (ChatWindow reads it).
  // For a seller opening a chat, gem must carry the buyer's ID — that info
  // only exists inside the Offer; for now sellers open chat from the Offer
  // Inbox (SellerDashboard), not from here.
  const gemForChat = { ...gem };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          onClick={e => e.stopPropagation()}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100"
        >
          {/* Top Bar */}
          <div className="relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-emerald-500" />
            <div className="px-8 pt-6 pb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100">
                  <Diamond size={22} className="text-blue-600" strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="text-xl font-serif font-bold text-slate-900 leading-tight">{gem.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${isCompany ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                      {isCompany ? '🏛 Pinnawala Certified' : '👤 3rd-Party Seller'}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border bg-slate-50 text-slate-500 border-slate-200 flex items-center gap-1">
                      <ListingIcon size={10} /> {gem.listing_type === 'Direct_Sale' ? 'Direct Sale' : 'Auction'}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors">
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="px-8 pb-8 flex flex-col md:flex-row gap-6">
            {/* Image */}
            <div className="md:w-2/5 bg-slate-50 rounded-2xl flex items-center justify-center min-h-[200px] p-4 border border-slate-100 flex-shrink-0">
              {gem.image_url ? (
                <img src={gem.image_url} alt={gem.name}
                  className="max-w-full max-h-48 object-contain mix-blend-multiply drop-shadow-xl" />
              ) : (
                <Diamond size={72} className="text-slate-200" strokeWidth={1} />
              )}
            </div>

            {/* Details */}
            <div className="flex-1 flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Gem Type"  value={gem.gem_type}                       icon={Diamond} />
                <Field label="Color"     value={gem.color}                          icon={Palette} />
                <Field label="Weight"    value={`${gem.weight_carats} Carats`}      icon={Scale}   />
                <Field label="NGJA Cert" value={gem.ngja_cert || 'Not specified'}   icon={Award}   />
              </div>
              {gem.description && (
                <p className="text-sm text-slate-600 font-medium leading-relaxed bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                  {gem.description}
                </p>
              )}

              {/* Price + CTAs */}
              <div className="mt-auto pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Base Value</p>
                    <p className="text-2xl font-black text-slate-900">LKR {gem.base_price.toLocaleString()}</p>
                  </div>
                </div>

                {/* Buyer action buttons */}
                {role === 'buyer' && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <motion.button
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      onClick={() => setShowOffer(true)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/25 hover:bg-blue-500 transition-colors"
                    >
                      <ShoppingCart size={15} /> Make an Offer
                    </motion.button>

                    {/* ── Chat with Seller button ── */}
                    <motion.button
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      onClick={(e) => { e.stopPropagation(); setShowChat(true); }}
                      className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors border border-slate-200"
                    >
                      <MessageCircle size={15} /> Chat with Seller
                    </motion.button>
                  </div>
                )}

                {!role && (
                  <p className="text-xs font-semibold text-slate-400 italic">Log in as a buyer to make an offer or chat with the seller</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Offer sub-modal */}
      <AnimatePresence>
        {showOffer && (
          <OfferModal
            gem={gem}
            onClose={() => setShowOffer(false)}
            onSuccess={() => { setShowOffer(false); onClose(); }}
          />
        )}
      </AnimatePresence>

      {/* Chat window — floats in bottom-right, independent of this modal */}
      <AnimatePresence>
        {showChat && (
          <ChatWindow gem={gemForChat} onClose={() => setShowChat(false)} />
        )}
      </AnimatePresence>
    </>
  );
}