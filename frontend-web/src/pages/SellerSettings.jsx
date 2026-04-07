import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, Save, ArrowLeft, Palette, Type, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { updateSellerProfile, getStorefront } from '../services/api';

export default function SellerSettings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [formData, setFormData] = useState({
    shopName: '',
    address: '',
    bio: '',
    theme: {
      primaryColor: '#0f172a',
      fontFamily: 'Inter',
      bannerImage: ''
    }
  });
  const [bannerFile, setBannerFile] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userId = JSON.parse(atob(localStorage.getItem('token').split('.')[1])).id;
        const data = await getStorefront(userId);
        setFormData({
          shopName: data.shopName || '',
          address: data.address || '',
          bio: data.bio || '',
          theme: data.theme || { primaryColor: '#0f172a', fontFamily: 'Inter', bannerImage: '' }
        });
      } catch (err) {
        console.error('Failed to fetch profile', err);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      if (formData.shopName) fd.append('shopName', formData.shopName);
      if (formData.address) fd.append('address', formData.address);
      if (formData.bio) fd.append('bio', formData.bio);
      if (formData.theme) fd.append('theme', JSON.stringify(formData.theme));
      if (bannerFile) fd.append('bannerImage', bannerFile);

      await updateSellerProfile(fd);
      showToast('Profile updated successfully!');
    } catch (err) {
      showToast('Error updating profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl text-sm font-semibold flex items-center gap-2">
            <CheckCircle size={16} className="text-emerald-400" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="bg-white/70 backdrop-blur-xl border-b border-white/20 sticky top-0 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/seller')} className="p-2.5 rounded-2xl hover:bg-slate-100 text-slate-500 transition-all active:scale-90">
              <ArrowLeft size={22} />
            </button>
            <h1 className="text-xl font-serif font-bold text-slate-900">Shop Settings</h1>
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-500/20 hover:bg-blue-500 transition-all active:scale-95 disabled:opacity-50"
          >
            <Save size={18} /> {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Basic Info */}
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Store size={20} />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Identity & Bio</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Shop Name</label>
                  <input
                    type="text"
                    value={formData.shopName}
                    onChange={(e) => setFormData({...formData, shopName: e.target.value})}
                    placeholder="e.g. Blue Sapphire Boutique"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Business Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="e.g. 123 Gem Street, Ratnapura"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Store Bio</label>
                  <textarea
                    rows={4}
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    placeholder="Tell your story..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none"
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Theme Settings */}
          <div className="space-y-6">
            <section className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                  <Palette size={20} />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Brand Theme</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Primary Brand Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.theme.primaryColor}
                      onChange={(e) => setFormData({...formData, theme: {...formData.theme, primaryColor: e.target.value}})}
                      className="h-12 w-12 rounded-lg border border-slate-200 cursor-pointer overflow-hidden p-0"
                    />
                    <input
                      type="text"
                      value={formData.theme.primaryColor}
                      onChange={(e) => setFormData({...formData, theme: {...formData.theme, primaryColor: e.target.value}})}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Typography Style</label>
                  <select
                    value={formData.theme.fontFamily}
                    onChange={(e) => setFormData({...formData, theme: {...formData.theme, fontFamily: e.target.value}})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none"
                  >
                    <option value="Inter">Modern (Inter)</option>
                    <option value="serif">Classic (Serif)</option>
                    <option value="mono">Technical (Mono)</option>
                    <option value="Outfit">Elegant (Outfit)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Banner Image</label>
                  <div className="relative group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setBannerFile(e.target.files[0])}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-blue-600 file:text-white hover:file:bg-blue-700 font-medium"
                    />
                  </div>
                  {formData.theme?.bannerImage && !bannerFile && (
                    <p className="text-[10px] text-slate-400 mt-2 border-l-2 border-blue-400 pl-2">Current banner is active. Upload a new file to replace it.</p>
                  )}
                </div>
              </div>
            </section>

            {/* Preview Card */}
            <div className="p-1 text-center">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">Live Preview</p>
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden scale-90 origin-top">
                <div style={{ backgroundColor: formData.theme.primaryColor }} className="h-16 w-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs">BRAND HEADER</span>
                </div>
                <div className="p-6 text-left">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg mb-4" />
                  <h4 style={{ fontFamily: formData.theme.fontFamily }} className="font-bold text-slate-900 mb-1">{formData.shopName || 'Shop Name'}</h4>
                  <p className="text-[10px] text-slate-400 line-clamp-2">{formData.bio || 'Your store bio will appear here...'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
