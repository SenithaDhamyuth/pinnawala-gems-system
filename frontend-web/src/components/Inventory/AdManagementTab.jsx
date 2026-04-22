import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Megaphone, RefreshCcw, Trash2, Edit2, X, Image as ImageIcon, ExternalLink, ToggleRight, ToggleLeft, Check } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { getImageUrl } from '../../utils/imageUtil';

const API_BASE = 'http://localhost:5001';

export default function AdManagementTab() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    link_url: '',
    position: 'Home_Top',
    is_active: true
  });
  const [imageFile, setImageFile] = useState(null);

  const token = localStorage.getItem('token');

  const POSITIONS = [
    { value: 'Home_Top', label: '🏠 Home - Top Banner' },
    { value: 'Home_Bottom', label: '🏠 Home - Bottom Section' },
    { value: 'Marketplace_Top', label: '🛍️ Marketplace - Top' },
    { value: 'Marketplace_Grid', label: '🛍️ Marketplace - Grid (Every 4 items)' },
    { value: 'Sidebar', label: '📌 Sidebar' }
  ];

  const fetchAds = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/ads/admin/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAds(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load ads', err);
      toast.error('Failed to load advertisements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEdit = (ad) => {
    setFormData({
      title: ad.title,
      image_url: ad.image_url,
      link_url: ad.link_url || '',
      position: ad.position || 'Home_Top',
      is_active: ad.is_active !== false
    });
    setPreviewUrl(ad.image_url);
    setEditingId(ad._id);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('link_url', formData.link_url);
      submitData.append('position', formData.position);
      submitData.append('is_active', formData.is_active);

      if (imageFile) {
        submitData.append('image', imageFile);
      } else if (!formData.image_url && !editingId) {
        toast.error('Please upload an image');
        return;
      }

      if (!imageFile && formData.image_url && editingId) {
        submitData.append('image_url', formData.image_url);
      }

      if (editingId) {
        await axios.put(`${API_BASE}/api/ads/${editingId}`, submitData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success('Advertisement updated successfully');
      } else {
        await axios.post(`${API_BASE}/api/ads`, submitData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success('Advertisement created successfully');
      }

      resetForm();
      fetchAds();
    } catch (err) {
      console.error('Error saving ad:', err);
      toast.error(err.response?.data?.message || 'Failed to save advertisement');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this advertisement?')) return;

    try {
      await axios.delete(`${API_BASE}/api/ads/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Advertisement deleted');
      fetchAds();
    } catch (err) {
      toast.error('Failed to delete advertisement');
    }
  };

  const toggleActive = async (ad) => {
    try {
      await axios.put(
        `${API_BASE}/api/ads/${ad._id}`,
        { is_active: !ad.is_active },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(ad.is_active ? 'Advertisement deactivated' : 'Advertisement activated');
      fetchAds();
    } catch (err) {
      toast.error('Failed to update advertisement status');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      image_url: '',
      link_url: '',
      position: 'Home_Top',
      is_active: true
    });
    setImageFile(null);
    setPreviewUrl(null);
    setEditingId(null);
    setShowAddForm(false);
  };

  const activeCount = ads.filter(a => a.is_active).length;
  const totalCount = ads.length;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-blue-100 rounded-xl p-4"
        >
          <p className="text-xs font-semibold text-slate-500 uppercase">Total Advertisements</p>
          <p className="text-3xl font-black text-slate-900 mt-1">{totalCount}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-emerald-100 rounded-xl p-4"
        >
          <p className="text-xs font-semibold text-slate-500 uppercase">Active</p>
          <p className="text-3xl font-black text-emerald-600 mt-1">{activeCount}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-slate-100 rounded-xl p-4"
        >
          <p className="text-xs font-semibold text-slate-500 uppercase">Inactive</p>
          <p className="text-3xl font-black text-slate-400 mt-1">{totalCount - activeCount}</p>
        </motion.div>
      </div>

      {/* Form Section */}
      <AnimatePresence mode="wait">
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white border border-blue-200 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-slate-900">
                {editingId ? '✏️ Edit Advertisement' : '➕ Create New Advertisement'}
              </h3>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Advertisement Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Premium Ruby Collection"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-900 placeholder:text-slate-400"
                  required
                />
              </div>

              {/* Link URL */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Destination Link (Optional)</label>
                <input
                  type="url"
                  name="link_url"
                  value={formData.link_url}
                  onChange={handleInputChange}
                  placeholder="https://example.com/product"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-900 placeholder:text-slate-400"
                />
              </div>

              {/* Position */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Ad Position *</label>
                <select
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-900"
                  required
                >
                  {POSITIONS.map(pos => (
                    <option key={pos.value} value={pos.value}>{pos.label}</option>
                  ))}
                </select>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Ad Image *</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors"
                  >
                    <div className="text-center">
                      <ImageIcon size={32} className="mx-auto text-blue-400 mb-2" />
                      <p className="text-sm font-bold text-slate-900">Click to upload image</p>
                      <p className="text-xs text-slate-500">PNG, JPG, GIF, WebP up to 5MB</p>
                    </div>
                  </label>
                </div>

                {/* Preview */}
                {previewUrl && (
                  <div className="mt-4 relative">
                    <img
                      src={getImageUrl(previewUrl)}
                      alt="Preview"
                      className="w-full max-h-64 object-cover rounded-lg border border-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        if (!editingId) setPreviewUrl(null);
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* Active Status */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <p className="font-bold text-slate-900">Active Status</p>
                  <p className="text-xs text-slate-500 mt-1">When deactivated, this ad won't appear on the marketplace</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
                  className={`p-2 rounded-lg transition-colors ${
                    formData.is_active ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {formData.is_active ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                </button>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-bold hover:shadow-lg hover:shadow-blue-600/20 transition-all active:scale-95"
                >
                  <Check size={18} className="inline mr-2" />
                  {editingId ? 'Update Advertisement' : 'Create Advertisement'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-bold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Button */}
      {!showAddForm && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-bold hover:shadow-lg hover:shadow-blue-600/20 transition-all active:scale-95"
        >
          <Plus size={20} />
          Create New Advertisement
        </motion.button>
      )}

      {/* Ads List */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-900">📋 All Advertisements</h3>
          <button
            onClick={fetchAds}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <RefreshCcw size={20} className="text-slate-600" />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading advertisements...</div>
        ) : ads.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <Megaphone size={40} className="mx-auto mb-3 text-slate-300" />
            <p>No advertisements yet. Create your first ad!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Image</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Position</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Link</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {ads.map((ad, idx) => (
                  <motion.tr
                    key={ad._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    {/* Thumbnail */}
                    <td className="px-6 py-4">
                      <img
                        src={getImageUrl(ad.image_url)}
                        alt={ad.title}
                        className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                      />
                    </td>

                    {/* Title */}
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{ad.title}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(ad.createdAt).toLocaleDateString()}
                      </p>
                    </td>

                    {/* Position */}
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                        {ad.position?.replace(/_/g, ' ')}
                      </span>
                    </td>

                    {/* Link */}
                    <td className="px-6 py-4">
                      {ad.link_url ? (
                        <a
                          href={ad.link_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <span className="truncate max-w-xs">{ad.link_url}</span>
                          <ExternalLink size={14} />
                        </a>
                      ) : (
                        <span className="text-slate-400 text-sm">-</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleActive(ad)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                          ad.is_active
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        {ad.is_active ? '✓ Active' : '✕ Inactive'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(ad)}
                          className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(ad._id)}
                          className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
