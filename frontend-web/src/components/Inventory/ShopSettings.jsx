import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store, Upload, Save, ExternalLink, Camera,
  CheckCircle, AlertCircle, RefreshCw, Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// ─── Small helper to build a full image URL ───────────────────────────────────
const buildUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_BASE}/${path}`;
};

export default function ShopSettings() {
  const navigate    = useNavigate();
  const fileInputRef = useRef(null);

  const sellerId = localStorage.getItem('userId');
  const token    = localStorage.getItem('token');

  const [loading, setLoading]       = useState(true);
  const [saving,  setSaving]        = useState(false);
  const [form, setForm]             = useState({ shopName: '', shopDescription: '' });
  const [logoFile, setLogoFile]     = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [currentLogo, setCurrentLogo] = useState('');

  // ── Load existing shop profile ──────────────────────────────────────────────
  useEffect(() => { fetchProfile(); }, [sellerId]);

  const fetchProfile = async () => {
    if (!sellerId) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/seller/storefront/${sellerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setForm({
          shopName:        data.shopName || '',
          shopDescription: data.bio      || ''
        });
        setCurrentLogo(buildUrl(data.shopLogo));
      }
    } catch (err) {
      console.error('[ShopSettings] Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── Logo file selection ─────────────────────────────────────────────────────
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo image must be under 2 MB');
      return;
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  // ── Submit shop profile ─────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.shopName.trim()) {
      toast.error('Shop name is required');
      return;
    }
    try {
      setSaving(true);
      const fd = new FormData();
      fd.append('shopName',        form.shopName.trim());
      fd.append('shopDescription', form.shopDescription.trim());
      if (logoFile) fd.append('shopLogo', logoFile);

      const res = await fetch(`${API_BASE}/api/users/shop-update`, {
        method:  'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body:    fd
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Update failed');

      toast.success('✅ Shop profile saved!');

      if (data.shop?.shopLogo) {
        setCurrentLogo(buildUrl(data.shop.shopLogo));
      }
      setLogoFile(null);
      if (logoPreview) URL.revokeObjectURL(logoPreview);
      setLogoPreview('');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm font-semibold">Loading shop profile…</p>
        </div>
      </div>
    );
  }

  const displayLogo = logoPreview || currentLogo;

  return (
    <div className="max-w-2xl mx-auto">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-400/30">
              <Store size={22} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 leading-tight">Shop Settings</h2>
              <p className="text-sm text-slate-500 mt-0.5">Manage your seller storefront</p>
            </div>
          </div>

          {/* View My Shop button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(`/shop/${sellerId}`)}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl
                       hover:bg-blue-600 transition-colors shadow-md shadow-black/10"
            id="view-my-shop-btn"
          >
            <ExternalLink size={15} />
            View My Shop
          </motion.button>
        </div>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        onSubmit={handleSubmit}
        className="space-y-5"
      >

        {/* ── Logo Card ──────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">
            Shop Logo
          </p>
          <div className="flex items-center gap-6">

            {/* Logo preview / upload zone */}
            <div
              className="relative group cursor-pointer flex-shrink-0"
              onClick={() => fileInputRef.current?.click()}
              title="Click to change logo"
            >
              <div
                className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-300
                            group-hover:border-blue-400 transition-colors overflow-hidden
                            bg-slate-50 flex items-center justify-center"
              >
                {displayLogo ? (
                  <img
                    src={displayLogo}
                    alt="Shop Logo"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <Camera size={28} className="text-slate-300 group-hover:text-blue-400 transition-colors" />
                )}
              </div>
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100
                              transition-opacity flex items-center justify-center">
                <Upload size={20} className="text-white" />
              </div>
            </div>

            {/* Upload info */}
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600
                           hover:text-blue-700 transition-colors"
              >
                <Upload size={14} />
                {displayLogo ? 'Change Logo' : 'Upload Logo'}
              </button>
              <p className="text-xs text-slate-400">JPG, PNG, GIF, WebP — max 2 MB</p>
              <AnimatePresence>
                {logoFile && (
                  <motion.p
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-emerald-600 font-bold flex items-center gap-1"
                  >
                    <CheckCircle size={12} /> {logoFile.name}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <input
              ref={fileInputRef}
              id="shopLogoInput"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoChange}
            />
          </div>
        </div>

        {/* ── Info Card ──────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest">
            Shop Information
          </p>

          {/* Shop Name */}
          <div>
            <label htmlFor="shopName" className="block text-sm font-bold text-slate-700 mb-2">
              Shop Name <span className="text-red-500">*</span>
            </label>
            <input
              id="shopName"
              type="text"
              value={form.shopName}
              onChange={(e) => setForm(f => ({ ...f, shopName: e.target.value }))}
              placeholder="e.g. Ceylon Gem House"
              maxLength={60}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50
                         text-slate-800 font-semibold text-sm placeholder:text-slate-300
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         transition-all"
            />
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-slate-400">Visible on your public shop page</span>
              <span className={`text-xs font-bold ${form.shopName.length > 50 ? 'text-orange-500' : 'text-slate-400'}`}>
                {form.shopName.length}/60
              </span>
            </div>
          </div>

          {/* Shop Description */}
          <div>
            <label htmlFor="shopDescription" className="block text-sm font-bold text-slate-700 mb-2">
              Shop Description
            </label>
            <textarea
              id="shopDescription"
              value={form.shopDescription}
              onChange={(e) => setForm(f => ({ ...f, shopDescription: e.target.value }))}
              placeholder="Tell buyers about your expertise, gem sourcing, and what makes your shop unique…"
              maxLength={500}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50
                         text-slate-800 font-semibold text-sm placeholder:text-slate-300
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         transition-all resize-none"
            />
            <div className="flex justify-end mt-1">
              <span className={`text-xs font-bold ${form.shopDescription.length > 450 ? 'text-orange-500' : 'text-slate-400'}`}>
                {form.shopDescription.length}/500
              </span>
            </div>
          </div>
        </div>

        {/* ── Actions ────────────────────────────────────────────────────────── */}
        <div className="flex gap-3">
          {/* Save */}
          <motion.button
            type="submit"
            id="save-shop-profile-btn"
            disabled={saving}
            whileHover={{ scale: saving ? 1 : 1.02 }}
            whileTap={{ scale: saving ? 1 : 0.98 }}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5
                       bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black
                       rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40
                       transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save size={16} />
                Save Shop Profile
              </>
            )}
          </motion.button>

          {/* Preview */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/shop/${sellerId}`)}
            className="px-5 py-3.5 bg-amber-50 text-amber-700 font-black rounded-xl
                       border border-amber-200 hover:bg-amber-100 transition-colors
                       flex items-center gap-2"
          >
            <Sparkles size={15} />
            Preview
          </motion.button>
        </div>

      </motion.form>
    </div>
  );
}
