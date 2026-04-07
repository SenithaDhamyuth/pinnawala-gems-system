import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Store, Upload, Save, Palette, Globe, BadgeCheck, Clock, 
  MessageCircle, Star, ArrowLeft, Eye, CheckCircle
} from 'lucide-react';
import { updateSellerProfile, getStorefront } from '../services/api';

export default function ShopCustomization() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  
  // Shop customization state
  const [shopData, setShopData] = useState({
    shopName: '',
    address: '',
    bio: '',
    shopLogo: '',
    bannerImage: '',
    theme: {
      primaryColor: '#0f172a',
      fontFamily: 'Inter'
    },
    businessHours: {
      open: '09:00',
      close: '18:00',
      days: ['Mon','Tue','Wed','Thu','Fri']
    },
    socialLinks: {
      whatsapp: '',
      instagram: '',
      linkedin: ''
    },
    policies: '',
    badges: [],
    welcomeNote: '',
    featuredGems: []
  });

  // File states
  const [logoFile, setLogoFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [bannerPreview, setBannerPreview] = useState('');

  const showToast = (msg) => { 
    setToast(msg); 
    setTimeout(() => setToast(""), 3000); 
  };

  // Load current shop data
  useEffect(() => {
    const loadShopData = async () => {
      try {
        const userId = localStorage.getItem('userId') || JSON.parse(atob(localStorage.getItem('token')?.split('.')[1] || '{}'))?.id;
        if (!userId) {
          navigate('/login');
          return;
        }

        const data = await getStorefront(userId);
        setShopData({
          shopName: data.shopName || '',
          address: data.address || '',
          bio: data.bio || '',
          shopLogo: data.shopLogo || '',
          bannerImage: data.theme?.bannerImage || '',
          theme: {
            primaryColor: data.theme?.primaryColor || '#0f172a',
            fontFamily: data.theme?.fontFamily || 'Inter'
          },
          businessHours: {
            open: data.businessHours?.open || '09:00',
            close: data.businessHours?.close || '18:00',
            days: data.businessHours?.days || ['Mon','Tue','Wed','Thu','Fri']
          },
          socialLinks: {
            whatsapp: data.socialLinks?.whatsapp || '',
            instagram: data.socialLinks?.instagram || '',
            linkedin: data.socialLinks?.linkedin || ''
          },
          policies: data.policies || '',
          badges: data.badges || [],
          welcomeNote: data.welcomeNote || '',
          featuredGems: data.featuredGems || []
        });
        setLogoPreview(data.shopLogo || '');
        setBannerPreview(data.theme?.bannerImage || '');
      } catch (err) {
        console.error('Error loading shop data:', err);
        showToast('Failed to load shop data');
      } finally {
        setLoading(false);
      }
    };

    loadShopData();
  }, [navigate]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      
      // Basic info
      formData.append('shopName', shopData.shopName);
      formData.append('address', shopData.address || '');
      formData.append('bio', shopData.bio);
      formData.append('policies', shopData.policies);
      formData.append('welcomeNote', shopData.welcomeNote);
      
      // Theme
      const themeData = { ...shopData.theme };
      // Only include bannerImage in theme if we're not uploading a new one
      if (!bannerFile) {
        themeData.bannerImage = shopData.bannerImage;
      } else {
        // Remove bannerImage from theme when uploading new file
        delete themeData.bannerImage;
      }
      formData.append('theme', JSON.stringify(themeData));
      
      // Business hours
      formData.append('businessHours', JSON.stringify(shopData.businessHours));
      
      // Social links
      formData.append('socialLinks', JSON.stringify(shopData.socialLinks));
      
      // Badges and featured gems
      formData.append('badges', JSON.stringify(shopData.badges));
      formData.append('featuredGems', JSON.stringify(shopData.featuredGems));
      
      // Files
      if (logoFile) formData.append('shopLogo', logoFile);
      if (bannerFile) formData.append('bannerImage', bannerFile);

      await updateSellerProfile(formData);
      showToast('✨ Shop customization saved successfully!');
      
      // Clear file states after successful save
      setLogoFile(null);
      setBannerFile(null);
      
    } catch (err) {
      console.error('Error saving shop data:', err);
      showToast(err?.response?.data?.message || 'Failed to save shop data');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoChange = (file) => {
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleBannerChange = (file) => {
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
      setShopData(prev => ({
        ...prev,
        bannerImage: URL.createObjectURL(file)
      }));
    }
  };

  const toggleBadge = (badge) => {
    setShopData(prev => ({
      ...prev,
      badges: prev.badges.includes(badge) 
        ? prev.badges.filter(b => b !== badge)
        : [...prev.badges, badge]
    }));
  };

  const toggleBusinessDay = (day) => {
    setShopData(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        days: prev.businessHours.days.includes(day)
          ? prev.businessHours.days.filter(d => d !== day)
          : [...prev.businessHours.days, day]
      }
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Toast */}
      {toast && (
        <motion.div 
          initial={{ opacity: 0, y: -30 }} 
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl text-sm font-semibold flex items-center gap-2"
        >
          <CheckCircle size={16} className="text-emerald-400" /> {toast}
        </motion.div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/seller-dashboard')}
              className="p-2 hover:bg-slate-50 rounded-xl transition-colors"
            >
              <ArrowLeft size={20} className="text-slate-600" />
            </button>
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-xl text-white">
                <Store size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Shop Customization</h1>
                <p className="text-sm text-slate-500">Design your storefront</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const userId = localStorage.getItem('userId') || JSON.parse(atob(localStorage.getItem('token')?.split('.')[1] || '{}'))?.id;
                if (userId) navigate(`/shop/${userId}`);
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
            >
              <Eye size={16} /> Preview Shop
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 text-white rounded-xl font-semibold text-sm shadow-lg transition-colors disabled:opacity-50"
              style={{ 
                backgroundColor: shopData.theme.primaryColor,
                boxShadow: `0 10px 25px -5px ${shopData.theme.primaryColor}40`
              }}
              onMouseEnter={(e) => {
                if (!saving) {
                  e.target.style.backgroundColor = shopData.theme.primaryColor + 'dd';
                  e.target.style.boxShadow = `0 10px 25px -5px ${shopData.theme.primaryColor}60`;
                }
              }}
              onMouseLeave={(e) => {
                if (!saving) {
                  e.target.style.backgroundColor = shopData.theme.primaryColor;
                  e.target.style.boxShadow = `0 10px 25px -5px ${shopData.theme.primaryColor}40`;
                }
              }}
            >
              <Save size={16} />
              {saving ? 'Saving...' : 'Save Changes'}
            </motion.button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Banner & Logo */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Store size={20} /> Shop Identity
              </h2>
              
              {/* Banner */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Shop Banner</label>
                <div className="h-48 rounded-xl overflow-hidden bg-slate-100 border-2 border-dashed border-slate-300 relative group">
                  {bannerPreview ? (
                    <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <Upload size={40} className="text-slate-400 mx-auto mb-2" />
                        <p className="text-slate-500 text-sm">Upload banner image</p>
                        <p className="text-slate-400 text-xs">Recommended: 1920x400px</p>
                      </div>
                    </div>
                  )}
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <span className="bg-white text-slate-900 px-4 py-2 rounded-lg font-semibold text-sm">
                      Change Banner
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleBannerChange(e.target.files[0])}
                    />
                  </label>
                </div>
              </div>

              {/* Logo */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Shop Logo</label>
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-100 border-2 border-dashed border-slate-300 relative group">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Store size={32} className="text-slate-400" />
                      </div>
                    )}
                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Upload size={20} className="text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleLogoChange(e.target.files[0])}
                      />
                    </label>
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Shop Name"
                      value={shopData.shopName}
                      onChange={(e) => setShopData(prev => ({ ...prev, shopName: e.target.value }))}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    />
                    <p className="text-xs text-slate-500 mt-1">This name appears on your storefront</p>
                    
                    <input
                      type="text"
                      placeholder="Shop Address"
                      value={shopData.address}
                      onChange={(e) => setShopData(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 mt-3"
                    />
                    <p className="text-xs text-slate-500 mt-1">Physical address for your store</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Shop Description */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Shop Description</h2>
              <textarea
                placeholder="Tell buyers about your shop, your expertise, and what makes your gems special..."
                value={shopData.bio}
                onChange={(e) => setShopData(prev => ({ ...prev, bio: e.target.value }))}
                rows={4}
                maxLength={500}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none"
              />
              <p className="text-xs text-slate-500 mt-1 text-right">{shopData.bio.length}/500</p>
            </div>

            {/* Theme & Branding */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6" style={{ borderTop: `3px solid ${shopData.theme.primaryColor}` }}>
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Palette size={20} style={{ color: shopData.theme.primaryColor }} /> Theme & Branding
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Primary Brand Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={shopData.theme.primaryColor}
                      onChange={(e) => setShopData(prev => ({
                        ...prev,
                        theme: { ...prev.theme, primaryColor: e.target.value }
                      }))}
                      className="w-16 h-16 rounded-lg border-2 cursor-pointer"
                      style={{ borderColor: shopData.theme.primaryColor }}
                    />
                    <div>
                      <p className="font-mono text-sm font-semibold" style={{ color: shopData.theme.primaryColor }}>
                        {shopData.theme.primaryColor.toUpperCase()}
                      </p>
                      <p className="text-xs text-slate-500">This color will be used for accents and buttons</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Font Style</label>
                  <select
                    value={shopData.theme.fontFamily}
                    onChange={(e) => setShopData(prev => ({
                      ...prev,
                      theme: { ...prev.theme, fontFamily: e.target.value }
                    }))}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none"
                    style={{ 
                      focusRingColor: shopData.theme.primaryColor + '40',
                      borderColor: shopData.theme.primaryColor
                    }}
                    onFocus={(e) => {
                      e.target.style.outline = 'none';
                      e.target.style.boxShadow = `0 0 0 3px ${shopData.theme.primaryColor}40`;
                      e.target.style.borderColor = shopData.theme.primaryColor;
                    }}
                    onBlur={(e) => {
                      e.target.style.boxShadow = 'none';
                      e.target.style.borderColor = '#e2e8f0';
                    }}
                  >
                    <option value="Inter">Inter (Modern)</option>
                    <option value="Georgia">Georgia (Classic)</option>
                    <option value="Arial">Arial (Clean)</option>
                    <option value="Times New Roman">Times New Roman (Traditional)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Clock size={20} /> Business Hours
              </h2>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Opening Time</label>
                  <input
                    type="time"
                    value={shopData.businessHours.open}
                    onChange={(e) => setShopData(prev => ({
                      ...prev,
                      businessHours: { ...prev.businessHours, open: e.target.value }
                    }))}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Closing Time</label>
                  <input
                    type="time"
                    value={shopData.businessHours.close}
                    onChange={(e) => setShopData(prev => ({
                      ...prev,
                      businessHours: { ...prev.businessHours, close: e.target.value }
                    }))}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Business Days</label>
                <div className="flex flex-wrap gap-2">
                  {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(day => (
                    <button
                      key={day}
                      onClick={() => toggleBusinessDay(day)}
                      className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        shopData.businessHours.days.includes(day)
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Globe size={20} /> Social Links
              </h2>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">WhatsApp</label>
                  <input
                    type="text"
                    placeholder="+94 71 234 5678"
                    value={shopData.socialLinks.whatsapp}
                    onChange={(e) => setShopData(prev => ({
                      ...prev,
                      socialLinks: { ...prev.socialLinks, whatsapp: e.target.value }
                    }))}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Instagram</label>
                  <input
                    type="url"
                    placeholder="https://instagram.com/yourshop"
                    value={shopData.socialLinks.instagram}
                    onChange={(e) => setShopData(prev => ({
                      ...prev,
                      socialLinks: { ...prev.socialLinks, instagram: e.target.value }
                    }))}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">LinkedIn</label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/yourprofile"
                    value={shopData.socialLinks.linkedin}
                    onChange={(e) => setShopData(prev => ({
                      ...prev,
                      socialLinks: { ...prev.socialLinks, linkedin: e.target.value }
                    }))}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>
              </div>
            </div>

            {/* Policies */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Shop Policies</h2>
              <textarea
                placeholder="Describe your return policy, shipping terms, and buyer guarantees..."
                value={shopData.policies}
                onChange={(e) => setShopData(prev => ({ ...prev, policies: e.target.value }))}
                rows={4}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none"
              />
            </div>

            {/* Welcome Note */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <MessageCircle size={20} /> Welcome Note
              </h2>
              <p className="text-sm text-slate-600 mb-3">A dismissible banner shown to first-time visitors</p>
              <input
                type="text"
                placeholder="e.g. Welcome! Browse our ethically sourced Ceylon sapphires — use code GEMS10 for 10% off."
                value={shopData.welcomeNote}
                onChange={(e) => setShopData(prev => ({ ...prev, welcomeNote: e.target.value }))}
                maxLength={200}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
              <p className="text-xs text-slate-500 mt-1 text-right">{shopData.welcomeNote.length}/200</p>
            </div>
          </div>

          {/* Sidebar - Live Preview */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="p-4 text-white" style={{ backgroundColor: shopData.theme.primaryColor }}>
                  <h3 className="font-bold flex items-center gap-2">
                    <Eye size={16} /> Live Preview
                  </h3>
                </div>
                
                <div className="p-4">
                  {/* Mini Banner Preview */}
                  <div 
                    className="h-24 rounded-lg mb-4 relative overflow-hidden"
                    style={{ backgroundColor: shopData.theme.primaryColor + '20' }}
                  >
                    {bannerPreview && (
                      <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover opacity-70" />
                    )}
                    <div className="absolute bottom-2 left-2 flex items-center gap-2">
                      {logoPreview && (
                        <img src={logoPreview} alt="Logo" className="w-8 h-8 rounded-lg object-cover border-2 border-white shadow-sm" />
                      )}
                      <div className="text-sm font-bold drop-shadow-lg" style={{ color: shopData.theme.primaryColor === '#0f172a' ? 'white' : shopData.theme.primaryColor }}>
                        {shopData.shopName || 'Your Shop'}
                      </div>
                    </div>
                  </div>

                  {/* Theme Preview */}
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-700 mb-2">Brand Colors</p>
                      <div className="flex gap-2">
                        <div 
                          className="w-8 h-8 rounded-lg border-2 border-slate-200"
                          style={{ backgroundColor: shopData.theme.primaryColor }}
                        />
                        <div className="w-8 h-8 rounded-lg bg-slate-100 border-2 border-slate-200" />
                        <div className="w-8 h-8 rounded-lg bg-white border-2 border-slate-200" />
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-slate-700 mb-2">Typography</p>
                      <p style={{ fontFamily: shopData.theme.fontFamily }} className="text-sm">
                        Sample text in {shopData.theme.fontFamily}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-slate-700 mb-2">Business Hours</p>
                      <p className="text-xs text-slate-600">
                        {shopData.businessHours.days.join(', ')} • {shopData.businessHours.open} - {shopData.businessHours.close}
                      </p>
                    </div>

                    {shopData.welcomeNote && (
                      <div>
                        <p className="text-xs font-semibold text-slate-700 mb-2">Welcome Note</p>
                        <div className="bg-blue-50 text-blue-700 p-2 rounded-lg text-xs">
                          {shopData.welcomeNote}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 mt-4">
                <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <BadgeCheck size={16} /> Trust Badges
                </h3>
                <div className="space-y-2">
                  {[
                    'Verified Ethically Sourced',
                    'GIA Certified Trader', 
                    'NGJA Registered Seller',
                    'Premium Quality Guarantee'
                  ].map(badge => (
                    <button
                      key={badge}
                      onClick={() => toggleBadge(badge)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
                        shopData.badges.includes(badge)
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-50 text-slate-600 border border-slate-200 hover:border-emerald-200'
                      }`}
                    >
                      <BadgeCheck size={14} className={shopData.badges.includes(badge) ? 'text-emerald-600' : 'text-slate-400'} />
                      {badge}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
