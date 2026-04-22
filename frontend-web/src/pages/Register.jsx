import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Diamond, Mail, Lock, User, ArrowRight, Home } from "lucide-react";
import axios from "axios";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ full_name: "", email: "", password: "", role: "buyer" });
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    const fullName = formData.full_name?.trim();
    const email = formData.email?.trim();
    const password = formData.password || "";
    if (!fullName || !email || !password) {
      const msg = "Name, email and password are required.";
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }
    if (password.length < 6) {
      const msg = "Password must be at least 6 characters.";
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }
    setLoading(true);

    try {
      const { data } = await axios.post("http://localhost:5001/api/auth/register", formData);
      
      if(data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("userRole", data.role);
        localStorage.setItem("name", data.name);
        try {
          const decoded = JSON.parse(atob(data.token.split('.')[1]));
          localStorage.setItem("userId", decoded.id);
        } catch(e) {}
        
        toast.success("Account created successfully!");
        if (data.role === "admin") navigate("/admin");
        else if (data.role === "seller") navigate("/seller");
        else navigate("/buyer");
      } else {
        navigate("/login", { state: { message: "Account created! Please log in." } });
      }
    } catch (err) {
      console.error("[Register Error]", err.response?.data || err.message || err);
      const backendMsg = err.response?.data?.message || "";
      if (backendMsg.toLowerCase().includes("already")) {
        const msg = "This email is already taken. Please login or use another email.";
        setErrorMsg(msg);
        toast.error(msg);
      } else {
        const msg = backendMsg || "Registration failed. Please try again.";
        setErrorMsg(msg);
        toast.error(msg);
      }
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
          <h1 className="text-3xl font-serif font-bold text-slate-900">Get Started</h1>
          <p className="text-slate-500 font-medium mt-2">Join the world's finest gem marketplace</p>
        </div>

        <div className="bg-white rounded-[32px] p-8 sm:p-10 shadow-2xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500"></div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Display Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User size={18} className="text-slate-400" />
                </div>
                <input required type="text" placeholder="John Doe" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 font-medium transition-all" />
              </div>
            </div>

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

            {/* Account Type Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Account Type</label>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  type="button" 
                  onClick={() => setFormData({...formData, role: 'buyer'})}
                  className={`py-3 rounded-xl font-bold text-sm border transition-all ${formData.role === 'buyer' ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300'}`}
                >
                  Buyer
                </button>
                <button 
                  type="button" 
                  onClick={() => setFormData({...formData, role: 'seller'})}
                  className={`py-3 rounded-xl font-bold text-sm border transition-all ${formData.role === 'seller' ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300'}`}
                >
                  Seller
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-4 rounded-xl bg-red-50 text-red-600 border border-red-100 text-sm font-bold">
                {errorMsg}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 mt-2 bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 hover:bg-emerald-500 transition-all disabled:opacity-70"
            >
              {loading ? "Creating..." : "Create Account"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-slate-100 pt-6">
            <p className="text-sm font-medium text-slate-600">
              Already have an account?
              <Link to="/login" className="ml-2 font-bold text-blue-600 hover:text-blue-500">Log in instead</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
