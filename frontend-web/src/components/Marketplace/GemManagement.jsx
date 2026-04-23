import React, { useEffect, useState } from 'react';
import { getGemstones } from '../../services/api';
import GemCard from './GemCard';
import SkeletonCard from './SkeletonCard';

export default function GemManagement() {
  const [gems, setGems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getGemstones()
      .then(setGems)
      .catch(() => setGems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-6 text-slate-900">Gem Management</h2>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : gems.length === 0 ? (
        <div className="text-slate-400 text-center py-12">No gems found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {gems.map(gem => <GemCard key={gem._id || gem.id} gem={gem} />)}
        </div>
      )}
    </div>
  );
}
