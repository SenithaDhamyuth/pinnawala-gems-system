import React, { useEffect, useState } from 'react';
import { getBuyerOffers, acceptCounter } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../utils/imageUtil';

const statusColors = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Accepted: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
  Countered: 'bg-blue-100 text-blue-800',
};

export default function MyOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const navigate = useNavigate();

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const data = await getBuyerOffers();
      setOffers(data);
      setError(null);
    } catch (err) {
      setError('Failed to load offers.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleAcceptCounter = async (offerId) => {
    setActionLoading(offerId);
    try {
      await acceptCounter(offerId);
      fetchOffers();
    } catch (err) {
      alert('Failed to accept counter offer.');
    }
    setActionLoading(null);
  };

  const handleRejectCounter = async (offerId) => {
    setActionLoading(offerId);
    try {
      await fetch(`/api/offers/${offerId}/respond`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status: 'Rejected' }),
      });
      fetchOffers();
    } catch (err) {
      alert('Failed to reject counter offer.');
    }
    setActionLoading(null);
  };

  if (loading) return <div className="text-center py-10">Loading offers...</div>;
  if (error) return <div className="text-center text-red-500 py-10">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-[#004AAD]">My Offers</h2>
      <div className="overflow-x-auto rounded-lg shadow bg-white">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Gem</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Offered Amount</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Counter Amount</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {offers.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-slate-400">No offers found.</td>
              </tr>
            )}
             {offers.map((offer) => (
               <tr key={offer._id} className="hover:bg-slate-50 transition">
                 <td className="px-4 py-3 flex items-center gap-3">
                   {offer.gem_id && offer.gem_id.image_url && (
                     <img src={getImageUrl(offer.gem_id.image_url)} alt={offer.gem_id.name} className="w-10 h-10 rounded object-cover border" />
                   )}
                   <span>{offer.gem_id?.name || 'Unknown Gem'}</span>
                 </td>
                 <td className="px-4 py-3 font-medium">${offer.offer_amount}</td>
                 <td className="px-4 py-3">
                   <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[offer.status] || 'bg-slate-100 text-slate-700'}`}>{offer.status}</span>
                 </td>
                 <td className="px-4 py-3">{offer.status === 'Countered' ? `$${offer.counter_amount}` : '-'}</td>
                 <td className="px-4 py-3">
                   {offer.status === 'Countered' ? (
                     <div className="flex gap-2">
                       <button
                         className="px-3 py-1 rounded bg-blue-500 text-white text-xs hover:bg-blue-600 disabled:opacity-60"
                         disabled={actionLoading === offer._id}
                         onClick={() => handleAcceptCounter(offer._id)}
                       >
                         Accept Counter
                       </button>
                       <button
                         className="px-3 py-1 rounded bg-red-500 text-white text-xs hover:bg-red-600 disabled:opacity-60"
                         disabled={actionLoading === offer._id}
                         onClick={() => handleRejectCounter(offer._id)}
                       >
                         Reject Counter
                       </button>
                     </div>
                   ) : (
                     <span className="text-slate-400 text-xs">-</span>
                   )}
                 </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
