import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { getImageUrl } from '../../utils/imageUtil';

export default function AdvertisementCard({ ad }) {
  const handleClick = () => {
    if (ad.link_url) {
      window.open(ad.link_url.startsWith('http') ? ad.link_url : '//' + ad.link_url, '_blank');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="group relative w-full overflow-hidden rounded-2xl cursor-pointer shadow-lg hover:shadow-2xl transition-all"
      onClick={handleClick}
    >
      {/* Image Container */}
      <div className="relative h-64 sm:h-72 md:h-80 overflow-hidden bg-slate-200">
        <img
          src={getImageUrl(ad.image_url)}
          alt={ad.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
        
        {/* Ad Badge */}
        <div className="absolute top-3 left-3">
          <span className="inline-block px-3 py-1 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 rounded-full text-xs font-black uppercase tracking-wider">
            ✨ Featured
          </span>
        </div>

        {/* Content at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:underline">
            {ad.title}
          </h3>
          
          {ad.link_url && (
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-300 opacity-0 group-hover:opacity-100 transition-opacity">
              Learn More
              <ExternalLink size={14} />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
