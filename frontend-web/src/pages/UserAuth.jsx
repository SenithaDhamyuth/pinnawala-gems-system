import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { registerUser, loginUser } from "../services/api";
import { Diamond, Mail, Lock, User, ArrowRight, ShieldCheck } from "lucide-react";

export default function UserAuth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ full_name: "", email: "", password: "" });
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      if (isLogin) {
        const res = await loginUser({ email: formData.email, password: formData.password });
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", res.data.role);
        localStorage.setItem("name", res.data.name);

        if (res.data.role === "admin") navigate("/admin");
        else if (res.data.role === "seller") navigate("/seller");
        else navigate("/home");
      } else {
        await registerUser(formData);
        setIsLogin(true);
        setFormData({ full_name: "", email: "", password: "" });
        setErrorMsg("Registration successful! Please log in.");
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left side - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900 justify-center items-center">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1599643477874-a0ab4eab38dc?q=80&w=2000&auto=format&fit=crop" 
            alt="Gem Background" 
            className="w-full h-full object-cover opacity-40 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
        </div>
        
        <div className="relative z-10 text-center px-12 max-w-xl">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl mx-auto flex items-center justify-center mb-8 border border-white/20">
              <Diamond size={40} className="text-white" strokeWidth={1.5} />
            </div>
            <h1 className="text-4xl font-serif font-bold text-white mb-6 leading-tight">Access the Global Standard of Gemstones</h1>
            <p className="text-slate-300 text-lg font-medium leading-relaxed">Join the world's most exclusive marketplace for authenticated, premium Sri Lankan sapphires and rubies.</p>
          </motion.div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-[#F9FAFB]">
        <div className="w-full max-w-md">
          {/* Mobile-only branding */}
          <div className="lg:hidden text-center mb-10">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
              <Diamond size={32} className="text-white" strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-serif font-bold text-slate-900">Pinnawala Gems</h1>
          </div>

          <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-2xl shadow-slate-200/50 border border-slate-100">
            <h2 className="text-2xl font-bold font-serif text-slate-900 mb-2">
              {isLogin ? "Welcome back" : "Create an account"}
            </h2>
            <p className="text-sm font-medium text-slate-500 mb-8">
              {isLogin ? "Enter your core details to access your dashboard." : "Register to start exploring the curated collection."}
            </p>

            <AnimatePresence mode="wait">
              <motion.div
                key={isLogin ? 'login' : 'register'}
                initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
                transition={{ duration: 0.2 }}
              >
                <form onSubmit={handleSubmit} className="space-y-5">
                  {!isLogin && (
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Full Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <User size={18} className="text-slate-400" />
                        </div>
                        <input required type="text" placeholder="John Doe" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 font-medium transition-all" />
                      </div>
                    </div>
                  )}

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
                    <div className={`p-4 rounded-xl text-sm font-bold ${errorMsg.includes('successful') ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                      {errorMsg}
                    </div>
                  )}

                  <motion.button 
                    whileHover={{ scale: 1.02 }} 
                    whileTap={{ scale: 0.98 }} 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-4 mt-2 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 hover:bg-blue-500 transition-all disabled:opacity-70"
                  >
                    {loading ? "Processing..." : (isLogin ? "Sign In to Account" : "Create Account")}
                    {!loading && <ArrowRight size={18} />}
                  </motion.button>
                </form>
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 text-center border-t border-slate-100 pt-6">
              <p className="text-sm font-medium text-slate-600">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button 
                  onClick={() => { setIsLogin(!isLogin); setErrorMsg(""); setFormData({ full_name: "", email: "", password: "" }); }} 
                  className="ml-2 font-bold text-blue-600 hover:text-blue-500 transition-colors"
                >
                  {isLogin ? "Sign up here" : "Sign in instead"}
                </button>
              </p>
            </div>
            
            <div className="mt-6 text-center">
                <button onClick={() => navigate('/home')} className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors flex items-center justify-center gap-1 mx-auto">
                    <ShieldCheck size={14} /> Back to Homepage
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}