import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function FilterPanel({
  showFilters,
  filters,
  setFilter,
  clearFilters,
  gemTypes,
  colors,
  activeFilterCount
}) {
  return (
    <AnimatePresence>
      {showFilters && (
        <motion.div
          initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
          className="overflow-hidden border-t border-slate-100 bg-slate-50/80"
        >
          <div className="max-w-screen-xl mx-auto px-6 py-5 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {/* Gem Type */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Type</label>
              <select value={filters.gem_type} onChange={e => setFilter('gem_type', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40">
                <option value="">All</option>
                {gemTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            {/* Color */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Color</label>
              <select value={filters.color} onChange={e => setFilter('color', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40">
                <option value="">All</option>
                {colors.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {/* Listing Type */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Listing</label>
              <select value={filters.listing_type} onChange={e => setFilter('listing_type', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40">
                <option value="">All</option>
                <option value="Direct_Sale">Direct Sale</option>
                <option value="Auction">Auction</option>
              </select>
            </div>
            {/* Price Range */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Min Price (LKR)</label>
              <input type="number" placeholder="0" value={filters.min_price} onChange={e => setFilter('min_price', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Max Price (LKR)</label>
              <input type="number" placeholder="∞" value={filters.max_price} onChange={e => setFilter('max_price', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
            </div>
            {/* Carats */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Min CT</label>
              <input type="number" step="0.1" placeholder="0" value={filters.min_carats} onChange={e => setFilter('min_carats', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
            </div>
            <div className="flex flex-col justify-between">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Max CT</label>
                <input type="number" step="0.1" placeholder="∞" value={filters.max_carats} onChange={e => setFilter('max_carats', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
              </div>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="mt-2 text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1">
                  <X size={12} /> Clear All
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
