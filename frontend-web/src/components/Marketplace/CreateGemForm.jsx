import React, { useState } from 'react';
import { createGemstone } from '../../services/api';
import toast from 'react-hot-toast';

const GEM_TYPES = [
  'Sapphire', 'Ruby', 'Emerald', 'Spinel', 'Topaz', 'Tourmaline', 'Garnet', 'Amethyst', 'Other'
];
const TREATMENTS = [
  'Unheated', 'Heated', 'Treated', 'None'
];
const ORIGINS = [
  'Sri Lanka', 'Myanmar', 'Madagascar', 'Thailand', 'Tanzania', 'Other'
];

export default function CreateGemForm({ onSuccess, userRole }) {
  const [form, setForm] = useState({
    name: '',
    gem_type: '',
    treatment: '',
    origin: '',
    base_price: '',
    weight_carats: '',
    image: null,
    description: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    const { name, value, files } = e.target;
    setForm(f => ({
      ...f,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name || !form.gem_type || !form.treatment || !form.origin || !form.base_price || !form.weight_carats) {
      toast.error('All fields are required.');
      return;
    }
    if (isNaN(form.base_price) || Number(form.base_price) <= 0) {
      toast.error('Price must be a number greater than 0.');
      return;
    }
    if (isNaN(form.weight_carats) || Number(form.weight_carats) <= 0) {
      toast.error('Weight must be a number greater than 0.');
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== '') fd.append(k, v);
      });
      // Admin override: status Active
      if (userRole === 'admin') {
        fd.append('status', 'Active');
      }
      await createGemstone(fd);
      toast.success('Gem created successfully!');
      onSuccess?.();
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to create gem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
      <h2 className="text-2xl font-black text-slate-900 mb-2">Add New Gemstone</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold mb-1">Name</label>
          <input name="name" value={form.name} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">Gem Type</label>
          <select name="gem_type" value={form.gem_type} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" required>
            <option value="">Select Type</option>
            {GEM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">Treatment</label>
          <select name="treatment" value={form.treatment} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" required>
            <option value="">Select Treatment</option>
            {TREATMENTS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">Origin</label>
          <select name="origin" value={form.origin} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" required>
            <option value="">Select Origin</option>
            {ORIGINS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">Price (USD)</label>
          <input name="base_price" type="number" min="1" value={form.base_price} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">Weight (carats)</label>
          <input name="weight_carats" type="number" min="0.01" step="0.01" value={form.weight_carats} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" required />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-bold mb-1">Image</label>
          <input name="image" type="file" accept="image/*" onChange={handleChange} className="w-full" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-bold mb-1">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" rows={3} />
        </div>
      </div>
      <div className="flex justify-end">
        <button type="submit" disabled={loading} className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold text-base hover:bg-blue-700 transition-all disabled:opacity-60">
          {loading ? 'Saving...' : 'Create Gem'}
        </button>
      </div>
    </form>
  );
}
