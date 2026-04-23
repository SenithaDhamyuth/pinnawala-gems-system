import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

export default function AddAuctionForm({ onClose, onAdded }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', startingBid: '', startDate: '', endDate: '', image_url: ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        startingBid: Number(formData.startingBid),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        media: formData.image_url ? [{ url: formData.image_url, type: 'image' }] : []
      };

      // "token" → buyer/seller flow; "authToken" → admin flow (AuthContext)
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';

      await axios.post(`${apiUrl}/api/auctions`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onAdded();
      onClose();
    } catch (err) {
      const detail = err.response?.data?.detail || err.response?.data?.message;
      alert(detail || "Failed to host auction. Please ensure all dates are valid and in the future.");
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all outline-none text-slate-900 placeholder:text-slate-400";
  const labelClasses = "block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-white shadow-sm z-10 relative">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Host New Auction</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} className="text-slate-500" /></button>
        </div>

        <div className="overflow-y-auto p-8 custom-scrollbar">
          <form id="add-auction-form" onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className={labelClasses}>Auction Title</label>
              <input required name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Rare Padparadscha Sapphire" className={inputClasses} />
            </div>

            <div>
              <label className={labelClasses}>Starting Bid (LKR)</label>
              <input required type="number" name="startingBid" value={formData.startingBid} onChange={handleChange} placeholder="e.g. 5000000" className={inputClasses} />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className={labelClasses}>Start Date & Time</label>
                <input required type="datetime-local" name="startDate" value={formData.startDate} onChange={handleChange} className={inputClasses} />
              </div>
              <div>
                <label className={labelClasses}>End Date & Time</label>
                <input required type="datetime-local" name="endDate" value={formData.endDate} onChange={handleChange} className={inputClasses} />
              </div>
            </div>

            <div>
              <label className={labelClasses}>Description & Details</label>
              <textarea required name="description" value={formData.description} onChange={handleChange} rows={4} placeholder="Describe the item up for auction..." className={`${inputClasses} resize-none`} />
            </div>

            <div>
              <label className={labelClasses}>Media URL</label>
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                  {formData.image_url ? <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" /> : <Upload size={18} className="text-slate-400" />}
                </div>
                <input name="image_url" value={formData.image_url} onChange={handleChange} placeholder="https://example.com/gemstone.jpg" className={inputClasses} />
              </div>
            </div>
          </form>
        </div>

        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 z-10 relative">
          <button type="button" onClick={onClose} className="px-6 py-3 font-bold text-slate-600 hover:text-slate-900 transition-colors">Cancel</button>
          <button type="submit" form="add-auction-form" disabled={loading} className="px-8 py-3 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50 shadow-md">
            {loading ? 'Hosting...' : <><CheckCircle2 size={18} strokeWidth={2.5} /> Confirm Block</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
