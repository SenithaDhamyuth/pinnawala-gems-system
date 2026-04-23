import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Play, FileText, Globe, Search, Filter,
  Clock, ChevronRight, Sparkles, GraduationCap,
  TrendingUp, Video, X, ExternalLink, Star, Gem
} from 'lucide-react';
import axios from 'axios';
import { getImageUrl } from '../../utils/imageUtil';

const API = 'http://localhost:5001/api/learning';

const CATEGORIES = [
  { id: 'All',             label: 'All Topics',        icon: BookOpen,      color: 'from-blue-600 to-blue-700' },
  { id: 'Gemology',        label: 'Gemology',          icon: Gem,           color: 'from-blue-600 to-indigo-700' },
  { id: 'Market Trends',   label: 'Market Trends',     icon: TrendingUp,    color: 'from-emerald-600 to-teal-700' },
  { id: 'Tutorials',       label: 'Tutorials',         icon: Video,         color: 'from-violet-600 to-purple-700' },
  { id: 'Mining & Origin', label: 'Mining & Origin',   icon: Globe,         color: 'from-amber-600 to-orange-700' },
  { id: 'Certification',   label: 'Certification',     icon: GraduationCap, color: 'from-rose-600 to-pink-700' },
];

const TYPE_ICON = { video: Play, pdf: FileText, article: Globe };

const getYouTubeId = (url) => {
  if (!url) return null;
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([A-Za-z0-9_-]{11})/
  );
  return match ? match[1] : null;
};

const getYouTubeThumbnail = (url) => {
  const id = getYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : null;
};

function ContentModal({ item, onClose }) {
  const ytId = item.content_type === 'video' ? getYouTubeId(item.content_url) : null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 z-10"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors"
        >
          <X size={18} />
        </button>

        {ytId ? (
          <div className="relative" style={{ paddingTop: '56.25%' }}>
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`}
              title={item.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="h-64 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
            {item.thumbnail_url ? (
              <img src={getImageUrl(item.thumbnail_url)} alt={item.title} className="w-full h-full object-cover opacity-50" />
            ) : (
              <BookOpen size={48} className="text-slate-300" />
            )}
          </div>
        )}

        <div className="p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                  {item.category}
                </span>
                {item.duration && (
                  <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                    <Clock size={11} /> {item.duration}
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-3">{item.title}</h2>
              <p className="text-slate-600 font-medium leading-relaxed">{item.description}</p>
            </div>
          </div>

          {!ytId && (
            <a
              href={item.content_url}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
            >
              {item.content_type === 'pdf' ? 'Open PDF' : 'Read Article'}
              <ExternalLink size={15} />
            </a>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function ContentCard({ item, index, onClick }) {
  const TypeIcon = TYPE_ICON[item.content_type] || Play;
  const ytThumb  = item.content_type === 'video' ? getYouTubeThumbnail(item.content_url) : null;
  const thumb    = item.thumbnail_url || ytThumb;

  const TYPE_STYLES = {
    video:   'bg-blue-600 text-white',
    pdf:     'bg-rose-600 text-white',
    article: 'bg-emerald-600 text-white',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      onClick={onClick}
      className="group cursor-pointer"
    >
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-blue-200 hover:-translate-y-1.5 transition-all duration-300">
        <div className="relative h-44 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
          {thumb ? (
            <img
              src={getImageUrl(thumb)}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <TypeIcon size={40} className="text-slate-300" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-transparent" />

          <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${TYPE_STYLES[item.content_type] || TYPE_STYLES.video} backdrop-blur-sm`}>
            <TypeIcon size={11} />
            {item.content_type}
          </div>

          {item.content_type === 'video' && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-14 h-14 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50 shadow-xl">
                <Play size={22} className="text-white ml-1" fill="white" />
              </div>
            </div>
          )}

          {item.duration && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-lg">
              <Clock size={10} className="text-white/90" />
              <span className="text-[10px] font-bold text-white">{item.duration}</span>
            </div>
          )}
        </div>

        <div className="p-5">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="text-[9px] font-black uppercase tracking-widest text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
              {item.category}
            </span>
          </div>
          <h3 className="font-black text-slate-900 text-base leading-snug mb-2 group-hover:text-blue-700 transition-colors line-clamp-2">
            {item.title}
          </h3>
          <p className="text-slate-600 text-sm font-medium leading-relaxed line-clamp-2">
            {item.description}
          </p>

          <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500">
              {item.author?.full_name || 'Pinnawala Gems'}
            </span>
            <div className="flex items-center gap-1 text-blue-700 group-hover:text-blue-900 transition-colors font-bold text-xs">
              {item.content_type === 'video' ? 'Watch' : item.content_type === 'pdf' ? 'Read' : 'View'}
              <ChevronRight size={14} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function LearningHub() {
  const [content, setContent]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeType, setActiveType]     = useState('All');
  const [search, setSearch]             = useState('');
  const [searchInput, setSearchInput]   = useState('');
  const [selected, setSelected]         = useState(null);

  const fetchContent = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCategory !== 'All') params.set('category', activeCategory);
      if (activeType !== 'All')     params.set('content_type', activeType.toLowerCase());
      if (search)                   params.set('q', search);

      const res = await axios.get(`${API}?${params}`);
      setContent(res.data || []);
    } catch (err) {
      console.error('[LearningHub] fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, activeType, search]);

  useEffect(() => { fetchContent(); }, [fetchContent]);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const featured = content[0];
  const rest     = content.slice(1);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      
      <div className="relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-200 rounded-full mix-blend-multiply filter blur-[160px] opacity-15 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-100 rounded-full mix-blend-multiply filter blur-[140px] opacity-12 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 px-5 py-2 rounded-full mb-6">
              <Sparkles size={14} className="text-blue-700" />
              <span className="text-[11px] font-black uppercase tracking-widest text-blue-700">Learning Hub</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-black tracking-tight mb-5 leading-tight text-slate-900">
              Master the Art of
              <span className="block text-blue-700">
                Gemology
              </span>
            </h1>
            <p className="text-slate-600 text-lg font-medium max-w-2xl mx-auto leading-relaxed">
              Expert video lessons, comprehensive guides, and market insights to become a certified gemstone professional.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="max-w-xl mx-auto relative"
          >
            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search courses, topics, gemstones…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-12 pr-5 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 placeholder:text-slate-500 focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 outline-none transition shadow-sm"
            />
            {searchInput && (
              <button onClick={() => { setSearchInput(''); setSearch(''); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                <X size={16} />
              </button>
            )}
          </motion.div>
        </div>
      </div>

      <div className="sticky top-24 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3 py-4 overflow-x-auto no-scrollbar">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all flex-shrink-0 ${
                    isActive
                      ? `bg-gradient-to-r ${cat.color} text-white shadow-lg`
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  <Icon size={14} />
                  {cat.label}
                </button>
              );
            })}

            <div className="w-px h-6 bg-slate-200 mx-1 flex-shrink-0" />

            {['All', 'Video', 'PDF', 'Article'].map((t) => (
              <button
                key={t}
                onClick={() => setActiveType(t)}
                className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap flex-shrink-0 transition-all ${
                  activeType === t
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="relative w-12 h-12">
              <div className="w-12 h-12 border-2 border-blue-200 rounded-full" />
              <div className="absolute inset-0 w-12 h-12 border-t-2 border-blue-600 rounded-full animate-spin" />
            </div>
            <p className="text-slate-600 font-semibold">Loading content…</p>
          </div>
        ) : content.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-20 h-20 bg-blue-50 rounded-3xl border border-blue-200 flex items-center justify-center">
              <BookOpen size={32} className="text-blue-300" />
            </div>
            <p className="font-black text-slate-900 text-xl">No content found</p>
            <p className="text-slate-600 text-sm font-medium">
              {search ? `No results for "${search}". Try a different search.` : 'No content published yet. Check back soon.'}
            </p>
          </div>
        ) : (
          <>
            {activeCategory === 'All' && !search && featured && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12 group cursor-pointer"
                onClick={() => setSelected(featured)}
              >
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-600 mb-4 flex items-center gap-2">
                  <Star size={12} className="text-amber-500" /> Featured
                </p>
                <div className="relative rounded-3xl overflow-hidden border border-slate-200 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-200/40 hover:-translate-y-1 transition-all duration-300 bg-white">
                  {(featured.thumbnail_url || getYouTubeThumbnail(featured.content_url)) && (
                    <div className="absolute inset-0">
                      <img
                        src={featured.thumbnail_url || getYouTubeThumbnail(featured.content_url)}
                        alt={featured.title}
                        className="w-full h-full object-cover opacity-20 group-hover:opacity-30 group-hover:scale-105 transition-all duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-transparent" />
                    </div>
                  )}
                  <div className="relative z-10 p-10 md:p-14 flex flex-col md:flex-row items-start md:items-center gap-8 min-h-[260px]">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
                          {featured.category}
                        </span>
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                          {featured.content_type}
                        </span>
                        {featured.duration && (
                          <span className="text-[10px] text-slate-600 flex items-center gap-1">
                            <Clock size={10} /> {featured.duration}
                          </span>
                        )}
                      </div>
                      <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-4 tracking-tight">
                        {featured.title}
                      </h2>
                      <p className="text-slate-600 font-medium leading-relaxed max-w-xl line-clamp-3">
                        {featured.description}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <button className="flex items-center gap-3 px-8 py-4 bg-blue-700 text-white rounded-2xl font-black text-sm hover:bg-blue-800 transition-all shadow-lg shadow-blue-700/30 active:scale-95">
                        {featured.content_type === 'video' ? <Play size={18} fill="currentColor" /> : <BookOpen size={18} />}
                        {featured.content_type === 'video' ? 'Watch Now' : 'Read Now'}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="flex items-center justify-between mb-6">
              <p className="text-sm font-bold text-slate-600">
                {content.length} {content.length === 1 ? 'resource' : 'resources'} found
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {(activeCategory === 'All' && !search ? rest : content).map((item, i) => (
                <ContentCard key={item.id} item={item} index={i} onClick={() => setSelected(item)} />
              ))}
            </div>
          </>
        )}
      </div>

      <AnimatePresence>
        {selected && <ContentModal item={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}