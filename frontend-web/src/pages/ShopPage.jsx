import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Diamond, ArrowLeft, MapPin, Mail, Info, Tag, Gavel, ArrowRight, Clock, MessageCircle } from 'lucide-react';
import { getStorefront, getGemstones } from '../services/api';
import GemDetailModal from '../components/Marketplace/GemDetailModal';

export default function ShopPage() {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const [seller, setSeller] = useState(null);
  const [gems, setGems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGem, setSelectedGem] = useState(null);
  const [activeTab, setActiveTab] = useState('Direct_Sale');
  const [welcomeDismissed, setWelcomeDismissed] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sData = await getStorefront(sellerId);
        setSeller(sData);

        const gData = await getGemstones();
        const filteredGems = gData.filter(g => g.seller_id === sellerId && g.status === 'Active');
        setGems(filteredGems);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching storefront data for ID:', sellerId, err);
        setLoading(false);
      }
    };
    fetchData();
  }, [sellerId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Store Not Found</h2>
        <button onClick={() => navigate('/marketplace')} className="text-blue-600 font-bold hover:underline">Return to Marketplace</button>
      </div>
    );
  }

  const theme = seller.theme || { primaryColor: '#0f172a', fontFamily: 'Inter', bannerImage: '' };
  const filteredGems = gems.filter(g => g.listing_type === activeTab);

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: theme.fontFamily }}>
      {/* Dynamic Banner */}
      <div className="h-64 md:h-80 w-full relative overflow-hidden bg-slate-900">
        {theme.bannerImage ? (
          <img src={theme.bannerImage} className="w-full h-full object-cover opacity-60" alt="Banner" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" />
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <motion.button
            whileHover={{ x: -5 }}
            onClick={() => navigate('/marketplace')}
            className="absolute top-8 left-8 p-3 bg-white/10 backdrop-blur-md rounded-2xl text-white hover:bg-white/20 transition-all"
          >
            <ArrowLeft size={20} />
          </motion.button>
          <motion.h1 
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-2xl"
            style={{ color: theme.primaryColor === '#0f172a' ? 'white' : theme.primaryColor }}
          >
            {seller.shopName || seller.full_name}
          </motion.h1>
          <div className="flex items-center gap-4 text-white/80 text-sm font-medium">
            <span className="flex items-center gap-1.5"><MapPin size={14} /> {seller.address || 'Sri Lanka'}</span>
            <span className="w-1 h-1 bg-white/40 rounded-full" />
            <span className="flex items-center gap-1.5"><Mail size={14} /> {seller.email}</span>
            {seller.businessHours && (
              <>
                <span className="w-1 h-1 bg-white/40 rounded-full" />
                <span className="flex items-center gap-1.5">
                  <Clock size={14} />
                  {seller.businessHours.days?.join(', ') || 'Mon-Fri'} {seller.businessHours.open} - {seller.businessHours.close}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Welcome Note Banner */}
      {seller?.welcomeNote && !welcomeDismissed && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="px-6 py-3 flex items-center justify-between gap-4 text-white"
          style={{ backgroundColor: theme.primaryColor }}
        >
          <p className="text-sm font-semibold flex-1 text-center">{seller.welcomeNote}</p>
          <button 
            onClick={() => setWelcomeDismissed(true)} 
            className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full transition-colors text-white/80 hover:text-white hover:bg-white/20"
          >
            ✕
          </button>
        </motion.div>
      )}

      {/* Store Info Section */}
      <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-10">
        <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-900/5 p-8 md:p-12 border border-white/40" style={{ borderTop: `4px solid ${theme.primaryColor}` }}>
           <div className="flex flex-col md:flex-row gap-10 items-start">
              <div className="w-32 h-32 rounded-[32px] bg-slate-100 flex-shrink-0 flex items-center justify-center border-4 border-white shadow-xl overflow-hidden">
                {seller.shopLogo ? <img src={seller.shopLogo} className="w-full h-full object-cover" /> : <Diamond size={48} className="text-slate-300" />}
              </div>
              <div className="flex-1">
                 <h2 className="text-2xl font-bold text-slate-900 mb-3 flex items-center gap-3">
                   About the Store <Info size={20} className="text-slate-400" style={{ color: theme.primaryColor }} />
                 </h2>

                 {/* Store Badges */}
                 {Array.isArray(seller?.badges) && seller.badges.length > 0 && (
                   <div className="flex flex-wrap gap-2 mb-4">
                     {seller.badges.map(b => (
                       <span key={b} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white border" style={{ backgroundColor: theme.primaryColor, borderColor: theme.primaryColor + '40' }}>
                         ✅ {b}
                       </span>
                     ))}
                   </div>
                 )}

                 <p className="text-slate-600 leading-relaxed text-lg whitespace-pre-line">
                   {seller?.bio || "Welcome to our store! We specialized in ethically sourced Sri Lankan gemstones of the highest quality."}
                 </p>

                 {/* Social Links */}
                 {seller?.socialLinks && (seller.socialLinks.whatsapp || seller.socialLinks.instagram || seller.socialLinks.linkedin) && (
                   <div className="flex gap-3 mt-4 flex-wrap">
                     {seller.socialLinks.whatsapp && (
                       <a href={`https://wa.me/${seller.socialLinks.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer"
                         className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors text-white hover:shadow-lg"
                         style={{ backgroundColor: '#25D366' }}
                         onMouseEnter={(e) => {
                           e.target.style.transform = 'translateY(-2px)';
                           e.target.style.boxShadow = '0 4px 12px rgba(37, 211, 102, 0.3)';
                         }}
                         onMouseLeave={(e) => {
                           e.target.style.transform = 'translateY(0)';
                           e.target.style.boxShadow = 'none';
                         }}
                       >
                         📱 WhatsApp
                       </a>
                     )}
                     {seller.socialLinks.instagram && (
                       <a href={seller.socialLinks.instagram} target="_blank" rel="noreferrer"
                         className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors text-white hover:shadow-lg"
                         style={{ backgroundColor: '#E4405F' }}
                         onMouseEnter={(e) => {
                           e.target.style.transform = 'translateY(-2px)';
                           e.target.style.boxShadow = '0 4px 12px rgba(228, 64, 95, 0.3)';
                         }}
                         onMouseLeave={(e) => {
                           e.target.style.transform = 'translateY(0)';
                           e.target.style.boxShadow = 'none';
                         }}
                       >
                         📸 Instagram
                       </a>
                     )}
                     {seller.socialLinks.linkedin && (
                       <a href={seller.socialLinks.linkedin} target="_blank" rel="noreferrer"
                         className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors text-white hover:shadow-lg"
                         style={{ backgroundColor: '#0077B5' }}
                         onMouseEnter={(e) => {
                           e.target.style.transform = 'translateY(-2px)';
                           e.target.style.boxShadow = '0 4px 12px rgba(0, 119, 181, 0.3)';
                         }}
                         onMouseLeave={(e) => {
                           e.target.style.transform = 'translateY(0)';
                           e.target.style.boxShadow = 'none';
                         }}
                       >
                         💼 LinkedIn
                       </a>
                     )}
                   </div>
                 )}

                 {/* Shop Policies */}
                 {seller?.policies && (
                   <div className="mt-6 p-4 rounded-2xl" style={{ backgroundColor: theme.primaryColor + '10', borderLeft: `4px solid ${theme.primaryColor}` }}>
                     <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                       <Tag size={16} style={{ color: theme.primaryColor }} /> Shop Policies
                     </h3>
                     <p className="text-sm text-slate-600 whitespace-pre-line">{seller.policies}</p>
                   </div>
                 )}
              </div>
              <div className="w-full md:w-64 space-y-4">
                 <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100" style={{ borderTop: `3px solid ${theme.primaryColor}` }}>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Inventory Status</p>
                    <div className="flex items-end justify-between">
                       <p className="text-3xl font-black" style={{ color: theme.primaryColor }}>{gems.length}</p>
                       <p className="text-xs font-bold text-slate-600 mb-1">Active Gems</p>
                    </div>
                 </div>

                 {/* Contact Seller Button */}
                 {seller?.socialLinks?.whatsapp && (
                   <a 
                     href={`https://wa.me/${seller.socialLinks.whatsapp.replace(/\D/g,'')}`} 
                     target="_blank" 
                     rel="noreferrer"
                     className="w-full px-6 py-3 text-white font-bold rounded-2xl text-center transition-all hover:shadow-lg flex items-center justify-center gap-2"
                     style={{ backgroundColor: theme.primaryColor }}
                     onMouseEnter={(e) => {
                       e.target.style.transform = 'translateY(-2px)';
                       e.target.style.boxShadow = `0 8px 25px -5px ${theme.primaryColor}40`;
                     }}
                     onMouseLeave={(e) => {
                       e.target.style.transform = 'translateY(0)';
                       e.target.style.boxShadow = 'none';
                     }}
                   >
                     <MessageCircle size={16} /> Contact Seller
                   </a>
                 )}
              </div>
           </div>
        </div>
      </div>

      {/* Gem Grid with Tabs */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
           <h3 className="text-3xl font-bold text-slate-900">Store Collection</h3>
           
           {/* Framer Motion Tabs */}
           <div className="flex p-1.5 bg-slate-100 rounded-2xl w-fit relative" style={{ backgroundColor: theme.primaryColor + '10' }}>
              {[
                { id: 'Direct_Sale', label: 'Buy Now', icon: Tag },
                { id: 'Auction', label: 'Live Auctions', icon: Gavel },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all relative z-10 ${activeTab === tab.id ? 'text-white' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <tab.icon size={16} style={{ color: activeTab === tab.id ? 'white' : theme.primaryColor }} />
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeShopTab"
                      className="absolute inset-0 rounded-xl -z-10"
                      style={{ backgroundColor: theme.primaryColor }}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>
              ))}
           </div>
        </div>

        {filteredGems.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-[40px] border border-slate-100">
             <Diamond size={48} className="text-slate-200 mx-auto mb-4" />
             <p className="text-slate-500 font-bold">No {activeTab === 'Direct_Sale' ? 'fixed-price' : 'auction'} items available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredGems.map(gem => (
              <motion.div
                key={gem._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -10 }}
                onClick={() => setSelectedGem(gem)}
                className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-lg shadow-slate-200/40 cursor-pointer group"
              >
                <div className="bg-slate-50 rounded-2xl h-56 flex items-center justify-center mb-6 relative overflow-hidden">
                  {gem.image_url ? (
                    <img src={gem.image_url} alt={gem.name} className="max-h-[80%] max-w-[80%] object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110" />
                  ) : <Diamond size={48} className="text-slate-200" />}
                  <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-xl text-[10px] font-black text-slate-900 shadow-sm">
                    {gem.weight_carats} CT
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span style={{ color: theme.primaryColor, backgroundColor: `${theme.primaryColor}15` }} className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg">
                      {gem.gem_type}
                    </span>
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 truncate mb-4">{gem.name}</h4>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <p className="text-xl font-black text-slate-900">LKR {gem.base_price?.toLocaleString() ?? '0'}</p>
                    <div style={{ backgroundColor: theme.primaryColor }} className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg">
                      <ArrowRight size={20} />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedGem && <GemDetailModal gem={selectedGem} onClose={() => setSelectedGem(null)} />}
      </AnimatePresence>
    </div>
  );
}
