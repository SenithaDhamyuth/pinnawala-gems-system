import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store, ArrowLeft, Star, Shield, Package,
  Gem, MapPin, BadgeCheck, Info
} from 'lucide-react';
import GemDetailModal from '../components/Marketplace/GemDetailModal';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// ─── Image URL helper (mirrors imageUtil convention) ─────────────────────────
const buildUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_BASE}/${path}`;
};

// ─── Animation variants ───────────────────────────────────────────────────────
const containerVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } }
};
const cardVariants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } }
};

// ─── Main ShopView Page ───────────────────────────────────────────────────────
export default function ShopView() {
  const { sellerId } = useParams();
  const navigate     = useNavigate();

  const [seller,      setSeller]      = useState(null);
  const [gems,        setGems]        = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [selectedGem, setSelectedGem] = useState(null);

  useEffect(() => {
    if (sellerId) fetchShopData();
  }, [sellerId]);

  const fetchShopData = async () => {
    try {
      setLoading(true);
      const [sellerRes, gemsRes] = await Promise.all([
        fetch(`${API_BASE}/api/seller/storefront/${sellerId}`),
        fetch(`${API_BASE}/api/gems/seller/${sellerId}`)
      ]);

      if (!sellerRes.ok) throw new Error('Seller not found or shop unavailable.');

      const sellerData = await sellerRes.json();
      const gemsData   = gemsRes.ok ? await gemsRes.json() : [];

      setSeller(sellerData);
      setGems(gemsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 font-semibold tracking-wide">Loading shop…</p>
        </div>
      </div>
    );
  }

  // ── Error / not found ─────────────────────────────────────────────────────
  if (error || !seller) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center space-y-4 max-w-sm px-6">
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
            <Store size={36} className="text-slate-300" />
          </div>
          <h2 className="text-2xl font-black text-slate-700">Shop Not Found</h2>
          <p className="text-slate-500 text-sm">{error || 'This seller shop does not exist.'}</p>
          <button
            onClick={() => navigate('/marketplace')}
            className="mt-4 px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl
                       hover:bg-blue-600 transition-colors"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  const logoUrl     = buildUrl(seller.shopLogo);
  const shopName    = seller.shopName  || seller.full_name || 'Gem Shop';
  const shopBio     = seller.bio       || '';

  return (
    <div className="min-h-screen bg-[#F8FAFC]">

      {/* ══ HERO BANNER ══════════════════════════════════════════════════════ */}
      <section className="relative bg-gradient-to-br from-slate-900 via-[#0f172a] to-slate-900 overflow-hidden">

        {/* Decorative blobs + dot grid */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 left-1/3 w-[500px] h-[500px] bg-blue-700/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4  w-[400px] h-[400px] bg-amber-400/8  rounded-full blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}
          />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-14">

          {/* Back button */}
          <button
            id="shop-back-btn"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm
                       font-bold mb-10 transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back
          </button>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">

            {/* Logo ─────────────────────────────────────────────────────────── */}
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1,    opacity: 1 }}
              transition={{ duration: 0.45 }}
              className="relative flex-shrink-0"
            >
              <div
                className="w-28 h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden
                           border-2 border-white/10 shadow-2xl bg-slate-700
                           flex items-center justify-center"
              >
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={shopName}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.src = ''; e.currentTarget.style.display = 'none'; }}
                  />
                ) : (
                  <Store size={42} className="text-slate-500" />
                )}
              </div>

              {/* Verified badge */}
              <div
                className="absolute -bottom-2 -right-2 w-9 h-9 bg-emerald-500
                           rounded-full border-2 border-slate-900
                           flex items-center justify-center shadow-lg"
                title="Verified Seller"
              >
                <BadgeCheck size={16} className="text-white" />
              </div>
            </motion.div>

            {/* Shop info ────────────────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1,  x: 0  }}
              transition={{ duration: 0.45, delay: 0.12 }}
              className="flex-1 min-w-0"
            >
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-emerald-400
                               uppercase tracking-widest bg-emerald-400/10 border border-emerald-400/20
                               px-3 py-1 rounded-full mb-3">
                <Shield size={10} /> Verified Seller
              </span>

              <h1 className="text-3xl md:text-4xl font-black text-white mb-3 leading-tight break-words">
                {shopName}
              </h1>

              {shopBio && (
                <p className="text-slate-300 text-sm md:text-base max-w-xl leading-relaxed mb-4">
                  {shopBio}
                </p>
              )}

              {/* Stats row */}
              <div className="flex flex-wrap items-center gap-5 mt-2">
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <Package size={14} className="text-blue-400" />
                  <span>
                    <span className="text-white font-bold">{gems.length}</span>
                    {' '}Active {gems.length === 1 ? 'Listing' : 'Listings'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-400">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} size={12} fill="currentColor" className="text-amber-400" />
                  ))}
                  <span className="text-slate-500 text-xs ml-1">Certified Dealer</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══ GEMS GRID ════════════════════════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-6 py-12">

        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900">
              {gems.length > 0 ? `${gems.length} Available Gems` : 'No Gems Listed Yet'}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              All verified, marketplace-active listings from this seller
            </p>
          </div>
          <button
            onClick={() => navigate('/marketplace')}
            className="self-start sm:self-auto flex items-center gap-1.5 text-sm font-bold
                       text-blue-600 hover:text-blue-700 transition-colors"
          >
            <Gem size={14} />
            Browse Full Marketplace
          </button>
        </div>

        {/* Empty state */}
        {gems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24 bg-white rounded-2xl border border-slate-100 shadow-sm"
          >
            <Package size={52} className="text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-bold">This shop has no active gem listings yet.</p>
            <p className="text-slate-300 text-sm mt-1">Check back later for new additions.</p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
          >
            {gems.map(gem => (
              <ShopGemCard
                key={gem._id}
                gem={gem}
                onClick={() => setSelectedGem(gem)}
              />
            ))}
          </motion.div>
        )}
      </section>

      {/* ══ GEM DETAIL MODAL ════════════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedGem && (
          <GemDetailModal
            gem={selectedGem}
            onClose={() => setSelectedGem(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Shop-themed Gem Card ─────────────────────────────────────────────────────
function ShopGemCard({ gem, onClick }) {
  const [imgErr, setImgErr] = useState(false);
  const imgSrc = buildUrl(gem.image_url);

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -6, boxShadow: '0 20px 50px rgba(0,0,0,0.10)' }}
      onClick={onClick}
      id={`shop-gem-card-${gem._id}`}
      className="bg-white rounded-2xl border border-slate-100 overflow-hidden
                 cursor-pointer group transition-all duration-300"
    >
      {/* Image */}
      <div className="aspect-square bg-slate-50 relative overflow-hidden flex items-center justify-center p-4">
        {imgSrc && !imgErr ? (
          <img
            src={imgSrc}
            alt={gem.name}
            className="w-[85%] h-[85%] object-contain group-hover:scale-110
                       transition-transform duration-500 drop-shadow-xl"
            onError={() => setImgErr(true)}
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-slate-200 flex items-center justify-center">
            <Gem size={22} className="text-slate-400" />
          </div>
        )}

        {/* Weight badge */}
        <span
          className="absolute top-2 right-2 bg-white/90 backdrop-blur text-slate-700
                     text-[9px] font-black px-2 py-0.5 rounded-md shadow-sm border border-slate-100"
        >
          {gem.weight_carats} CT
        </span>

        {/* NGJA cert badge */}
        {gem.ngja_cert && (
          <span
            className="absolute top-2 left-2 bg-slate-900 text-emerald-400
                       text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider"
          >
            ✓ Cert
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3 text-center">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
          {gem.gem_type} · {gem.color}
        </p>
        <h3 className="text-[13px] font-black text-slate-800 mb-2 line-clamp-1
                       group-hover:text-blue-600 transition-colors">
          {gem.name}
        </h3>
        <p className="text-[14px] font-extrabold text-slate-900 mb-3">
          LKR {gem.base_price?.toLocaleString() ?? 'N/A'}
        </p>
        <button className="w-full py-2 rounded-full bg-slate-900 text-white text-[10px]
                           font-bold uppercase tracking-widest hover:bg-blue-600 transition-colors">
          View Details
        </button>
      </div>
    </motion.div>
  );
}
