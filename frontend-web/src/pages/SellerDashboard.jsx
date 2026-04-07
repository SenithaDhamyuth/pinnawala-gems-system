import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";
import {
  getMyGems, createGemstone, updateGemstone, deleteGemstone,
  getSellerOffers, respondToOffer, getMyWallet, updateSellerProfile,
} from "../services/api";
import {
  Store, Plus, Pencil, Trash2, LogOut, ArrowRight, Diamond,
  Inbox, RefreshCw, CheckCircle, XCircle, MessageSquare,
  Clock, AlertCircle, ShieldCheck, MessageCircle, Star,
  Palette, Globe, BadgeCheck, Save, Upload,
} from "lucide-react";
import { AnimatePresence as AP } from "framer-motion";
import ChatWindow from "../components/ChatWindow";
import NotificationBell from "../components/NotificationBell";
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const SOCKET_URL = "http://localhost:5001";

const STATUS_CONFIG = {
  Pending_Approval: { label: "Pending Approval", color: "bg-amber-100 text-amber-700 border-amber-200",   icon: Clock        },
  Active:           { label: "Active",            color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: ShieldCheck },
  Rejected:         { label: "Rejected",          color: "bg-red-100 text-red-700 border-red-200",         icon: AlertCircle  },
  Sold:             { label: "Sold",              color: "bg-blue-100 text-blue-700 border-blue-200",       icon: CheckCircle  },
};

const OFFER_STATUS = {
  Pending:   "bg-amber-100 text-amber-700",
  Accepted:  "bg-emerald-100 text-emerald-700",
  Rejected:  "bg-red-100 text-red-700",
  Countered: "bg-blue-100 text-blue-700",
};

const emptyForm = {
  name: "", gem_type: "", color: "", weight_carats: "",
  base_price: "", is_negotiable: false,
  seller_type: "ThirdParty", ngja_cert: "", description: "",
};

export default function SellerDashboard() {
  const navigate = useNavigate();
  const [gems,         setGems]         = useState([]);
  const [offers,       setOffers]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [activeTab,    setActiveTab]    = useState("inventory");
  const [editingId,    setEditingId]    = useState(null);
  const [showForm,     setShowForm]     = useState(false);
  const [formData,     setFormData]     = useState(emptyForm);
  const [toast,        setToast]        = useState("");
  const [kycStatus,    setKycStatus]    = useState(localStorage.getItem("kycStatus") || "Pending");
  const [imageFile,    setImageFile]    = useState(null);
  // ── Fixed: counterInputs was used in JSX but never declared ──
  const [counterInputs, setCounterInputs] = useState({});
  // ── Chat: which offer's chat is open ──
  const [activeChatOffer, setActiveChatOffer] = useState(null);
  const [newOfferAlert, setNewOfferAlert] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [customGemType, setCustomGemType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shopSettings, setShopSettings] = useState({
    shopName: '', bio: '', theme: 'light',
    businessHoursOpen: '09:00', businessHoursClose: '18:00',
    businessDays: ['Mon','Tue','Wed','Thu','Fri'],
    socialWhatsApp: '', socialInstagram: '', socialLinkedIn: '',
    policies: '', badges: [], welcomeNote: '', featuredGems: [],
  });
  const [bannerFile,    setBannerFile]    = useState(null);
  const [bannerPreview, setBannerPreview] = useState('');
  const [logoFile,      setLogoFile]      = useState(null);
  const [logoPreview,   setLogoPreview]   = useState('');

  const socketRef = useRef(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const loadAll = async () => {
    try {
      const [g, o] = await Promise.all([getMyGems(), getSellerOffers()]);
      setGems(g);
      setOffers(o);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  };

  const handleSaveShopSettings = async () => {
    try {
      const fd = new FormData();
      if (shopSettings.shopName)  fd.append('shopName',  shopSettings.shopName);
      if (shopSettings.bio)       fd.append('bio',       shopSettings.bio);
      fd.append('theme',          shopSettings.theme);
      fd.append('businessHours',  JSON.stringify({ open: shopSettings.businessHoursOpen, close: shopSettings.businessHoursClose, days: shopSettings.businessDays }));
      fd.append('socialLinks',    JSON.stringify({ whatsapp: shopSettings.socialWhatsApp, instagram: shopSettings.socialInstagram, linkedin: shopSettings.socialLinkedIn }));
      fd.append('policies',       shopSettings.policies);
      fd.append('badges',         JSON.stringify(shopSettings.badges));
      fd.append('welcomeNote',    shopSettings.welcomeNote);
      fd.append('featuredGems',   JSON.stringify(shopSettings.featuredGems));
      if (bannerFile) fd.append('bannerImage', bannerFile);
      if (logoFile)   fd.append('shopLogo',    logoFile);
      await updateSellerProfile(fd);
      showToast('✨ Shop settings saved successfully!');
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to save settings.');
    }
  };

  // ── Auth guard + initial data load ────────────────────────────────────────
  useEffect(() => {
    const role  = localStorage.getItem("role");
    const token = localStorage.getItem("token");
    if (role !== "seller" || !token) { navigate("/"); return; }
    loadAll();
  }, [navigate]);

  // ── Socket.io — listen for new incoming offers in real time ───────────────
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
    });
    socketRef.current = socket;

    // Seller joins their personal room so the server can push new_offer events
    socket.on("connect", () => {
      // Backend automatically joins 'user_${sellerId}' on connection.
    });

    // New offer arrived — refresh list + show badge
    socket.on("new_offer", () => {
      setNewOfferAlert(true);
      loadAll();
      showToast("💎 New offer received!");
    });

    return () => socket.disconnect();
  }, []);

  // ── Gem form submit ────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let errors = {};
    const weight = Number(formData.weight_carats);
    const price = Number(formData.base_price);
    
    if (!Number.isFinite(weight) || weight <= 0) {
      errors.weight_carats = "Weight must be greater than zero carats.";
    }
    if (!Number.isFinite(price) || price <= 0) {
      errors.base_price = "Base price must be greater than zero.";
    }

    if (!formData.name?.trim() || !formData.gem_type?.trim() || !formData.color?.trim()) {
      showToast("Please fill in all required fields.");
      return;
    }

    // Resolve Gem Type
    let finalGemType = formData.gem_type;
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
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'gem_type') {
          data.append(key, finalGemType);
        } else {
          data.append(key, formData[key]);
        }
      });
      if (imageFile) data.append("image", imageFile);

      if (editingId) {
        await updateGemstone(editingId, data);
        showToast("Listing updated.");
      } else {
        await createGemstone(data);
        showToast("Listing submitted for Admin approval.");
      }
      setFormData(emptyForm); setEditingId(null); setShowForm(false); setImageFile(null);
      setCustomGemType(""); setFormErrors({});
      loadAll();
    } catch (err) { showToast(err.response?.data?.message || "Error saving listing."); }
    finally { setIsSubmitting(false); }
  };

  const handleEdit = (gem) => {
    setEditingId(gem._id);
    const standardTypes = ["Blue Sapphire", "Ruby", "Cat's Eye", "Emerald", "Yellow Sapphire", "Padparadscha", "Alexandrite", "Spinel", "Garnet", "Tourmaline", "Topaz", "Aquamarine"];
    const isStandard = standardTypes.includes(gem.gem_type);
    
    setFormData({
      name: gem.name, 
      gem_type: isStandard ? gem.gem_type : 'Other', 
      color: gem.color,
      weight_carats: gem.weight_carats, base_price: gem.base_price,
      is_negotiable: gem.is_negotiable || false,
      seller_type: gem.seller_type || "ThirdParty",
      ngja_cert: gem.ngja_cert || "", description: gem.description || "",
    });
    if (!isStandard) setCustomGemType(gem.gem_type);
    else setCustomGemType("");
    
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this listing?")) return;
    try { await deleteGemstone(id); showToast("Listing deleted."); loadAll(); }
    catch { showToast("Error deleting listing."); }
  };

  const handleOfferResponse = async (offerId, status, counter) => {
    try {
      await respondToOffer(offerId, { status, counter_amount: counter || undefined });
      showToast(`Offer ${status.toLowerCase()}.`);
      // Emit accept_offer socket event so buyer gets real-time cart_update
      if (status === "Accepted" && socketRef.current?.connected) {
        socketRef.current.emit("accept_offer", { offer_id: offerId });
      }
      loadAll();
    } catch { showToast("Failed to respond to offer."); }
  };

  const pendingOffers = offers.filter(o => o.status === "Pending").length;

  // Build a gem-like object for ChatWindow from an offer card
  const buildChatGem = (offer) => ({
    _id:              offer.gem_id?._id || offer.gem_id,
    name:             offer.gem_name || offer.gem_id?.name || "Gem",
    seller_id:        offer.seller_id,
    buyer_id_for_room: offer.buyer_id,   // seller needs buyer's ID to reconstruct the room
    image_url:        offer.gem_id?.image_url || "",
  });

  return (
    <div className="min-h-screen bg-[#F9FAFB]">

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl text-sm font-semibold flex items-center gap-2">
            <CheckCircle size={16} className="text-emerald-400" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navbar */}
      <nav className="bg-white/70 backdrop-blur-xl border-b border-white/20 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-500/20 text-white">
              <Store size={22} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold text-slate-900 leading-tight tracking-tight">Seller Executive Suite</h1>
              <div className="flex items-center gap-1.5 pt-0.5">
                 <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Marketplace Active</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <button onClick={() => navigate("/marketplace")}
              className="flex items-center gap-2 px-6 py-3 text-sm font-black text-blue-600 hover:bg-blue-50 rounded-2xl transition-all active:scale-95 group">
              Browse Marketplace <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
               onClick={() => {
                 const userId = localStorage.getItem('userId') || parseJwt(localStorage.getItem('token'))?.id;
                 if (userId) navigate(`/shop/${userId}`);
               }}
               className="flex items-center gap-2 px-6 py-3 text-sm font-black text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all active:scale-95 group border border-emerald-100"
            >
               <Store size={16} /> View My Store
            </button>
            <button onClick={() => { localStorage.clear(); navigate("/"); }}
              className="flex items-center gap-2 px-6 py-3 text-sm font-black text-red-500 hover:bg-red-50 rounded-2xl transition-all active:scale-95 border border-transparent hover:border-red-100">
              <LogOut size={16} /> End Session
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Stats Row */}
        {!loading && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-5 mb-8">
            {[
              { label: "Total Listings",   val: gems.length,                                              color: "text-slate-900"   },
              { label: "Active",           val: gems.filter(g => g.status === "Active").length,            color: "text-emerald-600" },
              { label: "Pending Offers",   val: pendingOffers,                                             color: "text-blue-600"    },
            ].map((s, i) => (
              <motion.div key={s.label}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-md shadow-slate-200/40">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{s.label}</p>
                <p className={`text-3xl font-black ${s.color}`}>{s.val}</p>
              </motion.div>
            ))}
            {/* Subscription Card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}
              className="bg-gradient-to-br from-indigo-600 to-violet-800 rounded-2xl p-5 border border-indigo-400/30 shadow-lg shadow-indigo-500/20 col-span-2 md:col-span-1">
              <p className="text-xs font-black text-white/70 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Star size={12}/> Subscription Plan</p>
              <p className="text-2xl font-black text-white leading-tight">
                Premium
              </p>
              <p className="text-white/80 text-[10px] font-bold mt-1 uppercase tracking-widest flex items-center gap-1">
                 <CheckCircle size={10} className="text-emerald-400" /> Unlimited Listings
              </p>
            </motion.div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 bg-white border border-slate-100 rounded-2xl p-1.5 w-fit shadow-sm">
          {[
            { id: "inventory", label: "My Inventory", icon: Diamond },
            {
              id: "offers",
              label: `Offer Inbox${pendingOffers > 0 ? ` (${pendingOffers})` : ""}`,
              icon: Inbox,
              alert: newOfferAlert,
            },
          ].map(tab => (
            <button key={tab.id}
              onClick={() => { setActiveTab(tab.id); if (tab.id === "offers") setNewOfferAlert(false); }}
              className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}>
              <tab.icon size={15} /> {tab.label}
              {tab.alert && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />}
            </button>
          ))}
        </div>

        {/* ── INVENTORY TAB ── */}
        {activeTab === "inventory" && (
          <>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-serif font-bold text-slate-900">Your Listings</h2>
              <button
                onClick={() => { setEditingId(null); setFormData(emptyForm); setShowForm(f => !f); }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all ${showForm ? "bg-slate-900 text-white shadow-slate-900/20" : "bg-blue-600 text-white shadow-blue-500/25 hover:bg-blue-500"}`}>
                <Plus size={16} /> {showForm ? "Close Form" : "Add Gem"}
              </button>
            </div>

            {/* Create / Edit Form */}
            <AnimatePresence>
              {showForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6">
                  <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-xl shadow-black/5 border border-slate-200/60 relative">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-emerald-500 rounded-t-3xl" />
                    <h3 className="text-lg font-serif font-bold text-slate-900 mb-5">
                      {editingId ? "Edit Listing" : "New Listing"}
                    </h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Gem Name</label>
                        <input type="text" required placeholder="Royal Blue Sapphire"
                          value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all" />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Gem Type</label>
                        <select required value={formData.gem_type} onChange={e => {
                            setFormData({ ...formData, gem_type: e.target.value });
                            if (formErrors.gem_type) setFormErrors({ ...formErrors, gem_type: "" });
                          }}
                          className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all ${formErrors.gem_type ? 'border-red-400' : 'border-slate-200'}`}>
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
                        {formData.gem_type === 'Other' && (
                          <div className="mt-3">
                            <input type="text" required placeholder="Enter custom gem type..."
                              value={customGemType} onChange={e => {
                                setCustomGemType(e.target.value);
                                if (formErrors.gem_type) setFormErrors({ ...formErrors, gem_type: "" });
                              }}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all" />
                          </div>
                        )}
                        {formErrors.gem_type && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{formErrors.gem_type}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Weight (Carats)</label>
                        <input type="number" step="0.01" required placeholder="2.5"
                          value={formData.weight_carats} onChange={e => {
                            setFormData({ ...formData, weight_carats: e.target.value });
                            if (formErrors.weight_carats) setFormErrors({ ...formErrors, weight_carats: "" });
                          }}
                          className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all ${formErrors.weight_carats ? 'border-red-400' : 'border-slate-200'}`} />
                        {formErrors.weight_carats && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{formErrors.weight_carats}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Price (LKR)</label>
                        <input type="number" required placeholder="150000"
                          value={formData.base_price} onChange={e => {
                            setFormData({ ...formData, base_price: e.target.value });
                            if (formErrors.base_price) setFormErrors({ ...formErrors, base_price: "" });
                          }}
                          className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all ${formErrors.base_price ? 'border-red-400' : 'border-slate-200'}`} />
                        {formErrors.base_price && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{formErrors.base_price}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">NGJA Certificate No.</label>
                        <input type="text" placeholder="NGJA-2025-XXXX"
                          value={formData.ngja_cert} onChange={e => setFormData({ ...formData, ngja_cert: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all" />
                      </div>
                      {/* ── Color Picker (replaces plain text input) ── */}
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Color</label>
                        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
                          <input
                            type="color"
                            value={formData.color && formData.color.startsWith('#') ? formData.color : '#3b82f6'}
                            onChange={e => setFormData({ ...formData, color: e.target.value })}
                            className="w-10 h-10 rounded-lg border-0 cursor-pointer bg-transparent p-0"
                          />
                          <span className="text-sm font-semibold text-slate-700">
                            {formData.color && formData.color.startsWith('#') ? formData.color.toUpperCase() : formData.color || 'Pick a color'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Negotiation Mode</label>
                        <label className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 cursor-pointer select-none hover:bg-slate-100 transition-colors">
                          <input
                             type="checkbox"
                             checked={formData.is_negotiable}
                             onChange={e => setFormData({ ...formData, is_negotiable: e.target.checked })}
                             className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500/40 border-slate-300"
                          />
                          <span className="text-sm font-semibold text-slate-900">Open for Negotiation (Allow Offers)</span>
                        </label>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Seller Type</label>
                        <select value={formData.seller_type}
                          onChange={e => setFormData({ ...formData, seller_type: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40">
                          <option value="ThirdParty">3rd-Party Seller</option>
                          <option value="Company">Company (Pinnawala)</option>
                        </select>
                      </div>
                      <div className="lg:col-span-3">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description (Rich Text)</label>
                        <div className="bg-slate-50 rounded-xl overflow-hidden border border-slate-200">
                          <ReactQuill 
                            theme="snow"
                            value={formData.description}
                            onChange={val => setFormData({ ...formData, description: val })}
                            className="bg-white"
                          />
                        </div>
                      </div>
                      <div className="lg:col-span-3">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Gem Image</label>
                        <input type="file" accept="image/*"
                          onChange={e => setImageFile(e.target.files[0])}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-blue-600 file:text-white hover:file:bg-blue-700 font-medium"
                        />
                      </div>
                      <div className="lg:col-span-3">
                        <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/25 hover:bg-blue-500 transition-colors disabled:opacity-75 disabled:active:scale-100">
                          {isSubmitting ? (editingId ? "Updating..." : "Processing...") : (editingId ? "Update Listing" : "Go Live Instantly")}
                        </motion.button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Listings Table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
              {loading ? (
                <div className="p-10 flex items-center justify-center">
                  <RefreshCw size={28} className="text-blue-200 animate-spin" />
                </div>
              ) : gems.length === 0 ? (
                <div className="py-20 flex flex-col items-center text-center">
                  <Diamond size={40} className="text-slate-200 mb-3" strokeWidth={1} />
                  <h3 className="text-lg font-bold text-slate-800 mb-1">No listings yet</h3>
                  <p className="text-slate-500 text-sm font-medium">Click "Add Gem" to submit your first gem for review.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/60 border-b border-slate-100">
                      <tr>
                        {["Gem", "Specifications", "Listing Type", "Price", "NGJA", "Status", "Actions"].map(h => (
                          <th key={h} className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {gems.map((gem, i) => {
                        const sc = STATUS_CONFIG[gem.status] || STATUS_CONFIG.Pending_Approval;
                        const StatusIcon = sc.icon;
                        return (
                          <motion.tr key={gem._id}
                            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                            className="border-b border-slate-50 hover:bg-slate-50/40 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="font-bold text-slate-900 font-serif leading-tight group-hover:text-blue-600 transition-colors">{gem.name}</div>
                              <div className="text-xs text-emerald-600 font-semibold uppercase tracking-wide mt-0.5">{gem.gem_type}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600 font-medium whitespace-nowrap">
                              {gem.weight_carats} ct · {gem.color}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`text-xs font-bold px-2 py-1 rounded-lg ${gem.is_negotiable ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                                {gem.is_negotiable ? "Negotiable" : "Fixed Price"}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap">LKR {gem.base_price?.toLocaleString() ?? '0'}</td>
                            <td className="px-6 py-4 text-xs text-slate-500 font-medium">{gem.ngja_cert || "—"}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${sc.color}`}>
                                <StatusIcon size={10} /> {sc.label}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button onClick={() => handleEdit(gem)}
                                  className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-colors">
                                  <Pencil size={14} />
                                </button>
                                <button onClick={() => handleDelete(gem._id)}
                                  className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl transition-colors">
                                  <Trash2 size={14} />
                                </button>
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
          </>
        )}

        {/* KYC LOCK OVERLAY */}
        {kycStatus !== "Approved" && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-white max-w-md w-full rounded-[32px] p-10 text-center shadow-2xl">
              <div className="w-20 h-20 bg-amber-50 rounded-3xl mx-auto flex items-center justify-center mb-6 border border-amber-100">
                <ShieldCheck size={40} className="text-amber-500" strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl font-serif font-bold text-slate-900 mb-3">Verification Pending</h2>
              <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                Your profile is currently under review by our Admin team.<br />
                Once verified, you'll be able to manage your inventory and respond to offers.
              </p>
              <div className="flex flex-col gap-3">
                <div className="py-3 px-6 bg-amber-50 rounded-2xl border border-amber-100 text-amber-700 text-sm font-bold flex items-center justify-center gap-2">
                  <Clock size={16} /> Current Status: {kycStatus}
                </div>
                <button onClick={() => navigate("/")} className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">
                  Go Back
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* ── OFFER INBOX TAB ── */}
        {activeTab === "offers" && (
          <div>
            <h2 className="text-2xl font-serif font-bold text-slate-900 mb-5">Offer Inbox</h2>
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <RefreshCw size={28} className="text-blue-200 animate-spin" />
              </div>
            ) : offers.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-100 py-20 flex flex-col items-center text-center shadow-sm">
                <Inbox size={40} className="text-slate-200 mb-3" strokeWidth={1} />
                <h3 className="text-lg font-bold text-slate-800 mb-1">No offers yet</h3>
                <p className="text-slate-500 text-sm font-medium">
                  Offers from buyers will appear here once your listings go Active.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {offers.map((offer, i) => (
                  <motion.div key={offer._id}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                    className="bg-white rounded-2xl border border-slate-200/60 shadow-md shadow-slate-200/40 p-6">

                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100 flex-shrink-0">
                          {offer.gem_id?.image_url ? (
                            <img src={offer.gem_id.image_url} alt="" className="w-full h-full object-cover rounded-xl" />
                          ) : (
                            <Diamond size={20} className="text-blue-600" strokeWidth={1.5} />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 font-serif">
                            {offer.gem_name || offer.gem_id?.name || "Gem"}
                          </h4>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">
                            From: <span className="font-bold text-slate-700">{offer.buyer_email}</span>
                          </p>
                          {offer.message && (
                            <p className="text-xs text-slate-500 mt-1 italic">"{offer.message}"</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${OFFER_STATUS[offer.status]}`}>
                          {offer.status}
                        </span>
                        {/* ── Chat button on offer card ── */}
                        <button
                          onClick={() => setActiveChatOffer(activeChatOffer?._id === offer._id ? null : offer)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs hover:bg-blue-50 hover:text-blue-600 transition-colors border border-slate-200">
                          <MessageCircle size={12} /> Chat
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Offered Price</p>
                        <p className="text-xl font-black text-blue-600">LKR {offer.offer_amount?.toLocaleString()}</p>
                        {offer.counter_amount && (
                          <p className="text-xs text-slate-500 mt-0.5">
                            Your counter: LKR {offer.counter_amount.toLocaleString()}
                          </p>
                        )}
                      </div>

                      {offer.status === "Pending" && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => handleOfferResponse(offer._id, "Accepted")}
                            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-500 transition-colors shadow-md shadow-emerald-500/20">
                            <CheckCircle size={13} /> Accept
                          </button>
                          <button
                            onClick={() => handleOfferResponse(offer._id, "Rejected")}
                            className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl font-bold text-xs hover:bg-red-100 transition-colors">
                            <XCircle size={13} /> Reject
                          </button>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              placeholder="Counter…"
                              value={counterInputs[offer._id] || ""}
                              onChange={e => setCounterInputs(p => ({ ...p, [offer._id]: e.target.value }))}
                              className="w-28 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                            />
                            <button
                              onClick={() => handleOfferResponse(offer._id, "Countered", counterInputs[offer._id])}
                              disabled={!counterInputs[offer._id]}
                              className="flex items-center gap-1 px-3 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-700 transition-colors disabled:opacity-40">
                              <MessageSquare size={12} /> Counter
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

        {/* ── CUSTOMIZE SHOP TAB ── */}
        {activeTab === "customize" && (
          <div className="space-y-5 pb-10">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-serif font-bold text-slate-900">Customize Your Shop</h2>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleSaveShopSettings}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/25 hover:bg-blue-500 transition-colors">
                <Save size={15}/> Save Settings
              </motion.button>
            </div>

            {/* 1 & 2: Banner + Logo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-md shadow-slate-200/40">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Globe size={12}/> Cover Banner</p>
                <div className="h-28 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 mb-3">
                  {bannerPreview
                    ? <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><Globe size={28} className="text-slate-300" /></div>}
                </div>
                <label className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 cursor-pointer hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all">
                  <Upload size={14}/> Upload Banner
                  <input type="file" accept="image/*" hidden onChange={e => { const f=e.target.files?.[0]; if(!f) return; setBannerFile(f); setBannerPreview(URL.createObjectURL(f)); }} />
                </label>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-md shadow-slate-200/40">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><BadgeCheck size={12}/> Shop Logo</p>
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 mb-3 mx-auto flex items-center justify-center">
                  {logoPreview
                    ? <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                    : <Diamond size={28} className="text-slate-300" />}
                </div>
                <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 cursor-pointer hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all">
                  <Upload size={14}/> Upload Logo
                  <input type="file" accept="image/*" hidden onChange={e => { const f=e.target.files?.[0]; if(!f) return; setLogoFile(f); setLogoPreview(URL.createObjectURL(f)); }} />
                </label>
              </div>
            </div>

            {/* 3: Theme */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-md shadow-slate-200/40">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Palette size={12}/> Store Theme</p>
              <div className="flex gap-4 flex-wrap">
                {[
                  { id: 'light',  label: 'Elegant Light',  cls: 'from-slate-50 to-white border-slate-200'         },
                  { id: 'dark',   label: 'Midnight Gem',   cls: 'from-slate-800 to-slate-900 border-slate-700'    },
                  { id: 'royal',  label: 'Classic Royal',  cls: 'from-amber-50 to-amber-100 border-amber-200'     },
                ].map(t => (
                  <button key={t.id} onClick={() => setShopSettings(s => ({ ...s, theme: t.id }))}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${ shopSettings.theme === t.id ? 'border-blue-500 shadow-lg shadow-blue-500/15' : 'border-slate-100 hover:border-slate-200'}`}>
                    <div className={`w-20 h-10 rounded-xl bg-gradient-to-br ${t.cls} border`} />
                    <span className="text-xs font-bold text-slate-700">{t.label}</span>
                    {shopSettings.theme === t.id && <CheckCircle size={14} className="text-blue-500" />}
                  </button>
                ))}
              </div>
            </div>

            {/* 4: Bio */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-md shadow-slate-200/40">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Shop Bio / Description</p>
              <textarea value={shopSettings.bio} onChange={e => setShopSettings(s => ({ ...s, bio: e.target.value }))}
                placeholder="Tell buyers who you are, your sourcing story, and what makes your gems special..."
                rows={4} maxLength={500}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 resize-none" />
              <p className="text-xs text-slate-400 mt-1 text-right">{shopSettings.bio?.length ?? 0}/500</p>
            </div>

            {/* 5: Business Hours */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-md shadow-slate-200/40">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Clock size={12}/> Business Hours & Availability</p>
              <div className="flex items-center gap-4 mb-4 flex-wrap">
                {[['businessHoursOpen','Opens'],['businessHoursClose','Closes']].map(([k,lbl]) => (
                  <div key={k}>
                    <label className="block text-xs font-bold text-slate-400 mb-1">{lbl}</label>
                    <input type="time" value={shopSettings[k]}
                      onChange={e => setShopSettings(s => ({ ...s, [k]: e.target.value }))}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
                  </div>
                ))}
              </div>
              <div className="flex gap-2 flex-wrap">
                {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
                  <button key={d}
                    onClick={() => setShopSettings(s => ({ ...s, businessDays: s.businessDays.includes(d) ? s.businessDays.filter(x => x !== d) : [...s.businessDays, d] }))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${ shopSettings.businessDays.includes(d) ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-200'}`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* 6: Featured Gems */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-md shadow-slate-200/40">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2"><Star size={12}/> Featured Gems</p>
              <p className="text-xs text-slate-400 mb-4">Pin up to 5 active listings to the top of your shop page.</p>
              {gems.filter(g => g.status === 'Active').length === 0
                ? <p className="text-sm text-slate-400 font-medium">No active listings yet.</p>
                : <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {gems.filter(g => g.status === 'Active').map(g => {
                      const isFeat = shopSettings.featuredGems.includes(g._id);
                      return (
                        <button key={g._id}
                          onClick={() => {
                            if (isFeat) setShopSettings(s => ({ ...s, featuredGems: s.featuredGems.filter(id => id !== g._id) }));
                            else if (shopSettings.featuredGems.length < 5) setShopSettings(s => ({ ...s, featuredGems: [...s.featuredGems, g._id] }));
                            else showToast('Maximum 5 featured gems allowed.');
                          }}
                          className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${ isFeat ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-200 bg-slate-50'}`}>
                          {g.image_url && <img src={g.image_url} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />}
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-900 truncate">{g.name}</p>
                            <p className="text-[10px] text-slate-400">{g.gem_type}</p>
                          </div>
                          {isFeat && <CheckCircle size={14} className="text-blue-500 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>}
            </div>

            {/* 7: Social Links */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-md shadow-slate-200/40">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Globe size={12}/> Social Links</p>
              <div className="space-y-3">
                {[
                  { key: 'socialWhatsApp',  label: 'WhatsApp Number',      placeholder: '+94 71 234 5678'               },
                  { key: 'socialInstagram', label: 'Instagram Profile URL', placeholder: 'https://instagram.com/...'   },
                  { key: 'socialLinkedIn',  label: 'LinkedIn Profile URL',  placeholder: 'https://linkedin.com/in/...' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-bold text-slate-500 mb-1">{f.label}</label>
                    <input type="text" value={shopSettings[f.key]}
                      onChange={e => setShopSettings(s => ({ ...s, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500" />
                  </div>
                ))}
              </div>
            </div>

            {/* 8: Policies */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-md shadow-slate-200/40">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Shop Policies & Refund Rules</p>
              <textarea value={shopSettings.policies} onChange={e => setShopSettings(s => ({ ...s, policies: e.target.value }))}
                placeholder="Describe your return policy, shipping terms, and buyer guarantees..."
                rows={4}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 resize-none" />
            </div>

            {/* 9: Badges */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-md shadow-slate-200/40">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><BadgeCheck size={12}/> Store Badges & Highlights</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {['Verified Ethically Sourced','GIA Certified Trader','NGJA Registered Seller','Premium Quality Guarantee'].map(badge => {
                  const active = shopSettings.badges.includes(badge);
                  return (
                    <button key={badge}
                      onClick={() => setShopSettings(s => ({ ...s, badges: active ? s.badges.filter(b => b !== badge) : [...s.badges, badge] }))}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${ active ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 hover:border-emerald-200 bg-slate-50'}`}>
                      <BadgeCheck size={18} className={active ? 'text-emerald-500' : 'text-slate-300'} />
                      <span className={`text-sm font-bold ${ active ? 'text-emerald-700' : 'text-slate-600'}`}>{badge}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 10: Welcome Note */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-md shadow-slate-200/40">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2"><MessageCircle size={12}/> Welcome Note</p>
              <p className="text-xs text-slate-400 mb-3">A dismissible banner shown to first-time visitors on your public shop page.</p>
              <input type="text" value={shopSettings.welcomeNote}
                onChange={e => setShopSettings(s => ({ ...s, welcomeNote: e.target.value }))}
                placeholder="e.g. Welcome! Browse our ethically sourced Ceylon sapphires — use code GEMS10 for 10% off."
                maxLength={200}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500" />
              <p className="text-xs text-slate-400 mt-1 text-right">{shopSettings.welcomeNote?.length ?? 0}/200</p>
            </div>

            {/* Bottom save */}
            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              onClick={handleSaveShopSettings}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-500/25 hover:bg-blue-500 transition-colors flex items-center justify-center gap-2">
              <Save size={16}/> Save All Shop Settings
            </motion.button>
          </div>
        )}

      {/* ── Floating ChatWindow (opened from offer card) ── */}
      <AnimatePresence>
        {activeChatOffer && (
          <ChatWindow
            gem={buildChatGem(activeChatOffer)}
            onClose={() => setActiveChatOffer(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── JWT decode helper ─────────────────────────────────────────────────────────
function parseJwt(token) {
  try { return JSON.parse(atob(token.split(".")[1])); }
  catch { return null; }
}