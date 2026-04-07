import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getAdminGems, updateGemStatus, deleteAnyGem, getAllUsers, updateKYCStatus, getAllAds, createAd, deleteAd, updateGemstone, getAdminRevenue, createGem, getAdminCompanyGems } from "../services/api";
import {
  ShieldCheck, Users, Gem, LogOut, FileBadge, CheckCircle2,
  Trash2, Clock, CheckCircle, XCircle, Store, RefreshCw,
  Award, AlertCircle, Diamond, Plus, DollarSign, TrendingUp, X
} from "lucide-react";
import NotificationBell from "../components/NotificationBell";

const STATUS_CONFIG = {
  Pending_Approval: { label: 'Pending', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
  Active:           { label: 'Active',  color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle },
  Rejected:         { label: 'Rejected',color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
  Sold:             { label: 'Sold',    color: 'bg-blue-100 text-blue-700 border-blue-200', icon: CheckCircle2 },
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn]   = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPass, setAdminPass]   = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [customGemType, setCustomGemType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [gems, setGems]           = useState([]);
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [ads, setAds]             = useState([]);
  const [showAdForm, setShowAdForm] = useState(false);
  const [adForm, setAdForm]       = useState({ title: '', image_url: '', target_gem_id: '' });
  const [toast, setToast]         = useState('');
  const [editingGem, setEditingGem] = useState(null);
  const [adminRevenue, setAdminRevenue] = useState(0);
  const [revenueHistory, setRevenueHistory] = useState([]);
  const [revenueLoading, setRevenueLoading] = useState(false);
  const [showGemForm, setShowGemForm] = useState(false);
  const [companyGems, setCompanyGems] = useState([]);
  const [gemForm, setGemForm] = useState({
    name: '', gem_type: '', color: '', weight_carats: '', base_price: '',
    description: '', origin: '', clarity: '', cut: '', treatment: '',
    dimensions: '', listing_type: 'Fixed_Price', ngja_cert: ''
  });
  const [gemImageFile, setGemImageFile] = useState(null);
  const [gemImagePreview, setGemImagePreview] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    if (localStorage.getItem('role') === 'admin') { setLoggedIn(true); loadData(); }
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [gemData, userData, adData, revenueData, companyGemsData] = await Promise.all([
        getAdminGems(),
        getAllUsers(),
        getAllAds(),
        getAdminRevenue(),
        getAdminCompanyGems()
      ]);
      setGems(gemData);
      setUsers(userData);
      setAds(adData);
      setCompanyGems(companyGemsData);
      setAdminRevenue(revenueData?.totalRevenue || 0);
      setRevenueHistory(revenueData?.history || []);
    } catch (e) {
      console.error('Failed to load admin data:', e);
      showToast('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminEmail === 'admin@pinnawala.lk' && adminPass === 'admin123') {
      localStorage.setItem('role', 'admin');
      localStorage.setItem('token', 'admin_session_token');
      setLoggedIn(true); loadData();
    } else {
      setLoginError('Invalid credentials'); setTimeout(() => setLoginError(''), 3000);
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await updateGemStatus(id, status);
      showToast(`Listing ${status === 'Active' ? 'approved' : 'rejected'} successfully.`);
      loadData();
    } catch { showToast('Failed to update status.'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this listing?')) return;
    try { await deleteAnyGem(id); showToast('Listing deleted.'); loadData(); }
    catch { showToast('Failed to delete.'); }
  };

  const handleKYCUpdate = async (userId, status) => {
    try {
      await updateKYCStatus(userId, status);
      showToast(status === 'Banned' ? 'User has been Banned.' : `User KYC marked as ${status}.`);
      loadData();
    } catch { showToast('Failed to update status.'); }
  };

  const handleEditGem = async (e) => {
    e.preventDefault();
    try {
      await updateGemstone(editingGem._id, editingGem);
      showToast('Listing updated successfully.');
      setEditingGem(null);
      loadData();
    } catch { showToast('Failed to update listing.'); }
  };

  const handleAdSubmit = async (e) => {
    e.preventDefault();
    try {
      await createAd(adForm);
      showToast('Banner Ad created successfully.');
      setAdForm({ title: '', image_url: '', target_gem_id: '' });
      setShowAdForm(false);
      loadData();
    } catch { showToast('Failed to create Ad.'); }
  };

  const handleAdDelete = async (id) => {
    if (!window.confirm('Delete this Ad?')) return;
    try { await deleteAd(id); showToast('Ad deleted.'); loadData(); }
    catch { showToast('Failed to delete Ad.'); }
  };

  const handleCreateGem = async (e) => {
    e.preventDefault();

    let errors = {};
    const parsedPrice = parseFloat(gemForm.base_price);
    const parsedWeight = parseFloat(gemForm.weight_carats);

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      errors.base_price = 'Base price must be greater than zero.';
    }
    if (!Number.isFinite(parsedWeight) || parsedWeight <= 0) {
      errors.weight_carats = 'Weight must be greater than zero carats.';
    }
    
    // Resolve Gem Type
    let finalGemType = gemForm.gem_type;
    if (finalGemType === 'Other') {
      if (!customGemType || customGemType.trim() === '') {
        errors.gem_type = 'Please specify the custom gem type.';
      } else {
        finalGemType = customGemType.trim();
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showToast('Please fix the highlighted errors before submitting.');
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      
      const processedData = {
        ...gemForm,
        gem_type: finalGemType,
        weight_carats: parsedWeight,
        base_price: parsedPrice,
        listing_type: gemForm.listing_type === 'Fixed_Price' ? 'Direct_Sale' : 'Auction'
      };
      
      const schemaFields = [
        'name', 'gem_type', 'color', 'weight_carats', 'base_price', 
        'is_negotiable', 'listing_type', 'seller_type', 'status', 
        'ngja_cert', 'image_url', 'description', 'origin', 
        'clarity', 'cut', 'treatment', 'dimensions'
      ];
      
      schemaFields.forEach(key => {
        if (processedData[key] !== undefined) {
          formData.append(key, processedData[key]);
        }
      });
      
      if (gemImageFile) {
        formData.append('image', gemImageFile);
      }
      
      await createGem(formData);
      showToast('Company gemstone listed successfully!');
      setShowGemForm(false);
      setGemForm({
        name: '', gem_type: '', color: '', weight_carats: '', base_price: '',
        description: '', origin: '', clarity: '', cut: '', treatment: '',
        dimensions: '', listing_type: 'Fixed_Price', ngja_cert: ''
      });
      setCustomGemType('');
      setFormErrors({});
      setGemImageFile(null);
      setGemImagePreview('');
      loadData(); 
    } catch (error) {
      console.error('Create gem error:', error);
      showToast(error?.response?.data?.message || 'Failed to create gemstone');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCompanyGem = async (gemId) => {
    if (!window.confirm('Delete this company gemstone?')) return;
    try {
      await deleteAnyGem(gemId);
      showToast('Company gemstone deleted');
      loadData(); 
    } catch (error) {
      console.error('Delete gem error:', error);
      showToast('Failed to delete gemstone');
    }
  };

  const handleGemImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setGemImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setGemImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const pendingGems = gems.filter(g => g.status === 'Pending_Approval');
  const activeGems  = gems.filter(g => g.status === 'Active');

  // ── Admin Login Gate ──
  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden font-sans">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob" />
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000" />
          <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000" />
        </div>
        
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-[420px] relative z-10">
          <div className="bg-white/80 backdrop-blur-2xl rounded-[32px] p-10 shadow-2xl shadow-slate-200/50 border border-white">
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-slate-900 rounded-2xl mx-auto flex items-center justify-center shadow-xl shadow-slate-900/20 mb-6">
                <ShieldCheck size={32} className="text-white" strokeWidth={2} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Admin Portal</h2>
              <p className="text-sm text-slate-500 mt-2 font-medium">Authenticate to access control center</p>
            </div>
            <form onSubmit={handleAdminLogin} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-widest mb-2 ml-1">Admin ID</label>
                <input 
                  type="text" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} 
                  placeholder="admin@pinnawala.lk" 
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-widest mb-2 ml-1">Password</label>
                <input 
                  type="password" value={adminPass} onChange={e => setAdminPass(e.target.value)} 
                  placeholder="••••••••" 
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all outline-none" 
                />
              </div>
              {loginError && <p className="text-xs font-bold text-red-500 bg-red-50 px-4 py-3 rounded-xl border border-red-100">{loginError}</p>}
              <button 
                type="submit" 
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all duration-300 flex items-center justify-center gap-2 shadow-xl shadow-slate-900/20"
              >
                Authorize Access
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Main Dashboard ──
  const tabs = [
    { id: 'pending',     label: `Pending Reviews`, count: pendingGems.length, icon: Clock },
    { id: 'inventory',   label: 'List New Gem', icon: Plus },
    { id: 'mygems',      label: `Company Gems`, count: companyGems.length, icon: Diamond },
    { id: 'revenue',     label: 'Revenue Wallet', icon: DollarSign },
    { id: 'ads',         label: 'Banner Ads',    icon: Award },
    { id: 'kyc',         label: 'Seller KYC',    icon: ShieldCheck },
    { id: 'all_gems',    label: 'All Listings',  icon: Gem },
    { id: 'users',       label: 'Accounts',      icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[110] bg-slate-900 text-white px-6 py-3.5 rounded-2xl shadow-2xl shadow-slate-900/20 text-sm font-medium flex items-center gap-3">
            <CheckCircle2 size={18} className="text-emerald-400" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ultra-Premium Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="bg-slate-900 p-2.5 rounded-xl text-white shadow-md shadow-slate-900/20">
              <ShieldCheck size={22} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-900">Pinnawala Command Center</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System Operational</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <NotificationBell />
            {/* Removed the Deauthorize button completely as requested */}
          </div>
        </div>
      </nav>

      <div className="max-w-[1400px] mx-auto px-8 py-10">
        {/* Sleek KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-5 mb-10">
          {[
            { label: 'Total Accounts', val: users.length,      icon: Users,      color: 'text-blue-600',   bg: 'bg-blue-50' },
            { label: 'All Listings',   val: gems.length,       icon: Gem,        color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Active Gems',    val: activeGems.length, icon: Store,      color: 'text-emerald-600',bg: 'bg-emerald-50' },
            { label: 'Pending Review', val: pendingGems.length,icon: FileBadge,  color: 'text-amber-600',  bg: 'bg-amber-50' },
            { label: 'Platform Revenue', val: `LKR ${adminRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-slate-900', bg: 'bg-slate-100' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl ${s.bg}`}>
                  <s.icon size={20} className={s.color} strokeWidth={2} />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 tracking-tight">{s.val}</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Premium Pill Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-8 bg-slate-200/50 p-1.5 rounded-2xl w-fit">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }`}>
              <tab.icon size={16} strokeWidth={2.5} className={activeTab === tab.id ? 'text-blue-600' : ''} /> 
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-1.5 px-2 py-0.5 rounded-md text-[10px] ${activeTab === tab.id ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-500'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content Area with refined styling */}
        <div className="min-h-[500px]">
          {/* ── REVENUE WALLET TAB ── */}
          {activeTab === 'revenue' && (
            <div className="space-y-6">
              <div className="bg-slate-900 rounded-[32px] p-10 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-[100px] opacity-20" />
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10">
                      <TrendingUp size={24} className="text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">Total Platform Revenue</p>
                      <p className="text-white/80 font-medium text-sm">15% Commission Wallet</p>
                    </div>
                  </div>
                  <p className="text-7xl font-black tracking-tighter mb-4">
                    <span className="text-3xl text-white/50 mr-2 font-bold">LKR</span>
                    {adminRevenue.toLocaleString()}
                  </p>
                  <p className="text-emerald-400 font-bold text-sm bg-emerald-400/10 px-4 py-2 rounded-full w-fit border border-emerald-400/20">
                    {revenueHistory.length} Total Transactions
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900 mb-6 px-2">Transaction History</h3>
                {revenueHistory.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-slate-100 py-20 flex flex-col items-center text-center">
                    <DollarSign size={40} className="text-slate-300 mb-4" />
                    <p className="text-slate-500 font-medium">No transactions have been processed yet.</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50/80 border-b border-slate-100">
                          <tr>
                            {['Gem', 'Buyer', 'Seller', 'Full Price', 'Seller Gets (85%)', 'Commission (15%)', 'Date'].map(h => (
                              <th key={h} className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {revenueHistory.map((tx, i) => (
                            <motion.tr key={tx._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                              className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-5 font-bold text-slate-900">{tx.gem_id?.name || tx.gem_name}</td>
                              <td className="px-6 py-5 text-sm text-slate-600">{tx.buyer_id?.full_name || '—'}</td>
                              <td className="px-6 py-5 text-sm text-slate-600">{tx.seller_id?.shopName || tx.seller_id?.full_name || '—'}</td>
                              <td className="px-6 py-5 font-bold text-slate-900">LKR {tx.total_amount?.toLocaleString()}</td>
                              <td className="px-6 py-5 font-bold text-blue-600 bg-blue-50/30">LKR {tx.seller_amount?.toLocaleString()}</td>
                              <td className="px-6 py-5 font-black text-emerald-600 bg-emerald-50/30">LKR {tx.commission?.toLocaleString()}</td>
                              <td className="px-6 py-5 text-sm text-slate-400 font-medium">{new Date(tx.createdAt).toLocaleDateString()}</td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── ADMIN INVENTORY TAB ── */}
          {activeTab === 'inventory' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Company Inventory</h2>
                  <p className="text-sm text-slate-500 font-medium mt-1">List official Pinnawala Gems inventory</p>
                </div>
                <button onClick={() => setShowGemForm(!showGemForm)} 
                  className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-md hover:bg-slate-800 transition-all active:scale-95">
                  <Plus size={16} /> {showGemForm ? 'Cancel Listing' : 'List New Gemstone'}
                </button>
              </div>

              <AnimatePresence>
                {showGemForm && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="bg-white p-8 md:p-10 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40">
                      <form onSubmit={handleCreateGem} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Gemstone Name</label>
                            <input type="text" value={gemForm.name} onChange={e => setGemForm({...gemForm, name: e.target.value})} required
                              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all outline-none" 
                              placeholder="e.g., Royal Blue Sapphire" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Gem Type</label>
                            <select value={gemForm.gem_type} onChange={e => {
                                setGemForm({...gemForm, gem_type: e.target.value});
                                if (formErrors.gem_type) setFormErrors({...formErrors, gem_type: ''});
                              }} required
                              className={`w-full px-5 py-4 bg-slate-50 border rounded-2xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all outline-none ${formErrors.gem_type ? 'border-red-400' : 'border-slate-200'}`}>
                              <option value="">Select Type</option>
                              <option value="Blue Sapphire">Blue Sapphire</option>
                              <option value="Ruby">Ruby</option>
                              <option value="Cat's Eye">Cat's Eye</option>
                              <option value="Emerald">Emerald</option>
                              <option value="Yellow Sapphire">Yellow Sapphire</option>
                              <option value="Padparadscha">Padparadscha</option>
                              <option value="Alexandrite">Alexandrite</option>
                              <option value="Spinel">Spinel</option>
                              <option value="Garnet">Garnet</option>
                              <option value="Tourmaline">Tourmaline</option>
                              <option value="Topaz">Topaz</option>
                              <option value="Aquamarine">Aquamarine</option>
                              <option value="Other">Other</option>
                            </select>
                            {gemForm.gem_type === 'Other' && (
                              <div className="mt-3">
                                <input type="text" value={customGemType} onChange={e => {
                                    setCustomGemType(e.target.value);
                                    if (formErrors.gem_type) setFormErrors({...formErrors, gem_type: ''});
                                  }} required
                                  placeholder="Enter custom gem type..."
                                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all outline-none" 
                                />
                              </div>
                            )}
                            {formErrors.gem_type && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{formErrors.gem_type}</p>}
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Color</label>
                            <input type="text" value={gemForm.color} onChange={e => setGemForm({...gemForm, color: e.target.value})} required
                              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all outline-none" 
                              placeholder="e.g., Royal Blue" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Weight (Carats)</label>
                            <input type="number" step="0.01" value={gemForm.weight_carats} onChange={e => {
                                setGemForm({...gemForm, weight_carats: e.target.value});
                                if (formErrors.weight_carats) setFormErrors({...formErrors, weight_carats: ''});
                              }} required
                              className={`w-full px-5 py-4 bg-slate-50 border rounded-2xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all outline-none ${formErrors.weight_carats ? 'border-red-400' : 'border-slate-200'}`} 
                              placeholder="e.g., 2.45" />
                            {formErrors.weight_carats && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{formErrors.weight_carats}</p>}
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Base Price (LKR)</label>
                            <input type="number" value={gemForm.base_price} onChange={e => {
                                setGemForm({...gemForm, base_price: e.target.value});
                                if (formErrors.base_price) setFormErrors({...formErrors, base_price: ''});
                              }} required
                              className={`w-full px-5 py-4 bg-slate-50 border rounded-2xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all outline-none ${formErrors.base_price ? 'border-red-400' : 'border-slate-200'}`} 
                              placeholder="e.g., 150000" />
                            {formErrors.base_price && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{formErrors.base_price}</p>}
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Listing Type</label>
                            <select value={gemForm.listing_type} onChange={e => setGemForm({...gemForm, listing_type: e.target.value})}
                              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all outline-none">
                              <option value="Fixed_Price">Fixed Price</option>
                              <option value="Negotiable">Negotiable</option>
                              <option value="Auction">Auction</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Origin</label>
                            <input type="text" value={gemForm.origin} onChange={e => setGemForm({...gemForm, origin: e.target.value})}
                              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all outline-none" 
                              placeholder="e.g., Sri Lanka" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Clarity</label>
                            <input type="text" value={gemForm.clarity} onChange={e => setGemForm({...gemForm, clarity: e.target.value})}
                              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all outline-none" 
                              placeholder="e.g., VVS" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Cut</label>
                            <input type="text" value={gemForm.cut} onChange={e => setGemForm({...gemForm, cut: e.target.value})}
                              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all outline-none" 
                              placeholder="e.g., Oval" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">NGJA Certificate</label>
                            <input type="text" value={gemForm.ngja_cert} onChange={e => setGemForm({...gemForm, ngja_cert: e.target.value})}
                              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none" 
                              placeholder="Certificate Number" />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Description</label>
                          <textarea value={gemForm.description} onChange={e => setGemForm({...gemForm, description: e.target.value})} rows={3}
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all outline-none resize-none" 
                            placeholder="Detailed description of the gemstone..."></textarea>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Gemstone Image</label>
                          <div className="flex items-start gap-4">
                            <div className="flex-1">
                              <input type="file" accept="image/*" onChange={handleGemImageChange}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all outline-none" />
                            </div>
                            {gemImagePreview && (
                              <div className="w-24 h-24 bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm p-1">
                                <img src={gemImagePreview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-lg border border-emerald-100">
                            <ShieldCheck size={16} className="text-emerald-500" />
                            <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">Auto-Approved (Company)</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <button type="button" onClick={() => setShowGemForm(false)} className="px-6 py-3 bg-white text-slate-600 border border-slate-200 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors disabled:opacity-50" disabled={isSubmitting}>
                              Cancel
                            </button>
                            <button type="submit" disabled={isSubmitting} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-md hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-75 disabled:active:scale-100 flex items-center justify-center">
                              {isSubmitting ? 'Publishing...' : 'Publish Listing'}
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* ── MY LISTED GEMS TAB ── */}
          {activeTab === 'mygems' && (
            <div className="space-y-6">
              {loading ? (
                <div className="flex items-center justify-center py-32"><RefreshCw size={28} className="text-slate-300 animate-spin" /></div>
              ) : companyGems.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-100 py-32 flex flex-col items-center text-center shadow-sm">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <Diamond size={32} className="text-slate-300" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">No Company Gems Listed</h3>
                  <p className="text-slate-500 font-medium max-w-sm mb-6">You haven't added any official inventory yet. Listed gems will bypass approval.</p>
                  <button onClick={() => setActiveTab('inventory')} className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-md hover:bg-slate-800 transition-all">
                    Add First Gemstone
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {companyGems.map((gem, i) => (
                    <motion.div key={gem._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden flex flex-col">
                      <div className="h-48 w-full bg-slate-100 relative overflow-hidden p-2">
                        {gem.image_url ? (
                          <img src={gem.image_url} alt={gem.name} className="w-full h-full object-cover rounded-2xl" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Diamond size={32} className="text-slate-300" />
                          </div>
                        )}
                        <div className="absolute top-4 right-4 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-md">
                          Active
                        </div>
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <h4 className="text-lg font-black text-slate-900 mb-1">{gem.name}</h4>
                        <p className="text-sm font-medium text-slate-500 mb-4">{gem.gem_type} • {gem.weight_carats} ct</p>
                        <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                          <p className="font-bold text-slate-900">LKR {gem.base_price?.toLocaleString()}</p>
                          <button onClick={() => handleDeleteCompanyGem(gem._id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── PENDING LISTINGS TAB ── */}
          {activeTab === 'pending' && (
            <div className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-32"><RefreshCw size={28} className="text-slate-300 animate-spin" /></div>
              ) : pendingGems.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-100 py-32 flex flex-col items-center text-center shadow-sm">
                  <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle size={32} className="text-emerald-500" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">Inbox Zero</h3>
                  <p className="text-slate-500 font-medium max-w-sm">There are no pending third-party gemstone listings requiring your approval.</p>
                </div>
              ) : pendingGems.map((gem, i) => (
                <motion.div key={gem._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
                  <div className="w-full md:w-32 h-32 bg-slate-50 rounded-2xl flex items-center justify-center flex-shrink-0 border border-slate-100 p-2">
                    {gem.image_url ? <img src={gem.image_url} alt={gem.name} className="w-full h-full object-cover rounded-xl" />
                      : <Diamond size={24} className="text-slate-300" strokeWidth={1.5} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-black text-slate-900 text-xl">{gem.name}</h3>
                      <span className="text-[10px] font-black bg-amber-50 text-amber-600 border border-amber-100 px-2 py-1 rounded-lg uppercase tracking-widest">Pending</span>
                    </div>
                    <p className="text-sm font-medium text-slate-500 mb-4">{gem.seller_type === 'Company' ? 'Company Listing' : 'Third-Party Seller'}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      {[
                        { label: 'Type',   val: gem.gem_type },
                        { label: 'Weight', val: `${gem.weight_carats} ct` },
                        { label: 'Price',  val: `LKR ${gem.base_price?.toLocaleString()}` },
                        { label: 'Method', val: gem.listing_type?.replace('_', ' ') },
                      ].map(f => (
                        <div key={f.label}>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{f.label}</p>
                          <p className="text-sm font-bold text-slate-700">{f.val || '—'}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 w-fit">
                      <Award size={14} className={gem.ngja_cert ? 'text-emerald-500' : 'text-slate-400'} />
                      <p className="text-xs font-bold text-slate-600">
                        NGJA: <span className={gem.ngja_cert ? 'text-emerald-600' : 'text-red-500'}>{gem.ngja_cert || 'Unverified'}</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex md:flex-col gap-2 pt-2 md:pt-0 border-t md:border-t-0 md:border-l border-slate-100 md:pl-6">
                    <button onClick={() => handleStatus(gem._id, 'Active')}
                      className="flex-1 flex justify-center items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-colors shadow-sm">
                      Approve
                    </button>
                    <button onClick={() => handleStatus(gem._id, 'Rejected')}
                      className="flex-1 flex justify-center items-center gap-2 px-6 py-3 bg-white text-red-500 border border-red-200 rounded-xl font-bold text-sm hover:bg-red-50 transition-colors">
                      Reject
                    </button>
                    <button onClick={() => handleDelete(gem._id)}
                      className="flex-1 flex justify-center items-center gap-2 px-6 py-3 bg-slate-50 text-slate-500 rounded-xl font-bold text-sm hover:bg-slate-100 hover:text-red-500 transition-colors">
                      Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* ── ALL LISTINGS TAB ── */}
          {activeTab === 'all_gems' && (
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-32"><RefreshCw size={28} className="text-slate-300 animate-spin" /></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/80 border-b border-slate-100">
                      <tr>
                        {['Listing Details', 'Specs', 'Price', 'Type', 'Status', 'Actions'].map(h => (
                          <th key={h} className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {gems.map((gem, i) => {
                        const sc = STATUS_CONFIG[gem.status] || STATUS_CONFIG.Pending_Approval;
                        return (
                          <motion.tr key={gem._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                            className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-6 py-5">
                              <div className="font-bold text-slate-900">{gem.name}</div>
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{gem.seller_type}</div>
                            </td>
                            <td className="px-6 py-5 text-sm font-medium text-slate-600">{gem.gem_type} • {gem.weight_carats}ct</td>
                            <td className="px-6 py-5 font-bold text-slate-900">LKR {gem.base_price?.toLocaleString()}</td>
                            <td className="px-6 py-5 text-xs font-bold text-slate-500">{gem.listing_type?.replace('_', ' ') || '—'}</td>
                            <td className="px-6 py-5">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${sc.color}`}>
                                {sc.label}
                              </span>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => setEditingGem(gem)} className="p-2 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 rounded-xl transition-colors"><RefreshCw size={14} /></button>
                                <button onClick={() => handleDelete(gem._id)} className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl transition-colors"><Trash2 size={14} /></button>
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
          )}

          {/* ── USERS TAB ── */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
              {loading ? (
                 <div className="flex items-center justify-center py-32"><RefreshCw size={28} className="text-slate-300 animate-spin" /></div>
              ) : users.length === 0 ? (
                <div className="py-32 flex flex-col items-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <Users size={32} className="text-slate-300" strokeWidth={1.5} />
                  </div>
                  <p className="text-slate-500 font-medium">No registered accounts found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/80 border-b border-slate-100">
                      <tr>
                        {['Account', 'Role', 'KYC Status', 'Joined Date', 'Manage'].map(h => (
                          <th key={h} className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {users.map((u, i) => (
                        <motion.tr key={u._id || u.email} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                          className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-5">
                            <p className="font-bold text-slate-900">{u.full_name}</p>
                            <p className="text-xs font-medium text-slate-500 mt-0.5">{u.email}</p>
                          </td>
                          <td className="px-6 py-5">
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${u.role === 'seller' ? 'bg-blue-50 text-blue-600 border-blue-100' : u.role === 'admin' ? 'bg-slate-900 text-white border-slate-800' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            {u.role !== 'admin' ? (
                              <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${u.kycStatus === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : u.kycStatus === 'Banned' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                {u.kycStatus}
                              </span>
                            ) : <span className="text-slate-300">—</span>}
                          </td>
                          <td className="px-6 py-5 text-sm text-slate-500 font-medium">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                          </td>
                          <td className="px-6 py-5">
                            {u.role !== 'admin' && (
                              u.kycStatus !== 'Banned' ? (
                                <button onClick={() => handleKYCUpdate(u._id, 'Banned')} className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-bold transition-colors">Ban User</button>
                              ) : (
                                <button onClick={() => handleKYCUpdate(u._id, 'Pending')} className="px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg text-xs font-bold transition-colors">Lift Ban</button>
                              )
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── KYC APPROVAL TAB ── */}
          {activeTab === 'kyc' && (
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Verification Queue</h2>
                  <p className="text-sm font-medium text-slate-500 mt-1">Review identity and NGJA documents for third-party sellers.</p>
                </div>
                <div className="bg-amber-50 text-amber-600 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border border-amber-100 flex items-center gap-2">
                  <AlertCircle size={14} /> Action Required
                </div>
              </div>
              
              {users.filter(u => u.role === 'seller' && u.kycStatus === 'Pending').length === 0 ? (
                <div className="py-32 text-center flex flex-col items-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <ShieldCheck size={32} className="text-slate-300" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">Queue is Empty</h3>
                  <p className="text-slate-500 font-medium">No seller verifications are pending at the moment.</p>
                </div>
              ) : (
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {users.filter(u => u.role === 'seller' && u.kycStatus === 'Pending').map(u => (
                    <motion.div key={u._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                      className="border border-slate-100 rounded-3xl p-6 hover:shadow-lg hover:shadow-slate-200/50 transition-all group">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-lg">
                          {u.full_name.charAt(0)}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h3 className="font-black text-slate-900 text-lg">{u.full_name}</h3>
                      <p className="text-sm font-medium text-slate-500 mb-6">{u.email}</p>
                      
                      <div className="mb-6">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Submitted Documents</p>
                        {u.kyc_documents && u.kyc_documents.length > 0 ? (
                          <div className="flex flex-col gap-2">
                            {u.kyc_documents.map((doc, idx) => (
                              <a key={idx} href={`http://localhost:5001${doc}`} target="_blank" rel="noreferrer" 
                                className="flex items-center justify-between p-3 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 text-slate-600 rounded-xl transition-colors border border-slate-100 group/link">
                                <span className="text-xs font-bold">Document {idx + 1}</span>
                                <RefreshCw size={12} className="opacity-0 group-hover/link:opacity-100 transition-opacity" />
                              </a>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs font-medium text-red-500 bg-red-50 p-3 rounded-xl border border-red-100">No documents uploaded</p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                        <button onClick={() => handleKYCUpdate(u._id, 'Approved')} className="flex-1 px-4 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors">Verify Seller</button>
                        <button onClick={() => handleKYCUpdate(u._id, 'Rejected')} className="flex-1 px-4 py-3 bg-white border border-slate-200 text-red-500 rounded-xl text-xs font-bold hover:bg-red-50 transition-colors">Reject</button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── ADS MANAGEMENT TAB ── */}
          {activeTab === 'ads' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Hero Banners</h2>
                  <p className="text-sm font-medium text-slate-500 mt-1">Manage marketplace promotional campaigns.</p>
                </div>
                <button onClick={() => setShowAdForm(!showAdForm)} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-md hover:bg-slate-800 transition-all">
                  <Plus size={16} /> {showAdForm ? 'Cancel Form' : 'Create Banner'}
                </button>
              </div>

              <AnimatePresence>
                {showAdForm && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40">
                      <form onSubmit={handleAdSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Campaign Title</label>
                          <input required value={adForm.title} onChange={e => setAdForm({...adForm, title: e.target.value})} placeholder="e.g., Summer Sapphire Sale" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none transition-all" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Banner Image URL</label>
                          <input required value={adForm.image_url} onChange={e => setAdForm({...adForm, image_url: e.target.value})} placeholder="https://..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none transition-all" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Linked Gem ID (Optional)</label>
                          <input value={adForm.target_gem_id} onChange={e => setAdForm({...adForm, target_gem_id: e.target.value})} placeholder="MongoDB ObjectID..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none transition-all" />
                        </div>
                        <div className="md:col-span-2 pt-4 border-t border-slate-100 flex justify-end gap-3">
                           <button type="button" onClick={() => setShowAdForm(false)} className="px-6 py-3 bg-white text-slate-600 rounded-xl font-bold border border-slate-200">Cancel</button>
                           <button type="submit" className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-md hover:bg-slate-800 transition-all">Publish Banner</button>
                        </div>
                      </form>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ads.map(ad => (
                  <div key={ad._id} className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-lg transition-shadow group flex flex-col">
                    <div className="h-48 w-full overflow-hidden bg-slate-100 relative p-2">
                      <img src={ad.image_url} className="w-full h-full object-cover rounded-2xl" />
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm">
                        Live Ad
                      </div>
                    </div>
                    <div className="p-6 flex items-center justify-between bg-white flex-1">
                      <div>
                        <h4 className="font-black text-slate-900 text-lg mb-1">{ad.title}</h4>
                        {ad.target_gem_id && <p className="text-xs font-medium text-slate-400">Linked to Gem ID</p>}
                      </div>
                      <button onClick={() => handleAdDelete(ad._id)} className="p-3 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Premium Edit Gem Modal */}
      <AnimatePresence>
        {editingGem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white p-8 rounded-[32px] w-full max-w-md shadow-2xl border border-white/20">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Quick Edit</h3>
                <button onClick={() => setEditingGem(null)} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-900 transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Title</label>
                  <input value={editingGem.name} onChange={e => setEditingGem({...editingGem, name: e.target.value})} 
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Base Price (LKR)</label>
                  <input type="number" value={editingGem.base_price} onChange={e => setEditingGem({...editingGem, base_price: e.target.value})} 
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none transition-all" />
                </div>
                <div className="pt-4 flex gap-3">
                  <button onClick={() => setEditingGem(null)} className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-colors">Cancel</button>
                  <button onClick={handleEditGem} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-md hover:bg-slate-800 transition-colors">Save Changes</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}