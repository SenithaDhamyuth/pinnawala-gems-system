import { motion } from 'framer-motion';
import { Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ShopDirectoryFooter({ sellers }) {
  const navigate = useNavigate();

  if (!sellers || sellers.length === 0) return null;

  return (
    <footer className="bg-white border-t border-slate-100 py-16 mt-20">
      <div className="max-w-screen-xl mx-auto px-6">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl font-serif font-bold text-slate-900">Partner Shop Directory</h2>
            <p className="text-sm text-slate-500 font-medium mt-1">Discover verified independent gemstone sellers</p>
          </div>
          <div className="flex gap-2">
            <span className="w-2 h-2 bg-blue-600 rounded-full" />
            <span className="w-2 h-2 bg-slate-200 rounded-full" />
            <span className="w-2 h-2 bg-slate-200 rounded-full" />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {sellers.map((seller) => (
            <motion.div
              key={seller._id}
              whileHover={{ y: -8 }}
              onClick={() => navigate(`/shop/${seller._id}`)}
              className="bg-slate-50/50 rounded-[28px] p-6 border border-slate-100 hover:border-blue-200 hover:bg-white transition-all cursor-pointer group text-center"
            >
              <div className="w-16 h-16 bg-white rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-sm border border-slate-50 overflow-hidden group-hover:shadow-lg transition-all">
                {seller.shopLogo ? (
                  <img src={seller.shopLogo} className="w-full h-full object-cover" alt="Shop Logo" />
                ) : (
                  <Building2 className="text-slate-300" size={24} />
                )}
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{seller.shopName || 'Verified Shop'}</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{seller.gems_count || 0} Listings</p>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-16 pt-8 border-t border-slate-50 text-center">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">© 2026 Pinnawala Gems Ltd. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
