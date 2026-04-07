import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getGemstones, getActiveAds, getSellerDirectory } from '../../services/api';
import { 
  Search, SlidersHorizontal, ArrowRight, Filter, X, ChevronDown,
  Diamond, ShieldCheck, Store, Star, Heart, Zap, ArrowLeft, 
  Gavel, Award, BadgeCheck, Sparkles, ChevronRight
} from 'lucide-react';

// Sub-components
import GemDetailModal from './GemDetailModal';
import SkeletonCard from './SkeletonCard';
import GemCard from './GemCard';
import FilterPanel from './FilterPanel';
import AdBanner from './AdBanner';
import ShopDirectoryFooter from './ShopDirectoryFooter';

export default function Marketplace() {
  const navigate = useNavigate();
  const [gems, setGems]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [ads, setAds]                 = useState([]);
  const [selected, setSelected]       = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch]           = useState('');
  const [filters, setFilters]         = useState({
    gem_type: '', color: '', listing_type: '',
    min_price: '', max_price: '', min_carats: '', max_carats: ''
  });
  const [sellers, setSellers]         = useState([]);

  useEffect(() => {
    Promise.all([getGemstones(), getActiveAds(), getSellerDirectory()])
      .then(([gemData, adData, sellerData]) => {
        setGems(gemData);
        setAds(adData);
        setSellers(sellerData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const gemTypes  = useMemo(() => [...new Set(gems.map(g => g.gem_type))], [gems]);
  const colors    = useMemo(() => [...new Set(gems.map(g => g.color))],    [gems]);

  const filtered = useMemo(() => {
    return gems.filter(g => {
      const q = search.toLowerCase();
      if (q && !g.name.toLowerCase().includes(q) && !g.gem_type.toLowerCase().includes(q)) return false;
      if (filters.gem_type     && g.gem_type     !== filters.gem_type)     return false;
      if (filters.color        && g.color        !== filters.color)        return false;
      if (filters.listing_type && g.listing_type !== filters.listing_type) return false;
      if (filters.min_price    && g.base_price   < Number(filters.min_price))   return false;
      if (filters.max_price    && g.base_price   > Number(filters.max_price))   return false;
      if (filters.min_carats   && g.weight_carats < Number(filters.min_carats)) return false;
      if (filters.max_carats   && g.weight_carats > Number(filters.max_carats)) return false;
      return true;
    });
  }, [gems, search, filters]);

  const categorizedGems = useMemo(() => {
    const pinnawalaExclusive = filtered.filter(g => g.seller_type === 'Company' || g.isCompanyOwned === true);
    const communityMarketplace = filtered.filter(g => g.seller_type !== 'Company' && g.isCompanyOwned !== true);
    
    // PRIORITY: Negotiable items first within Exclusive
    // Aggressive check — covers every field-name / value variant the backend may return
    const isGemNegotiable = (g) =>
      g.is_negotiable === true  ||
      g.is_negotiable === 'true' ||
      g.isNegotiable  === true  ||
      g.listing_type  === 'Negotiable' ||
      g.listing_type  === 'negotiable' ||
      g.listingType   === 'Negotiable';
    const negotiable = pinnawalaExclusive.filter(isGemNegotiable);
    const directSale = pinnawalaExclusive.filter(g => !isGemNegotiable(g));
    
    return {
      pinnawalaExclusive: { negotiable, directSale },
      communityMarketplace
    };
  }, [filtered]);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const setFilter = (k, v) => setFilters(f => ({ ...f, [k]: v }));
  const clearFilters = () => {
    setFilters({ gem_type: '', color: '', listing_type: '', min_price: '', max_price: '', min_carats: '', max_carats: '' });
    setSearch('');
  };

  // Animation variants
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* --- PREMIUM HEADER --- */}
      <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-40 border-b border-slate-200/60 shadow-sm">
        <div className="max-w-[1536px] mx-auto px-6 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <button 
              onClick={() => navigate('/home')} 
              className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-all active:scale-95"
            >
              <ArrowLeft size={20} strokeWidth={2.5} />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Pinnawala Gems</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  {loading ? 'Loading...' : `${filtered.length} Rare Finds`}
                </span>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg relative group">
            <Search size={18} strokeWidth={2.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search gems, origins, or types..."
              className="w-full pl-12 pr-6 py-2.5 bg-slate-100/70 border border-slate-200 rounded-full text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all outline-none text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all border ${
                showFilters || activeFilterCount > 0 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20' 
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal size={18} strokeWidth={2.5} />
              <span className="hidden md:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-white text-blue-600 text-[10px] font-black rounded-md px-1.5 py-0.5 ml-1">
                  {activeFilterCount}
                </span>
              )}
            </button>
            
            {localStorage.getItem('token') && (
              <button 
                onClick={() => {
                  const role = localStorage.getItem('role');
                  if (role === 'admin') navigate('/admin');
                  else if (role === 'seller') navigate('/seller');
                  else navigate('/buyer');
                }}
                className="hidden lg:flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-full font-bold text-sm shadow-md hover:bg-slate-800 transition-all active:scale-95"
              >
                My Dashboard
              </button>
            )}
          </div>
        </div>
        
        {/* Filter Panel */}
        <FilterPanel 
          showFilters={showFilters} 
          filters={filters} 
          setFilter={setFilter} 
          clearFilters={clearFilters} 
          gemTypes={gemTypes} 
          colors={colors} 
          activeFilterCount={activeFilterCount} 
        />
      </header>

      {/* --- HERO BANNER --- */}
      {!loading && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="max-w-[1536px] mx-auto px-6 mt-8"
        >
          <AdBanner ads={ads} onShopNow={(id) => setSelected(gems.find(g => g._id === id))} />
        </motion.div>
      )}

      {/* --- MAIN GRID --- */}
      <main className="max-w-[1536px] mx-auto px-6 py-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[1,2,3,4,5,6,7,8,9,10].map(n => <SkeletonCard key={n} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-20 h-20 bg-white border border-slate-200 rounded-3xl shadow-sm flex items-center justify-center mb-6">
              <Diamond size={32} strokeWidth={1.5} className="text-slate-300" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">No Matches Found</h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-8 font-medium">
              We couldn't find any gems matching your current criteria. Try adjusting your filters.
            </p>
            <button 
              onClick={clearFilters} 
              className="px-8 py-3.5 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition-all shadow-md"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="space-y-20">
            
            {/* --- PINNAWALA EXCLUSIVE SECTION --- */}
            {(categorizedGems.pinnawalaExclusive.negotiable.length > 0 || categorizedGems.pinnawalaExclusive.directSale.length > 0) && (
              <motion.div variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                
                {/* 1. NEGOTIABLE ITEMS (PRIORITY) */}
                {categorizedGems.pinnawalaExclusive.negotiable.length > 0 && (
                  <div className="mb-14">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-6">
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        Pinnawala Exclusive <span className="text-sm font-bold text-amber-500 bg-amber-50 px-3 py-1 rounded-full border border-amber-100 uppercase tracking-widest">Negotiable</span>
                      </h2>
                      <button className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
                        View All <ChevronRight size={16} />
                      </button>
                    </div>
                    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                      {categorizedGems.pinnawalaExclusive.negotiable.map(gem => (
                        <GemCard key={gem._id} gem={gem} onClick={setSelected} isExclusive />
                      ))}
                    </motion.div>
                  </div>
                )}

                {/* 2. DIRECT SALE ITEMS */}
                {categorizedGems.pinnawalaExclusive.directSale.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-6">
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        Pinnawala Exclusive <span className="text-sm font-bold text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 uppercase tracking-widest">Direct Sale</span>
                      </h2>
                      <button className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
                        View All <ChevronRight size={16} />
                      </button>
                    </div>
                    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                      {categorizedGems.pinnawalaExclusive.directSale.map(gem => (
                        <GemCard key={gem._id} gem={gem} onClick={setSelected} isExclusive />
                      ))}
                    </motion.div>
                  </div>
                )}
              </motion.div>
            )}

            {/* --- COMMUNITY MARKETPLACE SECTION --- */}
            {categorizedGems.communityMarketplace.length > 0 && (
              <motion.div 
                variants={sectionVariants} 
                initial="hidden" 
                whileInView="visible" 
                viewport={{ once: true }}
                className="mt-16"
              >
                <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-6">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                      Community Listings
                    </h2>
                    <span className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 uppercase tracking-widest">Verified Sellers</span>
                  </div>
                  <button className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
                    View All <ChevronRight size={16} />
                  </button>
                </div>
                
                <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {categorizedGems.communityMarketplace.map(gem => (
                    <GemCard key={gem._id} gem={gem} onClick={setSelected} />
                  ))}
                </motion.div>
              </motion.div>
            )}
          </div>
        )}
      </main>

      {/* --- MODAL OVERLAY --- */}
      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <div className="relative w-full flex justify-center z-10">
              <GemDetailModal gem={selected} onClose={() => setSelected(null)} />
            </div>
          </div>
        )}
      </AnimatePresence>
      
      {/* --- FOOTER --- */}
      <ShopDirectoryFooter sellers={sellers} />
    </div>
  );
}