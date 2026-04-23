import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Megaphone, RefreshCcw, Trash2, Edit2 } from 'lucide-react';
import axios from 'axios';
import { getImageUrl } from '../../utils/imageUtil';

export default function AdsDashboard() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    link: '',
    start_date: '',
    end_date: '',
    status: 'active'
  });

  const token = localStorage.getItem('token');

  const fetchAds = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5001/api/ads', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAds(res.data.data || res.data || []);
    } catch (err) {
      console.error("Failed to load ads", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`http://localhost:5001/api/ads/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://localhost:5001/api/ads', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setFormData({
        title: '',
        description: '',
        image_url: '',
        link: '',
        start_date: '',
        end_date: '',
        status: 'active'
      });
      setEditingId(null);
      setShowAddForm(false);
      fetchAds();
    } catch (err) {
      console.error("Failed to save ad", err);
      alert("Failed to save ad");
    }
  };

  const handleEdit = (ad) => {
    setFormData(ad);
    setEditingId(ad._id);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this ad?")) return;
    try {
      await axios.delete(`http://localhost:5001/api/ads/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAds();
    } catch (err) {
      alert("Failed to delete ad");
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      image_url: '',
      link: '',
      start_date: '',
      end_date: '',
      status: 'active'
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-blue-100 selection:text-blue-900">
      <div className="max-w-[1536px] mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Manage Ads</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                {loading ? 'Loading...' : `${ads.length} Active Ads`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={fetchAds}
              className="p-3 bg-white border border-slate-200 text-slate-600 rounded-full hover:bg-slate-50 transition-all shadow-sm"
            >
              <RefreshCcw size={20} strokeWidth={2.5} className={loading ? "animate-spin text-blue-600" : ""} />
            </button>
            <button 
              onClick={() => setShowAddForm(true)}
              className="px-6 py-3 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition-all flex items-center gap-2 shadow-md active:scale-95"
            >
              <Plus size={18} strokeWidth={3} /> New Ad
            </button>
          </div>
        </div>

        {loading && ads.length === 0 ? (
          <div className="flex items-center justify-center py-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
          </div>
        ) : ads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center bg-white border border-slate-200 rounded-[2rem] shadow-sm">
            <div className="w-20 h-20 bg-slate-50 border border-slate-200 rounded-3xl flex items-center justify-center mb-6">
              <Megaphone size={32} strokeWidth={1.5} className="text-slate-400" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">No Ads Yet</h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-8 font-medium">Create your first advertisement campaign to promote your gemstones.</p>
            <button onClick={() => setShowAddForm(true)} className="px-8 py-3.5 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 active:scale-95">
              Create First Ad
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ads.map((ad) => (
              <motion.div
                key={ad._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white border border-slate-200 rounded-[1.5rem] shadow-sm hover:shadow-lg transition-all overflow-hidden group"
              >
                {ad.image_url && (
                  <div className="h-48 bg-slate-200 overflow-hidden">
                    <img 
                      src={getImageUrl(ad.image_url)} 
                      alt={ad.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="font-bold text-slate-900 text-lg mb-2 line-clamp-2">{ad.title}</h3>
                  <p className="text-slate-600 text-sm mb-4 line-clamp-3">{ad.description}</p>
                  
                  <div className="space-y-2 mb-4 text-xs text-slate-500">
                    {ad.start_date && <p>Start: {new Date(ad.start_date).toLocaleDateString()}</p>}
                    {ad.end_date && <p>End: {new Date(ad.end_date).toLocaleDateString()}</p>}
                    <p className={`font-bold ${ad.status === 'active' ? 'text-green-600' : 'text-orange-600'}`}>
                      {ad.status?.toUpperCase() || 'INACTIVE'}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(ad)}
                      className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-bold text-sm hover:bg-blue-100 transition-all flex items-center justify-center gap-2"
                    >
                      <Edit2 size={16} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(ad._id)}
                      className="flex-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg font-bold text-sm hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={handleCancel}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[2rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-xl"
            >
              <h2 className="text-2xl font-black text-slate-900 mb-6">
                {editingId ? 'Edit Ad' : 'Create New Ad'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Ad Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g., Summer Gemstone Sale"
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe your ad campaign..."
                    rows="4"
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Image URL</label>
                    <input
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                      placeholder="https://..."
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Link/URL</label>
                    <input
                      type="url"
                      value={formData.link}
                      onChange={(e) => setFormData({...formData, link: e.target.value})}
                      placeholder="https://..."
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">End Date</label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="paused">Paused</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all"
                  >
                    {editingId ? 'Update Ad' : 'Create Ad'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-bold hover:bg-slate-300 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
