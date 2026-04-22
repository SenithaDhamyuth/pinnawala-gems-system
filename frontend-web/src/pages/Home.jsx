import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, Sparkles, Zap, Award, Users, TrendingUp, 
  ChevronRight, Star, Lock, Truck, Heart, BookOpen, Play, FileText, Globe,
  MapPin, Phone, Mail, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getLearningContent, getAdsByPosition } from '../services/api';
import axios from 'axios';

// ✅ YOUR CUSTOM HERO IMAGES (Portrait)
const HERO_IMAGES = [
  "https://i.ibb.co/YBqJhfSL/Whats-App-Image-2026-02-09-at-13-24-24-3.jpg",
  "https://i.ibb.co/qFk8JzHr/Whats-App-Image-2026-02-09-at-13-24-24.jpg",
  "https://i.ibb.co/DPM2Y80S/Whats-App-Image-2026-02-09-at-13-24-22.jpg",
  "https://i.ibb.co/vp0rM9r/Whats-App-Image-2026-02-09-at-13-24-24-1.jpg",
  "https://i.ibb.co/4nKP0ng8/Whats-App-Image-2026-02-09-at-13-24-24-2.jpg",
];

// ✅ GEM DECORATION IMAGES
const GEM_IMAGES = [
  "https://i.ibb.co/SXZTQgJK/j-23805292-1723881560466-bg-processed.webp",
  "https://i.ibb.co/Mx0nHdZB/images.jpg",
  "https://i.ibb.co/8gc2Rf9B/j-15102652-1647478766623-bg-processed.jpg",
  "https://i.ibb.co/V0hK9M1y/OIP-1.jpg",
  "https://i.ibb.co/ZRdHsCRG/Blue-Diamond-PNG-High-Quality-Image.png",
  "https://i.ibb.co/Q7TSrdZK/Gems-Transparent-PNG.png",
  "https://i.ibb.co/RkDK69Mt/purepng-com-ruby-stone-gemrubyblood-redgemstonemineral-corundumgemsapphires-1701528980060xsfsh.png",
  "https://i.ibb.co/210sWL02/71-Jj48bmov-L-AC-UY1000.jpg",
  "https://i.ibb.co/PG0hbg0S/download.jpg",
];

// ✅ LOGO
const LOGO_URL = "https://i.ibb.co/Dg8D79MZ/530264761-1250374496883408-2925462561789423622-n.jpg";

// ✅ GOOGLE MAPS LOCATION
const MAPS_EMBED_URL = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d123.45!2d80.2607901!3d6.8542756!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae3afd8a7236d7d%3A0xfdfbd9db9d6d0fc5!2sGem%20and%20Jewellery%20Authority!5e0!3m2!1sen!2slk!4v1714000000000!5m2!1sen!2slk";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// HomeAdBanner — Premium auto-sliding ad banner with "Sponsored" tag
// Props: ads[], resolveImage(url), variant ('top' | 'bottom')
// ═══════════════════════════════════════════════════════════════════════════════
function HomeAdBanner({ ads, resolveImage, variant }) {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (ads.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIdx(prev => (prev + 1) % ads.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [ads.length]);

  if (!ads || ads.length === 0) return null;

  const isTop = variant === 'top';
  const sectionBg = isTop
    ? 'bg-gradient-to-b from-slate-900 via-slate-800 to-white'
    : 'bg-gradient-to-b from-blue-500 via-slate-800 to-slate-900';

  return (
    <section className={`relative py-10 ${sectionBg} overflow-hidden`}>
      <div className="max-w-6xl mx-auto px-6">
        {/* Single ad or carousel */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {ads.map((ad, idx) =>
              idx === activeIdx ? (
                <motion.a
                  key={ad._id || idx}
                  href={ad.link_url || '#'}
                  target={ad.link_url ? '_blank' : '_self'}
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="block relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 group cursor-pointer"
                  style={{ minHeight: '180px' }}
                >
                  {/* Ad Image */}
                  <img
                    src={resolveImage(ad.image_url)}
                    alt={ad.title || 'Advertisement'}
                    className="w-full h-48 md:h-64 lg:h-72 object-cover group-hover:scale-[1.03] transition-transform duration-700"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />

                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                  {/* Sponsored badge */}
                  <div className="absolute top-3 right-3 z-10">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-md border border-white/20 text-[10px] font-bold uppercase tracking-widest text-white/80">
                      <Sparkles size={10} className="text-amber-300" />
                      Sponsored
                    </span>
                  </div>

                  {/* Title overlay */}
                  {ad.title && (
                    <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                      <h3 className="text-lg md:text-xl font-black text-white drop-shadow-lg tracking-tight">
                        {ad.title}
                      </h3>
                    </div>
                  )}
                </motion.a>
              ) : null
            )}
          </AnimatePresence>

          {/* Slide indicators (only if multiple ads) */}
          {ads.length > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {ads.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIdx(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i === activeIdx
                      ? 'bg-blue-400 w-6'
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [learningContent, setLearningContent] = useState([]);
  const [loadingLearning, setLoadingLearning] = useState(true);
  const [homeTopAds, setHomeTopAds] = useState([]);
  const [homeBottomAds, setHomeBottomAds] = useState([]);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchLearning = async () => {
      try {
        setLoadingLearning(true);
        const data = await getLearningContent();
        setLearningContent(data.slice(0, 3));
      } catch (error) {
        console.error('Error fetching learning content:', error);
      } finally {
        setLoadingLearning(false);
      }
    };
    fetchLearning();
  }, []);

  // ── Fetch Home Ads ──────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchAds = async () => {
      try {
        const [topRes, bottomRes] = await Promise.all([
          getAdsByPosition('Home_Top'),
          getAdsByPosition('Home_Bottom'),
        ]);
        setHomeTopAds(Array.isArray(topRes) ? topRes : []);
        setHomeBottomAds(Array.isArray(bottomRes) ? bottomRes : []);
      } catch (err) {
        console.error('Error fetching home ads:', err);
      }
    };
    fetchAds();
  }, []);

  // Helper: resolve ad image URL (handles relative paths from multer uploads)
  const resolveAdImage = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${API_BASE}/${url}`;
  };

  const handleNavigate = (path) => navigate(path);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">

      {/* ═══════════════════════════════════════════════
          HERO SECTION — Portrait-balanced slideshow
      ═══════════════════════════════════════════════ */}
      <section className="relative pt-24 min-h-screen w-full bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 overflow-hidden flex items-center justify-center">

        {/* Slideshow Background — portrait images centered/cropped */}
        <AnimatePresence mode="sync">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {/* Side gradient panels to fill landscape space behind portrait */}
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)`,
              }}
            />
            {/* Blurred full background */}
            <img
              src={HERO_IMAGES[currentSlide]}
              alt="Pinnawala Gems"
              className="absolute inset-0 w-full h-full object-cover opacity-30 scale-110 blur-md"
            />
            {/* Sharp portrait centered */}
            <img
              src={HERO_IMAGES[currentSlide]}
              alt="Pinnawala Gems"
              className="relative z-10 h-full max-h-screen object-contain object-center drop-shadow-2xl"
              style={{ maxWidth: '55%' }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/20 to-slate-900/90 z-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/60 z-20" />

        {/* Hero Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-30 max-w-6xl mx-auto px-6 text-center"
        >
          {/* Logo */}
          <motion.div variants={itemVariants} className="flex justify-center mb-6">
            <img
              src={LOGO_URL}
              alt="Pinnawala Gems Logo"
              className="w-20 h-20 rounded-full object-cover ring-4 ring-blue-400/50 shadow-2xl shadow-blue-600/30"
            />
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6"
          >
            <Star size={16} className="text-amber-300 fill-amber-300" />
            <span className="text-xs font-bold tracking-widest text-white uppercase">Discover Premium Gemstones</span>
          </motion.div>

       <motion.h1
  variants={itemVariants}
  className="text-5xl md:text-7xl lg:text-8xl font-black text-[#FFDF00] tracking-tighter leading-[1.1] mb-4 drop-shadow-2xl"
>
  Pinnawala Gems
</motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-base md:text-lg text-blue-100 max-w-xl mx-auto mb-10 font-medium drop-shadow-lg"
          >
            Authentic gemstones, expert certification, and direct access to the world's finest jewelry collections. Buy, sell, and trade with confidence.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 flex-wrap"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleNavigate('/marketplace')}
              className="px-8 py-4 bg-blue-600 text-white rounded-full font-bold text-lg shadow-2xl shadow-blue-600/40 hover:bg-blue-500 transition-all flex items-center gap-2"
            >
              <ShoppingBag size={20} /> Browse Marketplace
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleNavigate('/ai-engine')}
              className="px-8 py-4 bg-purple-600 text-white rounded-full font-bold text-lg shadow-2xl shadow-purple-600/40 hover:bg-purple-500 transition-all flex items-center gap-2"
            >
              <Zap size={20} /> AI Valuation Engine
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleNavigate('/register')}
              className="px-8 py-4 bg-white/20 text-white rounded-full font-bold text-lg border border-white/30 backdrop-blur-md hover:bg-white/30 transition-all flex items-center gap-2"
            >
              <Users size={20} /> Join Us
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-30">
          {HERO_IMAGES.map((_, i) => (
            <motion.button
              key={i}
              onClick={() => setCurrentSlide(i)}
              animate={{ scale: i === currentSlide ? 1.3 : 1, opacity: i === currentSlide ? 1 : 0.5 }}
              className={`w-2.5 h-2.5 rounded-full transition-all ${i === currentSlide ? 'bg-blue-400' : 'bg-white/40'}`}
            />
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          HOME TOP ADS — Between Hero and Features
      ═══════════════════════════════════════════════ */}
      {homeTopAds.length > 0 && (
        <HomeAdBanner ads={homeTopAds} resolveImage={resolveAdImage} variant="top" />
      )}

      {/* ═══════════════════════════════════════════════
          FEATURES SECTION + gem image boxes
      ═══════════════════════════════════════════════ */}
      <section className="relative py-24 bg-white overflow-hidden">
        {/* Floating gem decorations */}
        <motion.img
          src={GEM_IMAGES[4]}
          alt=""
          animate={{ y: [0, -14, 0], rotate: [0, 8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-8 right-8 w-28 opacity-20 pointer-events-none select-none"
        />
        <motion.img
          src={GEM_IMAGES[6]}
          alt=""
          animate={{ y: [0, 10, 0], rotate: [0, -6, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-4 left-4 w-24 opacity-15 pointer-events-none select-none"
        />

        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
              Why Choose Pinnawala?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Experience the finest gemstone marketplace with certified authentication, expert guidance, and secure transactions.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {[
              { icon: Lock, title: "Certified Authentication", desc: "NGJA certified gemstones with verified documentation" },
              { icon: Award, title: "Expert Verification", desc: "Every gem verified by professional gemologists" },
              { icon: Truck, title: "Secure Shipping", desc: "Insured worldwide delivery with tracking" },
              { icon: TrendingUp, title: "Fair Pricing", desc: "Market-competitive prices with transparent valuations" },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-slate-50 border border-slate-200 hover:shadow-xl transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center mb-4">
                    <Icon size={24} className="text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600 text-sm">{feature.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          MARKETPLACE PREVIEW + gem image grid
      ═══════════════════════════════════════════════ */}
      <section className="relative py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            {/* Text */}
            <div>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
                  Explore Rare Gemstones
                </h2>
                <p className="text-lg text-slate-600 mb-8">
                  Browse our curated collection of authentic gemstones from verified sellers worldwide. From classic rubies to rare emeralds, discover your next treasure.
                </p>
                <ul className="space-y-4 mb-8">
                  {[
                    "Search by gem type, color, and origin",
                    "Real-time price comparisons",
                    "Direct communication with sellers",
                    "Secure bidding and negotiation system",
                  ].map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1, duration: 0.6 }}
                      viewport={{ once: true }}
                      className="flex items-center gap-3 text-slate-700 font-medium"
                    >
                      <ChevronRight size={20} className="text-blue-600 flex-shrink-0" />
                      {item}
                    </motion.li>
                  ))}
                </ul>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleNavigate('/marketplace')}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-full font-bold shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition-all"
                >
                  Explore Marketplace <ChevronRight size={20} />
                </motion.button>
              </motion.div>
            </div>

            {/* Gem Image Grid */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              {[GEM_IMAGES[0], GEM_IMAGES[1], GEM_IMAGES[2], GEM_IMAGES[3]].map((src, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.06, rotate: i % 2 === 0 ? 1 : -1 }}
                  className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200 shadow-lg border border-blue-100"
                >
                  <img
                    src={src}
                    alt="Gemstone"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentNode.style.background = 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          ABOUT US SECTION
      ═══════════════════════════════════════════════ */}
      <section className="relative py-24 bg-gradient-to-b from-slate-900 to-blue-950 text-white overflow-hidden">
        {/* Decorative gems */}
        <motion.img
          src={GEM_IMAGES[5]}
          alt=""
          animate={{ y: [0, -16, 0], rotate: [0, 12, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-10 right-10 w-32 opacity-20 pointer-events-none select-none"
        />
        <motion.img
          src={GEM_IMAGES[7]}
          alt=""
          animate={{ y: [0, 12, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-10 left-6 w-28 opacity-15 pointer-events-none select-none"
        />

        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center"
          >
            {/* Logo + gem showcase */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="flex flex-col items-center gap-8"
            >
              {/* Logo */}
              <div className="relative">
                <div className="w-40 h-40 rounded-full overflow-hidden ring-4 ring-blue-400/60 shadow-2xl shadow-blue-600/50">
                  <img src={LOGO_URL} alt="Pinnawala Gems" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center shadow-lg">
                  <Star size={20} className="text-amber-900 fill-amber-900" />
                </div>
              </div>

              {/* Featured gem images */}
              <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
                {[GEM_IMAGES[4], GEM_IMAGES[5], GEM_IMAGES[6]].map((src, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.1, y: -4 }}
                    className="aspect-square rounded-xl overflow-hidden bg-blue-800/50 border border-blue-700/50 shadow-lg"
                  >
                    <img
                      src={src}
                      alt="Gem"
                      className="w-full h-full object-contain p-1"
                      onError={(e) => { e.target.style.opacity = 0; }}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* About text */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-700/60 border border-blue-500/40 mb-6">
                <Sparkles size={14} className="text-amber-300" />
                <span className="text-xs font-bold tracking-widest text-blue-200 uppercase">About Us</span>
              </div>

              <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight leading-tight text-[#FFDF00]">
  Pinnawala Gems & Lapidary
</h2>

              <p className="text-blue-100 text-lg mb-6 leading-relaxed font-medium">
                Located in the heart of Eheliyagoda — Sri Lanka's renowned gem belt — Pinnawala Gems & Lapidary is a trusted name in certified natural gemstones, expert gem cutting, and fine jewelry.
              </p>

              <p className="text-blue-200 text-base mb-8 leading-relaxed">
                We specialize in ethically sourced precious and semi-precious stones including sapphires, rubies, alexandrites, and rare chrysoberyls. Our master lapidaries use a blend of traditional Sri Lankan techniques and modern precision equipment to deliver internationally certified, world-class gems.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { label: "NGJA Certified", value: "All Gemstones" },
                  { label: "Experience", value: "Decades in Trade" },
                  { label: "Speciality", value: "Lapidary & Cutting" },
                  { label: "Location", value: "Eheliyagoda, LK" },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-blue-800/40 rounded-xl p-4 border border-blue-700/40"
                  >
                    <div className="text-blue-300 text-xs font-bold uppercase tracking-wider mb-1">{stat.label}</div>
                    <div className="text-white font-black text-sm">{stat.value}</div>
                  </motion.div>
                ))}
              </div>

              {/* Contact info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-blue-200 text-sm">
                  <MapPin size={16} className="text-blue-400 flex-shrink-0" />
                  <span>Gem and Jewellery Authority, Eheliyagoda, Sri Lanka</span>
                </div>
                <div className="flex items-center gap-3 text-blue-200 text-sm">
                  <Globe size={16} className="text-blue-400 flex-shrink-0" />
                  <span>Serving buyers and sellers worldwide</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          GOOGLE MAPS LOCATION
      ═══════════════════════════════════════════════ */}
      <section className="relative py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 mb-4">
              <MapPin size={16} className="text-emerald-600" />
              <span className="text-xs font-bold tracking-widest text-emerald-700 uppercase">Visit Us</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 tracking-tight">Find Us in Eheliyagoda</h2>
            <p className="text-slate-600 font-medium">Gem and Jewellery Authority, Eheliyagoda, Sri Lanka</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="rounded-3xl overflow-hidden shadow-2xl shadow-slate-200 border border-slate-200"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126.0!2d80.2607901!3d6.8542756!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae3afd8a7236d7d%3A0xfdfbd9db9d6d0fc5!2sGem%20and%20Jewellery%20Authority!5e0!3m2!1sen!2slk!4v1714000000001!5m2!1sen!2slk"
              width="100%"
              height="420"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Pinnawala Gems Location"
            />
          </motion.div>

          {/* Direction button */}
          <div className="flex justify-center mt-6">
            <motion.a
              href="https://www.google.com/maps/place/Gem+and+Jewellery+Authority/@6.8544437,80.2608405,21z"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-full font-bold shadow-md hover:bg-emerald-500 transition-all text-sm"
            >
              <MapPin size={16} /> Get Directions on Google Maps
            </motion.a>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          LEARNING HUB SECTION
      ═══════════════════════════════════════════════ */}
      <section className="relative py-24 bg-gradient-to-b from-white via-blue-50/40 to-white">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 mb-6">
              <BookOpen size={16} className="text-blue-600" />
              <span className="text-xs font-bold tracking-widest text-blue-700 uppercase">Learning Hub</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
              Expand Your Gemstone Knowledge
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Learn from industry experts. Explore tutorials, market insights, and gemology fundamentals to make informed decisions.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
          >
            {loadingLearning ? (
              <div className="col-span-full flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <p className="text-slate-600 font-medium">Loading content...</p>
                </div>
              </div>
            ) : learningContent.length > 0 ? (
              learningContent.map((item, idx) => {
                const TypeIcon = item.content_type === 'video' ? Play : item.content_type === 'pdf' ? FileText : Globe;
                const typeColor = item.content_type === 'video' ? 'text-blue-600 bg-blue-50' :
                  item.content_type === 'pdf' ? 'text-rose-600 bg-rose-50' : 'text-emerald-600 bg-emerald-50';

                return (
                  <motion.div
                    key={item.id || idx}
                    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { delay: idx * 0.1, duration: 0.6 } } }}
                    whileHover={{ y: -8, transition: { duration: 0.3 } }}
                    onClick={() => navigate('/learning-hub')}
                    className="group cursor-pointer"
                  >
                    <div className="h-full bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-xl hover:shadow-blue-100 transition-all duration-300">
                      <div className="relative h-40 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                        {item.thumbnail_url ? (
                          <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <TypeIcon size={48} className="text-slate-300" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 to-transparent" />
                        <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider ${typeColor} backdrop-blur-sm`}>
                          <TypeIcon size={12} /> {item.content_type}
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="mb-3">
                          <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">{item.category}</span>
                        </div>
                        <h3 className="font-black text-slate-900 text-base mb-2 line-clamp-2 group-hover:text-blue-700 transition-colors">{item.title}</h3>
                        <p className="text-slate-600 text-sm font-medium leading-relaxed line-clamp-2 mb-4">{item.description}</p>
                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-500">{item.author?.full_name || 'Pinnawala Gems'}</span>
                          <div className="flex items-center gap-1 text-blue-700 group-hover:text-blue-900 transition-colors font-bold text-xs">
                            Learn More <ChevronRight size={14} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="col-span-full">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-slate-50 p-12 text-center shadow-sm"
                >
                  <div className="absolute -top-8 -left-8 w-40 h-40 bg-blue-100 rounded-full blur-3xl opacity-60 pointer-events-none" />
                  <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-indigo-100 rounded-full blur-3xl opacity-60 pointer-events-none" />
                  <div className="relative z-10 flex flex-col items-center gap-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30">
                      <BookOpen size={36} className="text-white" strokeWidth={1.5} />
                    </div>
                    <div>
                      <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest mb-3">Coming Soon</span>
                      <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Expert Content Is On The Way</h3>
                      <p className="text-slate-600 font-medium max-w-md mx-auto leading-relaxed">
                        Our team of gemologists is preparing in-depth tutorials, market insights, and certification guides. Check back soon!
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => navigate('/learning-hub')}
                      className="mt-2 inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-blue-500 transition-all"
                    >
                      <BookOpen size={16} /> Visit Learning Hub
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/learning-hub')}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full font-bold shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transition-all"
            >
              <BookOpen size={20} /> Explore Full Learning Hub <ChevronRight size={20} />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SELLING SECTION + gem images
      ═══════════════════════════════════════════════ */}
      <section className="relative py-24 bg-white overflow-hidden">
        <motion.img
          src={GEM_IMAGES[8]}
          alt=""
          animate={{ y: [0, -10, 0], rotate: [0, 6, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-8 left-8 w-24 opacity-10 pointer-events-none select-none"
        />

        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            {/* Gem Image Grid */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4 order-2 lg:order-1"
            >
              {[GEM_IMAGES[5], GEM_IMAGES[6], GEM_IMAGES[7], GEM_IMAGES[8]].map((src, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.06, rotate: i % 2 === 0 ? -1 : 1 }}
                  className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-50 to-emerald-100 shadow-lg border border-emerald-100"
                >
                  <img
                    src={src}
                    alt="Gemstone"
                    className="w-full h-full object-contain p-2"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentNode.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Text */}
            <div className="order-1 lg:order-2">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
                  Sell Your Gemstones
                </h2>
                <p className="text-lg text-slate-600 mb-8">
                  Reach qualified buyers worldwide. List your gems with professional photography, detailed specifications, and set your own pricing.
                </p>
                <ul className="space-y-4 mb-8">
                  {[
                    "Simple 3-step listing process",
                    "Professional authentication support",
                    "Secure payment handling",
                    "Negotiate with interested buyers",
                  ].map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1, duration: 0.6 }}
                      viewport={{ once: true }}
                      className="flex items-center gap-3 text-slate-700 font-medium"
                    >
                      <ChevronRight size={20} className="text-emerald-600 flex-shrink-0" />
                      {item}
                    </motion.li>
                  ))}
                </ul>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleNavigate('/seller-register')}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white rounded-full font-bold shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition-all"
                >
                  Start Selling <ChevronRight size={20} />
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          CTA SECTION
      ═══════════════════════════════════════════════ */}
      <section className="relative py-32 bg-gradient-to-r from-blue-600 to-blue-500 text-white overflow-hidden">
        {/* Floating gem decorations in CTA */}
        <motion.img
          src={GEM_IMAGES[4]}
          alt=""
          animate={{ y: [0, -20, 0], x: [0, 10, 0], rotate: [0, 15, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-8 right-16 w-20 opacity-20 pointer-events-none select-none"
        />
        <motion.img
          src={GEM_IMAGES[2]}
          alt=""
          animate={{ y: [0, 14, 0], rotate: [0, -12, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          className="absolute bottom-8 left-12 w-16 opacity-15 pointer-events-none select-none"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto px-6 text-center relative z-10"
        >
          {/* Logo in CTA */}
          <div className="flex justify-center mb-6">
            <img
              src={LOGO_URL}
              alt="Pinnawala Gems"
              className="w-16 h-16 rounded-full object-cover ring-4 ring-white/40 shadow-xl"
            />
          </div>

          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
            Ready to Find Your Perfect Gem?
          </h2>
          <p className="text-xl text-blue-50 mb-10 font-medium">
            Join thousands of collectors and traders in the world's most trusted gemstone marketplace.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleNavigate('/register')}
              className="px-8 py-4 bg-white text-blue-600 rounded-full font-bold text-lg shadow-2xl hover:bg-blue-50 transition-all"
            >
              Get Started Today
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleNavigate('/marketplace')}
              className="px-8 py-4 border-2 border-white text-white rounded-full font-bold text-lg hover:bg-white/10 transition-all"
            >
              Browse Now
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════
          HOME BOTTOM ADS — Between CTA and Footer
      ═══════════════════════════════════════════════ */}
      {homeBottomAds.length > 0 && (
        <HomeAdBanner ads={homeBottomAds} resolveImage={resolveAdImage} variant="bottom" />
      )}

      {/* ═══════════════════════════════════════════════
          FOOTER with logo
      ═══════════════════════════════════════════════ */}
      <footer className="bg-slate-900 text-slate-400 py-14 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col items-center gap-6 text-center">
            {/* Logo */}
            <img
              src={LOGO_URL}
              alt="Pinnawala Gems"
              className="w-14 h-14 rounded-full object-cover ring-2 ring-slate-700 opacity-90"
            />
            <div>
              <p className="text-white font-black text-lg mb-1">Pinnawala Gems & Lapidary</p>
              <p className="text-slate-500 text-sm">Gem and Jewellery Authority, Eheliyagoda, Sri Lanka</p>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-500">
              <span className="flex items-center gap-1.5"><Star size={12} className="text-amber-400" /> NGJA Certified</span>
              <span className="flex items-center gap-1.5"><Lock size={12} className="text-blue-400" /> Secure Transactions</span>
              <span className="flex items-center gap-1.5"><Award size={12} className="text-emerald-400" /> Expert Authentication</span>
            </div>
            <p className="text-slate-600 text-xs">© 2026 Pinnawala Gems & Lapidary. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}