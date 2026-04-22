import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Plus, Trash2, AlertCircle, BookOpen, Loader, Edit2, X, Check,
  Eye, EyeOff, Search, Video, FileText, Globe, Save, Loader2,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const CATEGORIES = ['Gemology', 'Market Trends', 'Tutorials', 'Mining & Origin', 'Certification'];
const CONTENT_TYPES = ['video', 'pdf', 'article'];

const TYPE_CONFIG = {
  video: { icon: Video, color: 'bg-blue-50 text-blue-600 border-blue-200', label: 'Video' },
  pdf: { icon: FileText, color: 'bg-rose-50 text-rose-600 border-rose-200', label: 'PDF' },
  article: { icon: Globe, color: 'bg-emerald-50 text-emerald-600 border-emerald-200', label: 'Article' },
};

const EMPTY_FORM = {
  title: '',
  description: '',
  category: 'Gemology',
  content_type: 'video',
  content_url: '',
  thumbnail_url: '',
  is_published: false,
  duration: '',
  tags: '',
};

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
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.category || !form.content_url) {
      setError('Title, description, category, and content URL are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      };
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      if (isEdit) {
        await axios.put(`${apiUrl}/api/learning/${initial.id}`, payload, { headers });
      } else {
        await axios.post(`${apiUrl}/api/learning`, payload, { headers });
      }
      toast.success(isEdit ? '✓ Content updated!' : '✓ Content created!');
      onSaved();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to save. Please try again.');
      toast.error(error || 'Failed to save content');
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    'w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 bg-slate-50 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition';
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
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ${
                isEdit ? 'bg-amber-500 shadow-amber-500/30' : 'bg-blue-600 shadow-blue-600/30'
              }`}
            >
              {isEdit ? (
                <Edit2 size={18} className="text-white" />
              ) : (
                <Plus size={20} className="text-white" strokeWidth={3} />
              )}
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">
                {isEdit ? 'Edit Content' : 'Add New Content'}
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Learning Hub → {form.category}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className={labelCls}>Title</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Enter content title"
                className={inputCls}
              />
            </div>

            {/* Description */}
            <div>
              <label className={labelCls}>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Enter content description"
                rows="3"
                className={inputCls}
              />
            </div>

            {/* Category & Content Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Category</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className={inputCls}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Content Type</label>
                <select
                  name="content_type"
                  value={form.content_type}
                  onChange={handleChange}
                  className={inputCls}
                >
                  {CONTENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {TYPE_CONFIG[type].label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Content URL */}
            <div>
              <label className={labelCls}>Content URL</label>
              <input
                type="url"
                name="content_url"
                value={form.content_url}
                onChange={handleChange}
                placeholder="https://example.com/video"
                className={inputCls}
              />
            </div>

            {/* Thumbnail URL */}
            <div>
              <label className={labelCls}>Thumbnail URL</label>
              <input
                type="url"
                name="thumbnail_url"
                value={form.thumbnail_url}
                onChange={handleChange}
                placeholder="https://example.com/thumbnail.jpg"
                className={inputCls}
              />
            </div>

            {/* Duration & Tags */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Duration</label>
                <input
                  type="text"
                  name="duration"
                  value={form.duration}
                  onChange={handleChange}
                  placeholder="e.g., 5 min, 45 min"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Tags</label>
                <input
                  type="text"
                  name="tags"
                  value={form.tags}
                  onChange={handleChange}
                  placeholder="tag1, tag2, tag3"
                  className={inputCls}
                />
              </div>
            </div>

            {/* Published Status */}
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <input
                type="checkbox"
                id="is_published"
                name="is_published"
                checked={form.is_published}
                onChange={handleChange}
                className="w-5 h-5 rounded border-slate-300 text-blue-600 cursor-pointer"
              />
              <label htmlFor="is_published" className="text-sm font-bold text-slate-700 cursor-pointer flex-1">
                Publish content immediately
              </label>
            </div>

            {/* Error */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3">
                <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-red-700">{error}</p>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-slate-100 flex items-center justify-end gap-3 flex-shrink-0 bg-slate-50">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-bold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={(e) => handleSubmit(e)}
            disabled={saving}
            className="px-6 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 rounded-lg transition-colors flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                {isEdit ? 'Update' : 'Create'}
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function LearningManagementTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState(null);

  const token = localStorage.getItem('token');
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  useEffect(() => {
    fetchContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(`${apiUrl}/api/learning/admin/all`, { headers });
      setItems(response.data);
    } catch (error) {
      console.error('Failed to fetch learning content:', error);
      toast.error('Failed to load learning content');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContent = async (id) => {
    if (!confirm('Are you sure you want to delete this content?')) return;
    try {
      setDeleting(id);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.delete(`${apiUrl}/api/learning/${id}`, { headers });
      setItems(items.filter((item) => item.id !== id));
      toast.success('✓ Content deleted!');
    } catch (error) {
      console.error('Failed to delete content:', error);
      toast.error('Failed to delete content');
    } finally {
      setDeleting(null);
    }
  };

  const handleTogglePublish = async (item) => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.patch(`${apiUrl}/api/learning/${item.id}/publish`, {}, { headers });
      setItems(items.map((i) => (i.id === item.id ? response.data : i)));
      toast.success(response.data.is_published ? '✓ Content published!' : '✓ Content unpublished!');
    } catch (error) {
      console.error('Failed to toggle publish:', error);
      toast.error('Failed to toggle publish status');
    }
  };

  const handleEditClick = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  const handleFormSaved = () => {
    fetchContent();
  };

  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.description.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading learning content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-blue-100 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <BookOpen className="text-blue-600" size={28} />
              Learning Hub Management
            </h2>
            <p className="text-sm text-slate-500 mt-1">Create and manage learning content for the platform.</p>
          </div>
          <motion.button
            onClick={() => setShowForm(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            <Plus size={20} strokeWidth={3} />
            Add Content
          </motion.button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search content by title or description..."
            className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition"
          />
        </div>
      </div>

      {/* Content Table */}
      <div className="bg-white border border-blue-100 rounded-2xl overflow-hidden">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium mb-6">No learning content yet. Create your first piece of content!</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              Create Content
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Title</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredItems.map((item) => {
                  const TypeIcon = TYPE_CONFIG[item.content_type]?.icon || Globe;
                  const typeConfig = TYPE_CONFIG[item.content_type];
                  return (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 text-sm line-clamp-1">{item.title}</div>
                        <div className="text-xs text-slate-500 mt-1 line-clamp-1">{item.description}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-slate-600">{item.category}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border ${typeConfig?.color || ''}`}>
                          <TypeIcon size={14} />
                          {typeConfig?.label || item.content_type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleTogglePublish(item)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-xs border transition-all ${
                            item.is_published
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          {item.is_published ? (
                            <>
                              <Eye size={14} /> Published
                            </>
                          ) : (
                            <>
                              <EyeOff size={14} /> Draft
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <motion.button
                            onClick={() => handleEditClick(item)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-9 h-9 flex items-center justify-center rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors border border-amber-200"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </motion.button>
                          <motion.button
                            onClick={() => handleDeleteContent(item.id)}
                            disabled={deleting === item.id}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors border border-red-200 disabled:opacity-50"
                            title="Delete"
                          >
                            {deleting === item.id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <ContentFormModal
            initial={editingItem}
            onClose={handleCloseForm}
            onSaved={handleFormSaved}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
