import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function AdBanner({ ads, onShopNow }) {
  const [currentAd, setCurrentAd] = useState(0);

  // Auto-scroll ads
  useEffect(() => {
    if (!ads || ads.length <= 1) return;
    const interval = setInterval(() => setCurrentAd(prev => (prev + 1) % ads.length), 5000);
    return () => clearInterval(interval);
  }, [ads]);

  if (!ads || ads.length === 0) return null;

  return (
    <div className="max-w-screen-xl mx-auto px-6 pt-8">
      <div className="relative h-48 md:h-64 lg:h-80 w-full overflow-hidden rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50">
        <AnimatePresence mode="wait">
          <motion.div
            key={ads[currentAd]._id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0"
          >
            <img src={ads[currentAd].image_url} alt={ads[currentAd].title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/60 via-slate-900/20 to-transparent flex flex-col justify-center px-10 md:px-16">
              <motion.span initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
                className="text-xs font-black text-blue-400 uppercase tracking-[0.2em] mb-2">Editor's Pick</motion.span>
              <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
                className="text-3xl md:text-5xl font-serif font-bold text-white mb-4 max-w-lg leading-tight">{ads[currentAd].title}</motion.h2>
              {ads[currentAd].target_gem_id && (
                <motion.button
                  initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
                  onClick={() => onShopNow(ads[currentAd].target_gem_id)}
                  className="w-fit px-8 py-3 bg-white text-slate-900 rounded-full font-bold text-sm hover:bg-blue-600 hover:text-white transition-all shadow-lg"
                >
                  Shop Now
                </motion.button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
        {/* Indicators */}
        {ads.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {ads.map((_, i) => (
              <button key={i} onClick={() => setCurrentAd(i)} className={`h-1.5 rounded-full transition-all ${i === currentAd ? 'w-8 bg-blue-500' : 'w-2 bg-white/40'}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
