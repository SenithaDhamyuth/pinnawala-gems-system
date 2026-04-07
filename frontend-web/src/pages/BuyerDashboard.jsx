import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";
import {
  getBuyerOffers, acceptCounter,
} from "../services/api";
import {
  ShoppingBag, LogOut, ArrowRight, Diamond,
  Inbox, RefreshCw, CheckCircle, XCircle, MessageCircle,
  Clock, ShieldCheck, Tag,
} from "lucide-react";
import ChatWindow from "../components/ChatWindow";
import NotificationBell from "../components/NotificationBell";

const SOCKET_URL = "http://localhost:5001";

const OFFER_STATUS = {
  Pending:   "bg-amber-100 text-amber-700",
  Accepted:  "bg-emerald-100 text-emerald-700",
  Rejected:  "bg-red-100 text-red-700",
  Countered: "bg-blue-100 text-blue-700",
};

export default function BuyerDashboard() {
  const navigate = useNavigate();
  const [offers,       setOffers]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [toast,        setToast]        = useState("");
  const [activeChatOffer, setActiveChatOffer] = useState(null);
  const [newUpdateAlert, setNewUpdateAlert]   = useState(false);

  const socketRef = useRef(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const loadOffers = async () => {
    try {
      const data = await getBuyerOffers();
      setOffers(Array.isArray(data) ? data : []);
    } catch { showToast("Failed to load offers."); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const role  = localStorage.getItem("role");
    const token = localStorage.getItem("token");
    if (role !== "buyer" || !token) { navigate("/"); return; }
    loadOffers();
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      // Backend automatically joins user's personal room on connection.
    });

    socket.on("new_counter", () => {
      setNewUpdateAlert(true);
      loadOffers();
      showToast("📩 New counter-offer received!");
    });

    socket.on("cart_update", () => {
      loadOffers();
      showToast("✨ Your offer was accepted!");
    });

    return () => socket.disconnect();
  }, []);

  const handleAcceptCounter = async (offerId) => {
    try {
      await acceptCounter(offerId);
      showToast("Counter-offer accepted! Item added to cart.");
      loadOffers();
    } catch { showToast("Failed to accept counter."); }
  };

  const buildChatGem = (offer) => ({
    _id:       offer.gem_id?._id || offer.gem_id,
    name:      offer.gem_name || "Gemstone",
    seller_id: offer.seller_id,
    image_url: offer.gem_id?.image_url || "",
  });

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl text-sm font-semibold flex items-center gap-2">
            <CheckCircle size={16} className="text-emerald-400" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="bg-white/70 backdrop-blur-xl border-b border-white/20 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-500/20 text-white">
              <ShoppingBag size={22} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold text-slate-900 leading-tight tracking-tight">Privilege Account</h1>
              <div className="flex items-center gap-1.5 pt-0.5">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Member</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <button onClick={() => navigate("/marketplace")}
              className="flex items-center gap-2 px-6 py-3 text-sm font-black text-blue-600 hover:bg-blue-50 rounded-2xl transition-all active:scale-95 group">
              Return to Marketplace <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => { localStorage.clear(); navigate("/"); }}
              className="p-3 text-red-500 hover:bg-red-50 rounded-2xl transition-all active:scale-95 border border-transparent hover:border-red-100">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
           <h2 className="text-2xl font-serif font-bold text-slate-900">Your Offers</h2>
           {newUpdateAlert && <span className="bg-blue-100 text-blue-600 text-xs font-bold px-3 py-1 rounded-full animate-pulse">New Updates</span>}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><RefreshCw size={28} className="text-blue-200 animate-spin" /></div>
        ) : offers.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 py-24 flex flex-col items-center text-center shadow-sm">
            <Inbox size={48} className="text-slate-200 mb-4" strokeWidth={1} />
            <h3 className="text-lg font-bold text-slate-800 mb-1">No active offers</h3>
            <p className="text-slate-500 text-sm max-w-xs">Items you negotiate in the marketplace will appear here.</p>
            <button onClick={() => navigate("/marketplace")} className="mt-6 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20">Go to Marketplace</button>
          </div>
        ) : (
          <div className="grid gap-4">
            {offers.map((offer, i) => (
              <motion.div key={offer._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                   <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 overflow-hidden">
                        {offer.gem_id?.image_url ? (
                          <img src={offer.gem_id.image_url} alt="" className="w-full h-full object-cover" />
                        ) : <Diamond size={24} className="text-slate-200" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 font-serif text-lg">{offer.gem_name}</h4>
                        <p className="text-xs text-slate-400 font-medium">Asking: LKR {offer.gem_id?.base_price?.toLocaleString() || "—"}</p>
                      </div>
                   </div>
                   <div className="flex flex-col items-end gap-2 text-right">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-current ${OFFER_STATUS[offer.status]}`}>
                        <span className="flex items-center gap-1">{offer.status === 'Countered' ? <RefreshCw size={10} /> : <Clock size={10} />} {offer.status}</span>
                      </span>
                      <button onClick={() => setActiveChatOffer(offer)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-xs font-bold transition-all border border-slate-100">
                        <MessageCircle size={14} /> Open Chat
                      </button>
                   </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-50 flex items-end justify-between">
                   <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Your Last Offer</p>
                      <p className={`text-xl font-black ${offer.status === 'Accepted' ? 'text-emerald-600' : 'text-slate-900'}`}>LKR {offer.offer_amount?.toLocaleString()}</p>
                   </div>
                   
                   {offer.status === 'Countered' && (
                     <div className="flex flex-col items-end gap-2 animate-in fade-in slide-in-from-right-4">
                        <p className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">Seller Countered: LKR {offer.counter_amount?.toLocaleString()}</p>
                        <div className="flex items-center gap-2">
                           <button onClick={() => handleAcceptCounter(offer._id)}
                             className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-colors flex items-center gap-2">
                             <CheckCircle size={14} /> Accept Counter
                           </button>
                        </div>
                     </div>
                   )}

                   {offer.status === 'Accepted' && (
                     <div className="flex flex-col items-end gap-2 animate-in fade-in slide-in-from-right-4">
                        <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-100 flex items-center justify-center gap-2 font-bold text-sm w-full">
                           <CheckCircle size={16} /> Deal Accepted
                        </div>
                        <button
                           onClick={() => navigate('/payment', { state: { gem: { _id: offer.gem_id?._id || offer.gem_id, name: offer.gem_name, base_price: offer.offer_amount, image_url: offer.gem_id?.image_url, offer_id: offer._id } } })}
                           className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-95"
                        >
                           Proceed to Pay LKR {offer.offer_amount?.toLocaleString()} <ArrowRight size={14} />
                        </button>
                     </div>
                   )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {activeChatOffer && (
          <ChatWindow gem={buildChatGem(activeChatOffer)} onClose={() => setActiveChatOffer(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function parseJwt(token) {
  try { return JSON.parse(atob(token.split(".")[1])); }
  catch { return null; }
}
