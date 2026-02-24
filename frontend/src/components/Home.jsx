import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Diamond, Sparkles, Box, ShoppingBag, Hammer, 
  CalendarCheck, ShieldCheck, ArrowRight, Activity 
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  // Animation Variants for smooth staggered reveals
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] } }
  };

  const modules = [
    { title: 'AI Prediction Engine', desc: 'Neural network-based preliminary gemstone identification.', icon: <Activity size={32} />, path: '/ai-engine' },
    { title: 'Smart Inventory', desc: 'Track stock, specifications, and dynamic market values.', icon: <Box size={32} />, path: '/inventory' },
    { title: 'Hybrid Marketplace', desc: 'Direct buy and smart negotiations connecting physical markets.', icon: <ShoppingBag size={32} />, path: '/marketplace' },
    { title: 'Live Bidding', desc: 'Real-time interactive auctions with immutable bidding histories.', icon: <Hammer size={32} />, path: '/bidding' },
    { title: 'Expert Appointments', desc: 'Secure physical inspection bookings with certified gemologists.', icon: <CalendarCheck size={32} />, path: '/appointments' },
    { title: 'Trust & Verification', desc: 'KYC protocols, role-based access, and seller merit ratings.', icon: <ShieldCheck size={32} />, path: '/users' }
  ];

  return (
    <div className="bg-[#01030a] min-h-screen text-slate-200 font-sans selection:bg-cyan-500/30 overflow-x-hidden">
      
      {/* 1. ULTRA-PREMIUM HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
        
        {/* Ambient Glow Effects (The Engine of the visual) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse pointer-events-none"></div>
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-16"
        >
          {/* Left: Typography & Call to Action */}
          <div className="flex-1 text-left">
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 backdrop-blur-md mb-8">
              <Sparkles className="text-cyan-400" size={16} />
              <span className="text-sm font-medium tracking-widest text-blue-200 uppercase">Project WE-AI-01-G07</span>
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[1.1] mb-6">
              The Future of <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600">
                Gemology
              </span>
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-lg sm:text-xl text-slate-400 font-light max-w-xl mb-10 leading-relaxed">
              Bridging traditional Sri Lankan craftsmanship with cutting-edge AI. A centralized, trust-driven digital ecosystem for gemstone identification and trading.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-6">
              <button 
                onClick={() => navigate('/ai-engine')}
                className="group relative px-8 py-4 bg-white text-slate-950 font-bold rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-cyan-300 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10 flex items-center gap-2 group-hover:text-white transition-colors">
                  Launch AI Engine <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
              
              <button 
                onClick={() => document.getElementById('modules').scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 rounded-full font-semibold text-slate-300 border border-slate-700 hover:border-cyan-500/50 hover:bg-blue-900/10 transition-all backdrop-blur-sm"
              >
                Explore Modules
              </button>
            </motion.div>
          </div>

          {/* Right: The Floating 3D-like Gem Construct */}
          <motion.div 
            variants={itemVariants}
            className="flex-1 flex justify-center lg:justify-end w-full relative"
          >
            <motion.div 
              animate={{ 
                y: [0, -20, 0],
                rotateZ: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 6, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="relative w-72 h-72 sm:w-96 sm:h-96 flex items-center justify-center"
            >
              {/* Outer Glowing Rings */}
              <div className="absolute inset-0 border border-blue-500/20 rounded-full animate-[spin_10s_linear_infinite]"></div>
              <div className="absolute inset-8 border border-cyan-400/20 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
              
              {/* Center Gem */}
              <div className="relative z-10 bg-gradient-to-br from-blue-900/80 to-slate-900/80 p-8 rounded-3xl border border-blue-500/30 backdrop-blur-xl shadow-[0_0_50px_rgba(37,99,235,0.3)]">
                <Diamond size={120} strokeWidth={1} className="text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.8)]" />
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* 2. THE VISION (Cinematic Wide Panel) */}
      <section className="py-24 px-6 relative border-y border-white/5 bg-[#030712]/50">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1 }}
          >
            <h2 className="text-sm font-bold tracking-[0.3em] text-blue-500 uppercase mb-8">The Vision</h2>
            <p className="text-3xl sm:text-4xl lg:text-5xl font-light leading-tight text-slate-200">
              Transforming the fragmented gem trade into a <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 font-semibold">centralized, secure ecosystem</span>. We don't just identify gems; we build trust.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 3. CORE MODULES (High-End Glassmorphism Grid) */}
      <section id="modules" className="py-40 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-6"
          >
            <div>
              <h2 className="text-sm font-bold tracking-[0.3em] text-cyan-500 uppercase mb-4">Architecture</h2>
              <h3 className="text-4xl sm:text-5xl font-black text-white">System Subsystems</h3>
            </div>
            <p className="text-slate-400 max-w-md">
              A highly modular, scalable architecture seamlessly integrating Machine Learning with robust web technologies.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {modules.map((mod, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                onClick={() => navigate(mod.path)}
                className="group relative h-full p-1 rounded-3xl bg-gradient-to-b from-white/10 to-transparent hover:from-cyan-500/50 transition-colors duration-500 cursor-pointer"
              >
                {/* The "Glass" Card */}
                <div className="h-full bg-[#050b1a] p-8 rounded-[calc(1.5rem-1px)] border border-white/5 backdrop-blur-2xl overflow-hidden relative z-10 flex flex-col">
                  
                  {/* Subtle hover background glow */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <div className="mb-8 p-4 bg-blue-900/20 w-fit rounded-2xl border border-blue-500/20 text-blue-400 group-hover:text-cyan-300 group-hover:bg-blue-800/40 transition-all duration-300">
                    {mod.icon}
                  </div>
                  
                  <h4 className="text-2xl font-bold mb-4 text-slate-100">{mod.title}</h4>
                  <p className="text-slate-400 leading-relaxed font-light flex-grow">
                    {mod.desc}
                  </p>

                  <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-blue-500 group-hover:text-cyan-400 transition-colors">
                    Explore Module <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform duration-300" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 border-t border-white/5 text-center text-slate-500 text-sm font-light">
        <p className="tracking-widest mb-2 text-slate-400 uppercase">Sri Lanka Institute of Information Technology</p>
        <p>&copy; 2026 Pinnawala Gems AI. Group WE-AI-01-G07.</p>
      </footer>
    </div>
  );
};

export default Home;