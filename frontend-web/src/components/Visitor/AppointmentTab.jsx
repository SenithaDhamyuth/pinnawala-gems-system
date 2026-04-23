import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Calendar, Clock, Loader2, Plus, Trash2 } from 'lucide-react';

const RESOLVED_API_ROOT = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const APPOINTMENTS_URL = `${RESOLVED_API_ROOT}/api/appointments`;

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token') || localStorage.getItem('authToken') || ''}`,
});

const getSlotId = (slot) => slot?.id || slot?._id;

const timeToMinutes = (timeValue) => {
  const [hours, minutes] = (timeValue || '00:00').split(':').map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (totalMinutes) => {
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
  const minutes = String(totalMinutes % 60).padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Admin-only: create available appointment slots and manage the schedule.
 */
export default function AppointmentTab() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [form, setForm] = useState({ date: '', time: '', duration: 30 });
  const [error, setError] = useState('');

  const fetchSlots = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${APPOINTMENTS_URL}/admin`, { headers: authHeaders() });
      setSlots(res.data || []);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to load slots.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const handleCreateSlot = async (event) => {
    event.preventDefault();
    if (!form.date || !form.time || !form.duration) {
      setError('Date, time, and duration are required.');
      return;
    }

    const start = timeToMinutes(form.time);
    const end = start + Number(form.duration);
    const time_slot = `${form.time} - ${minutesToTime(end)}`;

    setCreating(true);
    setError('');
    try {
      await axios.post(
        APPOINTMENTS_URL,
        { date: form.date, time_slot, duration_minutes: Number(form.duration) },
        { headers: authHeaders() }
      );
      setForm({ date: '', time: '', duration: 30 });
      fetchSlots();
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to create slot.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteSlot = async (slot) => {
    const slotId = getSlotId(slot);
    if (!slotId) return;
    if (!window.confirm('Delete this slot?')) return;

    setBusyId(slotId);
    try {
      await axios.delete(`${APPOINTMENTS_URL}/${slotId}`, { headers: authHeaders() });
      fetchSlots();
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to delete slot.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Appointment Slots</h2>
        <p className="text-sm text-slate-500 mt-1">
          Create available time windows for gemstone consultations. Buyers book from their dashboard.
        </p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        onSubmit={handleCreateSlot}
        className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2">Date</label>
            <input
              type="date"
              value={form.date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2">Start time</label>
            <input
              type="time"
              value={form.time}
              onChange={(e) => setForm((prev) => ({ ...prev, time: e.target.value }))}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2">Duration (minutes)</label>
            <input
              type="number"
              min="15"
              step="15"
              value={form.duration}
              onChange={(e) => setForm((prev) => ({ ...prev, duration: Number(e.target.value) }))}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
            />
          </div>
          <div className="flex items-end">
            <motion.button
              type="submit"
              disabled={creating}
              whileHover={{ scale: creating ? 1 : 1.02 }}
              whileTap={{ scale: creating ? 1 : 0.98 }}
              className="w-full px-4 py-2.5 bg-gradient-to-r from-[#004AAD] to-[#00B4D8] text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/25 hover:opacity-95 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Create Slot
            </motion.button>
          </div>
        </div>
      </motion.form>

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
      >
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['Date', 'Time', 'Duration', 'Status', 'Booked By', 'Actions'].map((head) => (
                <th key={head} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                  <Loader2 className="inline animate-spin text-blue-500 mr-2" size={18} />
                  Loading slots...
                </td>
              </tr>
            ) : slots.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                  <Calendar className="inline text-slate-300 mb-2" size={32} />
                  <p className="font-medium">No slots yet. Create your first availability above.</p>
                </td>
              </tr>
            ) : (
              slots.map((slot, idx) => {
                const slotId = getSlotId(slot);
                return (
                  <motion.tr
                    key={slotId || `${slot.date}-${slot.time_slot}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.03 }}
                    className="hover:bg-slate-50/80"
                  >
                    <td className="px-4 py-3 text-sm font-semibold text-slate-800">{slot.date}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      <span className="inline-flex items-center gap-1">
                        <Clock size={14} className="text-slate-400" />
                        {slot.time_slot}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">{slot.duration_minutes || '—'}</td>
                    <td className="px-4 py-3 text-sm font-bold text-slate-800">{slot.status}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {slot.buyer_id?.email || slot.buyer_id?.name || slot.buyer_id?.full_name || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleDeleteSlot(slot)}
                        disabled={busyId === slotId}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 text-xs font-bold hover:bg-rose-100 disabled:opacity-50 transition-colors"
                      >
                        {busyId === slotId ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                        Delete
                      </button>
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
