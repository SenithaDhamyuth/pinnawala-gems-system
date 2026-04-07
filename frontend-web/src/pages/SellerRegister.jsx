import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { uploadKYC } from "../services/api";
import { ShieldCheck, Store, FileText, CheckCircle2, ArrowRight } from "lucide-react";

export default function SellerRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ shop_name: "", document_id: "", file: null });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!localStorage.getItem("token")) {
        const msg = "Please register as a user first before applying for seller status!";
        setMessage(msg);
        toast.error(msg);
        setLoading(false);
        return;
      }
      if (!formData.shop_name?.trim() || !formData.document_id?.trim()) {
        const msg = "Shop name and document ID are required.";
        setMessage(msg);
        toast.error(msg);
        setLoading(false);
        return;
      }
      if (!formData.file) {
        const msg = "Please upload a verification document.";
        setMessage(msg);
        toast.error(msg);
        setLoading(false);
        return;
      }
      
      const fd = new FormData();
      fd.append("shop_name", formData.shop_name);
      fd.append("document_id", formData.document_id);
      if (formData.file) fd.append("document", formData.file);

      await uploadKYC(fd);
      setMessage("KYC submitted successfully! Waiting for Admin approval.");
      toast.success("KYC submitted successfully.");
      setTimeout(() => navigate("/seller"), 3000);
    } catch (err) {
      const msg = err.response?.data?.message || "Error submitting KYC. Please ensure you are logged in.";
      setMessage(msg);
      toast.error(msg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4FF] py-20 px-6 relative overflow-hidden flex items-center justify-center">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-400/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-400/10 blur-[120px] rounded-full"></div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="max-w-xl w-full relative z-10"
      >
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-blue-500/30 mb-6 border border-white/20 backdrop-blur-md">
            <ShieldCheck size={40} className="text-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl font-serif font-bold text-slate-900 mb-4 tracking-tight">Become a Verified Seller</h1>
          <p className="text-slate-600 font-medium text-lg leading-relaxed">
            Pinnawala Gems rigorously vets all merchants to maintain the integrity of our marketplace. Submit your business credentials below.
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-[32px] p-10 shadow-2xl shadow-slate-200/50 border border-white">
          {message ? (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-10">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} className="text-emerald-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2 font-serif">{message.includes('successfully') ? "Application Received" : "Notice"}</h3>
              <p className="text-slate-500 font-medium">{message}</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Shop details</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Store size={20} className="text-slate-400" />
                  </div>
                  <input required placeholder="Registered Shop Name" value={formData.shop_name} onChange={e => setFormData({...formData, shop_name: e.target.value})} className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-5 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 font-medium transition-all shadow-sm" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Verification Document</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <FileText size={20} className="text-slate-400" />
                  </div>
                  <input required placeholder="Business Registration Number (BR)" value={formData.document_id} onChange={e => setFormData({...formData, document_id: e.target.value})} className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-5 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 font-medium transition-all shadow-sm" />
                </div>
                <p className="text-xs text-slate-500 mt-3 flex items-center gap-1.5 font-medium ml-1">
                  <ShieldCheck size={14} className="text-blue-500" /> Information is securely encrypted and manually verified.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Upload ID / License (JPG/PNG/PDF)</label>
                <input 
                  type="file" 
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={e => setFormData({...formData, file: e.target.files[0]})}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all"
                />
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }} 
                type="submit" 
                disabled={loading}
                className="w-full py-4.5 mt-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-blue-500/30 hover:shadow-blue-500/40 transition-all disabled:opacity-70 text-lg"
              >
                {loading ? "Submitting..." : "Submit Application"}
                {!loading && <ArrowRight size={20} />}
              </motion.button>
            </form>
          )}
        </div>
        
        <div className="mt-8 text-center text-sm font-medium text-slate-500">
           Need to manage previous listings? <button onClick={() => navigate('/seller')} className="font-bold text-blue-600 hover:text-blue-500">Go to Dashboard</button>
        </div>
      </motion.div>
    </div>
  );
}