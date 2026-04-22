import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, Edit3, Eye, EyeOff, Search, RefreshCcw,
  Video, FileText, Globe, X, Save, Loader2, CheckCircle2,
  AlertCircle, ToggleLeft, ToggleRight, BookOpen, ExternalLink
} from 'lucide-react';
import axios from 'axios';
import { getImageUrl } from '../../utils/imageUtil';

const API = 'http://localhost:5001/api/learning';

const CATEGORIES = ['Gemology', 'Market Trends', 'Tutorials', 'Mining & Origin', 'Certification'];

const TYPE_CONFIG = {
  video:   { icon: Video,    color: 'bg-blue-50 text-blue-600 border-blue-200',    label: 'Video' },
  pdf:     { icon: FileText, color: 'bg-rose-50 text-rose-600 border-rose-200',    label: 'PDF' },
  article: { icon: Globe,    color: 'bg-emerald-50 text-emerald-600 border-emerald-200', label: 'Article' },
};

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

const EMPTY_FORM = {
  title: '', description: '', category: 'Gemology', content_type: 'video',
  content_url: '', thumbnail_url: '', is_published: false, duration: '', tags: '',
};

// ── Create / Edit Modal ───────────────────────────────────────────────────────
function ContentFormModal({ initial, onClose, onSaved }) {
  const isEdit = !!initial;
  const [form, setForm] = useState(
    initial
      ? {
          ...initial,
          tags: Array.isArray(initial.tags) ? initial.tags.join(', ') : initial.tags || '',
        }
      : EMPTY_FORM
  );
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  const set = (k) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [k]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.category || !form.content_url) {
      setError('Title, description, category, and content URL are required.');
      return;
    }
    setSaving(true); setError('');
    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      };
      if (isEdit) {
        await axios.put(`${API}/${initial.id}`, payload, { headers: authHeaders() });
      } else {
        await axios.post(API, payload, { headers: authHeaders() });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 bg-slate-50 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition';
  const labelCls = 'block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ${isEdit ? 'bg-amber-500 shadow-amber-500/30' : 'bg-blue-600 shadow-blue-600/30'}`}>
              {isEdit ? <Edit3 size={18} className="text-white" /> : <Plus size={20} className="text-white" strokeWidth={3} />}
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">{isEdit ? 'Edit Content' : 'Add New Content'}</h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Learning Hub → {form.category}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-8 py-6 space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm font-semibold">
                <AlertCircle size={16} className="flex-shrink-0" /> {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={labelCls}>Title *</label>
                <input type="text" value={form.title} onChange={set('title')} required placeholder="e.g., Introduction to Sri Lankan Sapphires" className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Category *</label>
                <select value={form.category} onChange={set('category')} className={inputCls}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className={labelCls}>Content Type *</label>
                <select value={form.content_type} onChange={set('content_type')} className={inputCls}>
                  <option value="video">Video (YouTube / URL)</option>
                  <option value="pdf">PDF Document</option>
                  <option value="article">External Article</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className={labelCls}>
                  Content URL * {form.content_type === 'video' && '— YouTube link or direct video URL'}
                  {form.content_type === 'pdf' && '— PDF file path or hosted URL'}
                  {form.content_type === 'article' && '— External article URL'}
                </label>
                <input type="url" value={form.content_url} onChange={set('content_url')} required placeholder={
                  form.content_type === 'video' ? 'https://www.youtube.com/watch?v=...' :
                  form.content_type === 'pdf'   ? 'https://... / /uploads/file.pdf' :
                  'https://...'
                } className={inputCls} />
              </div>

              <div className="col-span-2">
                <label className={labelCls}>Description *</label>
                <textarea value={form.description} onChange={set('description')} required rows={3} placeholder="A brief overview of what learners will gain from this content…" className={inputCls + ' resize-none'} />
              </div>

              <div>
                <label className={labelCls}>Thumbnail URL (optional)</label>
                <input type="url" value={form.thumbnail_url} onChange={set('thumbnail_url')} placeholder="https://... (auto-detected for YouTube)" className={inputCls} />
                <p className="mt-1 text-[11px] text-slate-400 font-medium">Leave blank for YouTube — thumbnail auto-extracted.</p>
              </div>

              <div>
                <label className={labelCls}>Duration (optional)</label>
                <input type="text" value={form.duration} onChange={set('duration')} placeholder="e.g., 12 min · 3 hrs" className={inputCls} />
              </div>

              <div className="col-span-2">
                <label className={labelCls}>Tags (comma-separated, optional)</label>
                <input type="text" value={form.tags} onChange={set('tags')} placeholder="sapphire, grading, certification, sri lanka" className={inputCls} />
              </div>

              {/* Publish toggle */}
              <div className="col-span-2 flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div>
                  <p className="font-black text-slate-900 text-sm">Publish immediately</p>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">Unpublished content is only visible to admins.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, is_published: !f.is_published }))}
                  className="flex-shrink-0"
                >
                  {form.is_published
                    ? <ToggleRight size={36} className="text-blue-600" />
                    : <ToggleLeft  size={36} className="text-slate-300" />}
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-5 border-t border-slate-100 flex gap-3 bg-slate-50/50 flex-shrink-0">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-slate-200 rounded-2xl font-bold text-slate-600 text-sm hover:bg-slate-100 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? 'Saving…' : isEdit ? 'Update Content' : 'Publish Content'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ── Content Type Badge ────────────────────────────────────────────────────────
function TypeBadge({ type }) {
  const cfg  = TYPE_CONFIG[type] || TYPE_CONFIG.article;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${cfg.color}`}>
      <Icon size={11} /> {cfg.label}
    </span>
  );
}

// ── Main ManageLearning Component ─────────────────────────────────────────────
export default function ManageLearning() {
  const [items, setItems]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [filterCat, setFilterCat]       = useState('All');
  const [showModal, setShowModal]       = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [actioning, setActioning]       = useState(null);
  const [toast, setToast]               = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/admin/all`, { headers: authHeaders() });
      setItems(res.data || []);
    } catch (err) {
      console.error('[ManageLearning] fetch:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const filtered = items.filter((item) => {
    if (filterCat !== 'All' && item.category !== filterCat) return false;
    if (search) {
      const q = search.toLowerCase();
      return item.title?.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q);
    }
    return true;
  });

  const handleTogglePublish = async (item) => {
    setActioning(item.id + 'pub');
    try {
      await axios.patch(`${API}/${item.id}/publish`, {}, { headers: authHeaders() });
      showToast(item.is_published ? 'Content unpublished.' : 'Content published!');
      await fetchItems();
    } catch {
      showToast('Failed to toggle publish status.');
    } finally {
      setActioning(null);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
    setActioning(item.id + 'del');
    try {
      await axios.delete(`${API}/${item.id}`, { headers: authHeaders() });
      showToast('Content deleted.');
      await fetchItems();
    } catch {
      showToast('Failed to delete content.');
    } finally {
      setActioning(null);
    }
  };

  const stats = {
    total:     items.length,
    published: items.filter((i) => i.is_published).length,
    videos:    items.filter((i) => i.content_type === 'video').length,
    drafts:    items.filter((i) => !i.is_published).length,
  };

  const FILTER_TABS = ['All', ...CATEGORIES];

  return (
    <div className="min-h-full bg-[#F8FAFC] p-6 lg:p-8">

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[500] bg-slate-900 text-white px-6 py-3.5 rounded-2xl shadow-2xl text-sm font-bold flex items-center gap-3"
          >
            <CheckCircle2 size={16} className="text-emerald-400" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Learning Hub</h1>
          <p className="text-slate-500 font-medium mt-1 text-sm">Manage educational videos, PDFs, and articles.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchItems} disabled={loading} className="p-3 bg-white border border-slate-200 text-slate-500 rounded-full hover:bg-slate-50 transition-all shadow-sm">
            <RefreshCcw size={18} className={loading ? 'animate-spin text-blue-600' : ''} />
          </button>
          <button
            onClick={() => { setEditTarget(null); setShowModal(true); }}
            className="px-5 py-3 bg-blue-600 text-white rounded-full font-bold text-sm hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-600/25 flex items-center gap-2"
          >
            <Plus size={18} strokeWidth={3} /> Add Content
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total',     val: stats.total,     color: 'bg-slate-100 text-slate-500',            icon: BookOpen },
          { label: 'Published', val: stats.published, color: 'bg-emerald-50 text-emerald-600',         icon: Eye },
          { label: 'Drafts',    val: stats.drafts,    color: 'bg-amber-50 text-amber-600',             icon: EyeOff },
          { label: 'Videos',    val: stats.videos,    color: 'bg-blue-50 text-blue-600',               icon: Video },
        ].map(({ label, val, color, icon: Icon }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}><Icon size={22} /></div>
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
              <p className="text-3xl font-black text-slate-900 leading-tight">{val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4">
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by title or description…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none text-slate-700"
            />
          </div>
          <div className="flex items-center gap-1 overflow-x-auto flex-wrap">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterCat(tab)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                  filterCat === tab ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading && items.length === 0 ? (
          <div className="flex items-center justify-center py-32"><Loader2 size={28} className="animate-spin text-blue-600" /></div>
        ) : filtered.length === 0 ? (
          <div className="py-24 flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-slate-50 rounded-3xl border border-slate-200 flex items-center justify-center"><BookOpen size={28} className="text-slate-300" /></div>
            <p className="font-black text-slate-900 text-lg">No content found</p>
            <p className="text-slate-500 text-sm font-medium">{search ? 'Try a different search.' : 'Add your first piece of content.'}</p>
            <button onClick={() => { setEditTarget(null); setShowModal(true); }} className="mt-1 px-5 py-2.5 bg-blue-600 text-white rounded-full font-bold text-sm hover:bg-blue-700 active:scale-95 transition-all shadow-md flex items-center gap-2">
              <Plus size={16} strokeWidth={3} /> Add Content
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#F8FAFC] border-b border-slate-200">
                <tr>
                  {['Content', 'Type', 'Category', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <AnimatePresence initial={false}>
                  {filtered.map((item, i) => {
                    const isActing = actioning?.startsWith(item.id);
                    return (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -16 }}
                        transition={{ delay: i * 0.03 }}
                        className="hover:bg-slate-50/60 transition-colors group"
                      >
                        {/* Content */}
                        <td className="px-6 py-5 max-w-xs">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-10 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                              {(item.thumbnail_url || (item.content_type === 'video' && item.content_url?.includes('youtube'))) ? (
                                <img
                                  src={getImageUrl(item.thumbnail_url || `https://img.youtube.com/vi/${item.content_url?.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/)?.[1]}/default.jpg`)}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center"><BookOpen size={14} className="text-slate-400" /></div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-black text-slate-900 text-sm truncate max-w-[220px]">{item.title}</p>
                              <p className="text-xs text-slate-400 font-medium truncate max-w-[220px]">{item.description}</p>
                            </div>
                          </div>
                        </td>

                        {/* Type */}
                        <td className="px-6 py-5"><TypeBadge type={item.content_type} /></td>

                        {/* Category */}
                        <td className="px-6 py-5">
                          <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border bg-slate-50 text-slate-500 border-slate-200">{item.category}</span>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                            item.is_published
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {item.is_published ? <Eye size={11} /> : <EyeOff size={11} />}
                            {item.is_published ? 'Published' : 'Draft'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                            {/* Preview */}
                            <a href={item.content_url} target="_blank" rel="noreferrer" title="Preview" className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 hover:border-blue-200 transition-all">
                              <ExternalLink size={14} />
                            </a>

                            {/* Edit */}
                            <button onClick={() => { setEditTarget(item); setShowModal(true); }} disabled={isActing} title="Edit" className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-amber-50 hover:text-amber-600 border border-slate-200 hover:border-amber-200 transition-all disabled:opacity-50">
                              <Edit3 size={14} />
                            </button>

                            {/* Toggle Publish */}
                            <button onClick={() => handleTogglePublish(item)} disabled={isActing} title={item.is_published ? 'Unpublish' : 'Publish'}
                              className={`px-3 py-1.5 rounded-xl font-bold text-xs border transition-all active:scale-95 flex items-center gap-1 disabled:opacity-50 ${
                                item.is_published
                                  ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              }`}
                            >
                              {actioning === item.id + 'pub'
                                ? <Loader2 size={12} className="animate-spin" />
                                : item.is_published ? <EyeOff size={13} /> : <Eye size={13} />}
                              {item.is_published ? 'Unpublish' : 'Publish'}
                            </button>

                            {/* Delete */}
                            <button onClick={() => handleDelete(item)} disabled={isActing} title="Delete"
                              className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition-all disabled:opacity-50"
                            >
                              {actioning === item.id + 'del' ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && filtered.length > 0 && (
        <p className="text-center text-[11px] font-semibold text-slate-400 mt-4">
          Showing {filtered.length} of {items.length} items
        </p>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <ContentFormModal
            initial={editTarget}
            onClose={() => { setShowModal(false); setEditTarget(null); }}
            onSaved={fetchItems}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
