import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="relative isolate overflow-hidden bg-white min-h-screen">
      {/* Background Decor */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#10B981] to-[#2563EB] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
      </div>

      <nav className="flex items-center justify-between p-6 lg:px-12 bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <motion.div initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} className="flex lg:flex-1">
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500 font-serif tracking-tight">Pinnawala Gems</span>
        </motion.div>
        <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} className="hidden lg:flex lg:gap-x-8">
          <button onClick={() => navigate('/marketplace')} className="text-sm font-semibold leading-6 text-gray-900 hover:text-blue-600 transition-colors">Marketplace</button>
          <button onClick={() => navigate('/ai-engine')} className="text-sm font-semibold leading-6 text-gray-900 hover:text-blue-600 transition-colors">AI Valuation</button>
          {localStorage.getItem('token') ? (
            <button 
              onClick={() => {
                const role = localStorage.getItem('role');
                if (role === 'admin') navigate('/admin');
                else if (role === 'seller') navigate('/seller');
                else navigate('/buyer');
              }} 
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-blue-500 transition-all"
            >
              My Dashboard
            </button>
          ) : (
            <button onClick={() => navigate('/')} className="text-sm font-semibold leading-6 text-gray-900 hover:text-blue-600 transition-colors">Sign In <span aria-hidden="true">&rarr;</span></button>
          )}
        </motion.div>
      </nav>

      <div className="mx-auto max-w-7xl pt-20 pb-32 sm:pt-32 lg:flex lg:items-center lg:gap-x-10 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8"
        >
          <div className="mt-24 sm:mt-32 lg:mt-16">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold leading-6 text-blue-700 tracking-wider uppercase ring-1 ring-inset ring-blue-600/20 shadow-sm shadow-blue-500/10">
              The Standard of Excellence
            </span>
          </div>
          <h1 className="mt-8 text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl font-serif leading-tight">
            Discover Earth's Most Exquisite Treasures
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600 font-medium">
            Join a curated marketplace for authenticated, premium gemstones. Directly source Sri Lanka's finest sapphires and rubies to the global market, backed by our proprietary AI valuation engine.
          </p>
          <div className="mt-10 flex items-center gap-x-6">
            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/marketplace')} 
              className="rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all cursor-pointer"
            >
              Explore Collection
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/seller-register')} 
              className="text-sm font-semibold leading-6 text-slate-900 px-6 py-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
            >
              Become a Verified Seller <span aria-hidden="true">→</span>
            </motion.button>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-32"
        >
          <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none relative group">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-500 to-emerald-400 opacity-30 blur-2xl group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative rounded-2xl bg-white p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-3xl lg:p-4 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1615367610057-0a373b75af4c?q=80&w=2000&auto=format&fit=crop"
                alt="Blue Sapphire"
                className="w-[45rem] rounded-xl shadow-2xl ring-1 ring-gray-900/10 object-cover aspect-[4/3] relative z-10"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}