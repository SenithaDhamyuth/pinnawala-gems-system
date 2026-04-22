import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { loginUser } from "../services/api";
import { Diamond, Mail, Lock, ArrowRight, ShieldAlert, Home } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    const email = formData.email?.trim();
    const password = formData.password?.trim();
    if (!email || !password) {
      const msg = "Email and password are required.";
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }
    setLoading(true);

    try {
      const data = await loginUser(formData);
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("userRole", data.role);
      localStorage.setItem("name", data.name);
      localStorage.setItem("kycStatus", data.kycStatus || "Pending");
      try {
        const decoded = JSON.parse(atob(data.token.split('.')[1]));
        localStorage.setItem("userId", decoded.id);
      } catch (e) {}

      // Role-based redirection
      if (data.role === "admin") navigate("/admin");
      else if (data.role === "seller") navigate("/seller");
      else navigate("/buyer");
    } catch (err) {
      console.error("[Login Error]", err.response?.data || err.message || err);
      const msg = err.response?.data?.message || "Login failed. Please check your credentials and try again.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400/10 blur-[100px] rounded-full"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-400/10 blur-[100px] rounded-full"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="w-full max-w-md relative z-10"
      >
        <div className="absolute top-[-40px] left-0">
          <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-medium text-sm">
            <Home size={16} /> Back to Home
          </Link>
        </div>
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
            <Diamond size={32} className="text-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-serif font-bold text-slate-900">Pinnawala Gems</h1>
          <p className="text-slate-500 font-medium mt-2">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-[32px] p-8 sm:p-10 shadow-2xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600"></div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={18} className="text-slate-400" />
                </div>
                <input required type="email" placeholder="you@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 font-medium transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-slate-400" />
                </div>
                <input required type="password" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 font-medium transition-all" />
              </div>
            </div>

            {errorMsg && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-4 rounded-xl bg-red-50 text-red-600 border border-red-100 flex items-center gap-3">
                <ShieldAlert size={20} />
                <span className="text-sm font-bold">{errorMsg}</span>
              </motion.div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 hover:bg-blue-500 transition-all disabled:opacity-70"
            >
              {loading ? "Authorizing..." : "Log In to Portal"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-slate-100 pt-6">
            <p className="text-sm font-medium text-slate-600">
              New to the platform?
              <Link to="/register" className="ml-2 font-bold text-blue-600 hover:text-blue-500">Create an account</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
