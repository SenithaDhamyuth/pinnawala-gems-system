import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, Diamond, Tag, Gavel, Award, Scale, Palette, ShoppingCart, CreditCard, MessageCircle, ShieldCheck, Store } from 'lucide-react';
import OfferModal from './OfferModal';
import ChatWindow from '../ChatWindow';


const LISTING_ICON = { Direct_Sale: Tag, Auction: Gavel };

const Field = ({ label, value, icon: Icon }) => (
  <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-200/50 flex-shrink-0">
      <Icon size={18} className="text-blue-600" />
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-sm font-bold text-slate-900 mt-0.5">{value || '—'}</p>
    </div>
  </div>
);

export default function GemDetailModal({ gem, onClose }) {
  const navigate = useNavigate();
  const [showOffer, setShowOffer] = useState(false);
  const [showChat, setShowChat] = useState(false);

  // Auth detection: token indicates ANY logged-in user, role determines type
  const token   = localStorage.getItem('token');
  const role    = localStorage.getItem('role');
  const isGuest = !token; // No token = guest/unauthenticated
  const isBuyer = role === 'buyer' && token;
  
  const ListingIcon = LISTING_ICON[gem.listing_type] || Tag;
  const isCompany   = gem.seller_type === 'Company';
  const isNegotiable = gem.is_negotiable || gem.listing_type === 'Negotiable';



  const handleBuyNow = (e) => {
    e.preventDefault();
    onClose();
    navigate('/payment', { state: { gem } });
  };

  const handleChatClick = (e) => {
    e.preventDefault();
    setShowChat(true);
  };

  const buildChatGem = () => ({
    _id: gem._id,
    name: gem.name,
    seller_id: gem.seller_id,
    image_url: gem.image_url,
    initialMessage: `I am interested in buying ${gem.name} (ID: ${gem._id})`
  });

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
      >
        {/* COMPACT MODAL: max-w-4xl changed to max-w-3xl, adjusted padding and layout */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          onClick={e => e.stopPropagation()}
          className="bg-white rounded-[32px] w-full max-w-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[85vh]"
        >
          {/* Top Line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 to-emerald-500" />
          
          {/* Header */}
          <div className="px-6 pt-6 pb-4 flex items-start justify-between border-b border-slate-100 flex-shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100 shadow-inner">
                <Diamond size={22} className="text-blue-600" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 leading-tight mb-1 line-clamp-1">{gem.name}</h2>
                <div className="flex items-center gap-2">
                  <span className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${isCompany ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                    {isCompany ? <ShieldCheck size={10} /> : <Store size={10} />}
                    {isCompany ? 'Official Pinnawala Gem' : 'Partner Seller'}
                  </span>
                  <span className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${isNegotiable ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                    {isNegotiable ? <Gavel size={10} /> : <Tag size={10} />} 
                    {isNegotiable ? 'Negotiable' : 'Fixed Price'}
                  </span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 bg-slate-50 rounded-full hover:bg-slate-100 hover:text-red-500 text-slate-400 transition-colors">
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>

          {/* Body Content - Side by Side on MD screens, Stacked on Mobile */}
          <div className="flex flex-col md:flex-row overflow-y-auto custom-scrollbar">
            
            {/* IMAGE SECTION (Left Side) - Original Image Logic Used Here */}
            <div className="md:w-5/12 p-6 md:border-r border-slate-100 bg-slate-50/50 flex flex-col">
              <div className="bg-slate-50 rounded-2xl flex items-center justify-center h-56 sm:h-64 p-4 border border-slate-200/60 shadow-inner relative overflow-hidden group w-full">
                {gem.image_url ? (
                  <img 
                    src={gem.image_url} 
                    alt={gem.name} 
                    className="max-w-full max-h-full object-contain drop-shadow-xl group-hover:scale-105 transition-transform duration-500" 
                  />
                ) : (
                  <Diamond size={64} className="text-slate-200" strokeWidth={1} />
                )}
                
                {/* NGJA Badge overlay */}
                {gem.ngja_cert && (
                  <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-1.5">
                     <Award size={12} className="text-emerald-500" />
                     <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Certified</span>
                  </div>
                )}
              </div>
              
              {/* Quick Value Display under image */}
              <div className="mt-6 text-center">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Base Value</p>
                 <p className="text-3xl font-black text-slate-900 tracking-tight">
                   <span className="text-sm text-slate-400 mr-1 font-bold">LKR</span>
                   {gem.base_price.toLocaleString()}
                 </p>
              </div>
            </div>

            {/* DETAILS SECTION (Right Side) */}
            <div className="flex-1 p-6 flex flex-col">
              <div className="grid grid-cols-2 gap-3 mb-6">
                <Field label="Gem Type"  value={gem.gem_type}          icon={Diamond} />
                <Field label="Color"     value={gem.color}             icon={Palette} />
                <Field label="Weight"    value={`${gem.weight_carats} Carats`} icon={Scale}   />
                <Field label="NGJA Cert" value={gem.ngja_cert || 'Unverified'} icon={Award}   />
              </div>

              {gem.description && (
                <div className="mb-6 flex-1">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Description</p>
                   <div className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50 rounded-2xl p-4 border border-slate-100 shadow-sm max-h-32 overflow-y-auto custom-scrollbar"
                        dangerouslySetInnerHTML={{ __html: gem.description }}
                   />
                </div>
              )}

              {/* ACTION BUTTONS (Bottom Right) */}
              <div className="mt-auto pt-4 border-t border-slate-100 space-y-3">
                {/* Chat button — buyers navigate to Messages, guests see login prompt */}
                {isBuyer && (
                  <button
                    type="button"
                    onClick={handleChatClick}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all shadow-sm bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200"
                  >
                    <MessageCircle size={16} />
                    {isCompany ? 'Chat with Pinnawala Admin' : 'Chat with Seller'}
                  </button>
                )}

                <div className="flex gap-3">
                  {isBuyer ? (
                    <>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={handleBuyNow}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-emerald-500 transition-colors"
                      >
                        <CreditCard size={16} /> Buy Now
                      </motion.button>
                      
                      {isNegotiable && (
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          onClick={() => setShowOffer(true)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-md hover:bg-slate-800 transition-colors"
                        >
                          <ShoppingCart size={16} /> Make Offer
                        </motion.button>
                      )}
                    </>
                  ) : isGuest ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => { onClose(); navigate('/login'); }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-blue-500 transition-colors"
                    >
                      <ShieldCheck size={16} /> Login to Make Offer
                    </motion.button>
                  ) : (
                    <div className="w-full bg-slate-100 border border-slate-200 p-3 rounded-xl text-center flex flex-col items-center">
                       <p className="text-xs font-bold text-slate-700">This feature is available for buyers only.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Offer Sub-Modal */}
      {showOffer && (
        <OfferModal
          gem={gem}
          onClose={() => setShowOffer(false)}
          onSuccess={() => { setShowOffer(false); onClose(); }}
        />
      )}

      {/* Chat Modal Overlay */}
      <AnimatePresence>
        {showChat && (
          <ChatWindow 
            gem={buildChatGem()} 
            onClose={() => setShowChat(false)}
            initialMessage={buildChatGem().initialMessage}
          />
        )}
      </AnimatePresence>
    </>
  );
}
