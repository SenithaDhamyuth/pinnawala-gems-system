import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="relative isolate overflow-hidden bg-white min-h-screen font-sans">
      {/* Background Decor */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#004AAD] to-[#00B4D8] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
      </div>

      {/* Hero Section */}
      <div className="mx-auto max-w-7xl pt-20 pb-32 sm:pt-32 lg:flex lg:items-center lg:gap-x-10 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8 px-6 lg:px-0"
        >
          <div className="mt-24 sm:mt-32 lg:mt-16">
            <span className="rounded-full bg-blue-50 px-4 py-1.5 text-xs font-black leading-6 text-[#004AAD] tracking-widest uppercase ring-1 ring-inset ring-blue-600/20 shadow-sm">
              The Standard of Excellence
            </span>
          </div>
          <h1 className="mt-8 text-5xl font-black tracking-tight text-slate-900 sm:text-6xl leading-tight">
            Discover Earth's Most <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#004AAD] to-[#00B4D8]">Exquisite Treasures</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600 font-medium">
            Join a curated marketplace for authenticated, premium Sri Lankan gemstones. Directly source the finest sapphires and rubies to the global market, backed by our proprietary AI valuation engine.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/marketplace')} 
              className="rounded-xl bg-gradient-to-r from-[#004AAD] to-[#00B4D8] px-8 py-4 text-sm font-bold text-white shadow-lg shadow-blue-500/30 hover:opacity-90 transition-all cursor-pointer"
            >
              Explore Collection
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/seller-register')} 
              className="text-sm font-bold leading-6 text-slate-700 px-8 py-4 rounded-xl border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm cursor-pointer"
            >
              Become a Verified Seller <span aria-hidden="true">→</span>
            </motion.button>
          </div>
        </motion.div>
        
        {/* Hero Image */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-32 px-6 lg:px-0"
        >
          <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none relative group">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-r from-[#004AAD] to-[#00B4D8] opacity-20 blur-2xl group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative rounded-2xl bg-white p-2 ring-1 ring-inset ring-slate-900/10 lg:-m-4 lg:rounded-[2rem] lg:p-4 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1615367610057-0a373b75af4c?q=80&w=2000&auto=format&fit=crop"
                alt="Blue Sapphire"
                className="w-[45rem] rounded-xl shadow-2xl ring-1 ring-slate-900/10 object-cover aspect-[4/3] relative z-10"
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Feature Section Placeholder (Ensuring valid syntax) */}
      <div className="bg-slate-50 py-24 sm:py-32 border-t border-slate-100">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-black text-slate-900 sm:text-4xl">Secure, Transparent, and Professional</h2>
            <p className="mt-4 text-lg text-slate-600 font-medium max-w-2xl mx-auto">Experience the future of gem trading with our advanced platform features.</p>
        </div>
      </div>
    </div>
  );
}