import React, { useEffect, useState } from 'react';
import { getSellerOffers, respondToOffer } from '../../services/api';

const statusColors = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Accepted: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
  Countered: 'bg-blue-100 text-blue-800',
};

export default function ReceivedOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [counterInput, setCounterInput] = useState({});
  const [showCounter, setShowCounter] = useState({});
  const [actionLoading, setActionLoading] = useState(null);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const data = await getSellerOffers();
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

  const handleRespond = async (offerId, status, counterAmount) => {
    setActionLoading(offerId);
    try {
      await respondToOffer(offerId, status === 'Countered' ? { status, counterAmount } : { status });
      fetchOffers();
      setShowCounter((prev) => ({ ...prev, [offerId]: false }));
      setCounterInput((prev) => ({ ...prev, [offerId]: '' }));
    } catch (err) {
      alert('Failed to update offer.');
    }
    setActionLoading(null);
  };

  const handleCounterInput = (offerId, value) => {
    setCounterInput((prev) => ({ ...prev, [offerId]: value }));
  };

  if (loading) return <div className="text-center py-10">Loading offers...</div>;
  if (error) return <div className="text-center text-red-500 py-10">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-[#004AAD]">Received Offers</h2>
      <div className="overflow-x-auto rounded-lg shadow bg-white">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Buyer</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Gem</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Offered Amount</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Status</th>
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
              <tr key={offer.id} className="hover:bg-slate-50 transition">
                <td className="px-4 py-3">{offer.buyerName}</td>
                <td className="px-4 py-3 flex items-center gap-3">
                  {offer.gemImage && (
                    <img src={offer.gemImage} alt={offer.gemName} className="w-10 h-10 rounded object-cover border" />
                  )}
                  <span>{offer.gemName}</span>
                </td>
                <td className="px-4 py-3 font-medium">${offer.amount}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[offer.status] || 'bg-slate-100 text-slate-700'}`}>{offer.status}</span>
                </td>
                <td className="px-4 py-3">
                  {showCounter[offer.id] ? (
                    <div className="flex gap-2 items-center">
                      <input
                        type="number"
                        min="1"
                        className="border rounded px-2 py-1 text-xs w-24"
                        placeholder="Counter Amount"
                        value={counterInput[offer.id] || ''}
                        onChange={e => handleCounterInput(offer.id, e.target.value)}
                        disabled={actionLoading === offer.id}
                      />
                      <button
                        className="px-3 py-1 rounded bg-blue-500 text-white text-xs hover:bg-blue-600 disabled:opacity-60"
                        disabled={actionLoading === offer.id || !counterInput[offer.id]}
                        onClick={() => handleRespond(offer.id, 'Countered', counterInput[offer.id])}
                      >
                        Send
                      </button>
                      <button
                        className="px-2 py-1 rounded bg-slate-200 text-xs hover:bg-slate-300"
                        onClick={() => setShowCounter((prev) => ({ ...prev, [offer.id]: false }))}
                        disabled={actionLoading === offer.id}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1 rounded bg-green-500 text-white text-xs hover:bg-green-600 disabled:opacity-60"
                        disabled={actionLoading === offer.id}
                        onClick={() => handleRespond(offer.id, 'Accepted')}
                      >
                        Accept
                      </button>
                      <button
                        className="px-3 py-1 rounded bg-red-500 text-white text-xs hover:bg-red-600 disabled:opacity-60"
                        disabled={actionLoading === offer.id}
                        onClick={() => handleRespond(offer.id, 'Rejected')}
                      >
                        Reject
                      </button>
                      <button
                        className="px-3 py-1 rounded bg-blue-500 text-white text-xs hover:bg-blue-600 disabled:opacity-60"
                        disabled={actionLoading === offer.id}
                        onClick={() => setShowCounter((prev) => ({ ...prev, [offer.id]: true }))}
                      >
                        Counter Offer
                      </button>
                    </div>
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
