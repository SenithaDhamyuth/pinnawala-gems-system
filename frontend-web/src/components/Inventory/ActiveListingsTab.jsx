import React, { useCallback, useEffect, useState } from 'react';
import { Loader2, Pencil, Trash2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function ActiveListingsTab() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [priceInput, setPriceInput] = useState('');

  const token = localStorage.getItem('token');
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  const authConfig = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${apiUrl}/api/gems/my/listings`, authConfig);
      const active = (res.data || []).filter((gem) => gem.listing_status === 'Marketplace_Active');
      setListings(active);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load active listings');
    } finally {
      setLoading(false);
    }
  }, [apiUrl, token]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleEditPrice = async (gemId) => {
    const parsed = Number(priceInput);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      toast.error('Price must be greater than zero');
      return;
    }

    try {
      await axios.put(`${apiUrl}/api/gems/${gemId}`, { base_price: parsed }, authConfig);
      toast.success('Listing price updated');
      setEditingId(null);
      setPriceInput('');
      fetchListings();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update listing price');
    }
  };

  const handleUnlist = async (gemId) => {
    if (!window.confirm('Unlist this gem from marketplace?')) return;

    try {
      await axios.delete(`${apiUrl}/api/gems/${gemId}`, authConfig);
      toast.success('Listing removed from marketplace');
      fetchListings();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to unlist gemstone');
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-black text-slate-900">Active Listings</h2>
        <p className="text-sm text-slate-500 mt-1">All gems currently published to marketplace.</p>
      </div>

      <div className="bg-white border border-blue-100 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-blue-50 border-b border-blue-100">
            <tr>
              {['Gem', 'Specs', 'Price', 'Actions'].map((h) => (
                <th key={h} className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-blue-700">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-5 py-16 text-center text-slate-500">
                  <span className="inline-flex items-center gap-2">
                    <Loader2 size={15} className="animate-spin" />
                    Loading active listings...
                  </span>
                </td>
              </tr>
            ) : listings.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-16 text-center text-slate-500">
                  No active listings found.
                </td>
              </tr>
            ) : (
              listings.map((gem) => (
                <tr key={gem._id} className="hover:bg-blue-50/40 transition-colors">
                  <td className="px-5 py-4">
                    <p className="text-sm font-bold text-slate-900">{gem.name}</p>
                    <p className="text-xs text-slate-500 mt-1">{gem.gem_type}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">
                    {gem.weight_carats}ct • {gem.color}
                  </td>
                  <td className="px-5 py-4">
                    {editingId === gem._id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          value={priceInput}
                          onChange={(e) => setPriceInput(e.target.value)}
                          className="w-28 px-2 py-1.5 border border-slate-200 rounded-lg text-sm"
                        />
                        <button
                          onClick={() => handleEditPrice(gem._id)}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setPriceInput('');
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm font-bold text-blue-700">${gem.base_price}</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingId(gem._id);
                          setPriceInput(String(gem.base_price || ''));
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 text-xs font-bold hover:bg-blue-200"
                      >
                        <Pencil size={12} />
                        Edit Price
                      </button>
                      <button
                        onClick={() => handleUnlist(gem._id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-xs font-bold hover:bg-red-200"
                      >
                        <Trash2 size={12} />
                        Unlist
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
