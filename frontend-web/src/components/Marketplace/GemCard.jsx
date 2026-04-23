import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Store, Award, ChevronRight } from 'lucide-react';

export default function GemCard({ gem, onClick, isExclusive }) {
  const isCompanyGem = gem?.seller_type === 'Company' || isExclusive;
  
  return (
    <motion.div
      variants={{
        hidden:  { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-[24px] p-4 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_35px_rgba(0,0,0,0.08)] transition-all duration-300 cursor-pointer flex flex-col group"
      onClick={() => onClick && onClick(gem)}
    >
      {/* Image Container - Clean Light Grey Background like the reference */}
      <div className="w-full aspect-square bg-slate-50/80 rounded-2xl p-4 mb-5 relative flex items-center justify-center overflow-hidden border border-slate-100">
        
        {/* Badges - Minimalized so they don't clutter the image */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {isCompanyGem && (
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[8px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1">
              <ShieldCheck size={10} /> Official
            </span>
          )}
          {gem?.ngja_cert && (
            <span className="bg-slate-900 text-emerald-400 text-[8px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1">
              <Award size={10} /> Certified
            </span>
          )}
        </div>

        {/* Carat Weight Badge */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <span className="bg-white/90 backdrop-blur text-slate-800 text-[9px] font-black px-2 py-1 rounded-md shadow-sm border border-slate-100">
            {gem?.weight_carats || '0'} CT
          </span>
        </div>

        {gem?.image_url ? (
          <img
            src={gem.image_url} 
            alt={gem?.name || 'Gemstone'}
            className="w-[85%] h-[85%] object-contain group-hover:scale-110 transition-transform duration-500 ease-out drop-shadow-xl"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-slate-200" />
        )}
      </div>

      {/* Text Content - Centered and Clean Typography */}
      <div className="text-center px-2 flex-1 flex flex-col">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1.5">
          {gem?.gem_type || 'Gemstone'} • {gem?.color || 'Mixed'}
        </p>
        
        <h3 className="text-[15px] font-black text-slate-800 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
          {gem?.name || 'Unnamed Gem'}
        </h3>
        
        <p className="text-[17px] font-extrabold text-slate-900 mt-auto mb-4 tracking-tight">
          LKR {gem?.base_price ? gem.base_price.toLocaleString() : 'N/A'}
        </p>

        {/* Pill Button - Like the reference image's "Send Offer" button */}
        <button className="w-full py-2.5 rounded-full bg-slate-900 text-white text-[11px] font-bold uppercase tracking-widest hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-600/30 transition-all duration-300 flex items-center justify-center gap-1.5 mt-auto">
          View Details <ChevronRight size={14} strokeWidth={2.5} />
        </button>
      </div>
    </motion.div>
  );
}