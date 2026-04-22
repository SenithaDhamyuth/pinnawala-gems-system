import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Loader2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const RESOLVED_API_ROOT = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const APPOINTMENTS_URL = `${RESOLVED_API_ROOT}/api/appointments`;

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token') || localStorage.getItem('authToken') || ''}`,
});

const getSlotId = (slot) => slot?.id || slot?._id;

/**
 * Buyer / seller: browse Available slots and book (buyers assign buyer_id via API).
 */
export default function BookAppointmentView() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');
  const role = localStorage.getItem('role') || '';

  const availableSlots = useMemo(
    () => slots.filter((slot) => slot.status === 'Available'),
    [slots]
  );

  const fetchAvailableSlots = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${APPOINTMENTS_URL}/available`, { headers: authHeaders() });
      setSlots(res.data || []);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to load available slots.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAvailableSlots();
  }, [fetchAvailableSlots]);

  const handleBookSlot = async (slot) => {
    const slotId = getSlotId(slot);
    if (!slotId) return;

    if (role !== 'buyer') {
      toast.error('Only buyer accounts can book appointments.');
      return;
    }

    setBusyId(slotId);
    setError('');
    try {
      await axios.post(`${APPOINTMENTS_URL}/book/${slotId}`, {}, { headers: authHeaders() });
      toast.success('Appointment booked successfully.');
      fetchAvailableSlots();
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Failed to book the selected slot.';
      setError(msg);
      toast.error(msg);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="relative flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-white/10 border border-white/10">
            <Sparkles size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight">Book an Appointment</h2>
            <p className="text-sm text-blue-100/90 mt-1 max-w-xl">
              Reserve a private consultation slot curated by our team. Available times update in real time when
              others book.
            </p>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0 }}
            className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
      >
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['Date', 'Time window', 'Duration', 'Action'].map((head) => (
                <th key={head} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-14 text-center text-slate-500">
                  <Loader2 className="inline animate-spin text-blue-500 mr-2" size={20} />
                  Loading available slots...
                </td>
              </tr>
            ) : availableSlots.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-14 text-center text-slate-500">
                  <Calendar className="mx-auto text-slate-300 mb-3" size={36} />
                  <p className="font-semibold text-slate-700">No open slots right now</p>
                  <p className="text-sm mt-1">Please check back soon for new availability.</p>
                </td>
              </tr>
            ) : (
              availableSlots.map((slot, idx) => {
                const slotId = getSlotId(slot);
                return (
                  <motion.tr
                    key={slotId || `${slot.date}-${slot.time_slot}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="hover:bg-blue-50/40"
                  >
                    <td className="px-4 py-4 text-sm font-bold text-slate-900">{slot.date}</td>
                    <td className="px-4 py-4 text-sm text-slate-700">
                      <span className="inline-flex items-center gap-2">
                        <Clock size={16} className="text-blue-500" />
                        {slot.time_slot}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">{slot.duration_minutes ? `${slot.duration_minutes} min` : '—'}</td>
                    <td className="px-4 py-4">
                      <motion.button
                        type="button"
                        onClick={() => handleBookSlot(slot)}
                        disabled={busyId === slotId || role !== 'buyer'}
                        whileHover={busyId === slotId ? {} : { scale: 1.03 }}
                        whileTap={busyId === slotId ? {} : { scale: 0.97 }}
                        title={role !== 'buyer' ? 'Switch to a buyer account to book' : ''}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#004AAD] to-[#00B4D8] text-white text-xs font-black uppercase tracking-wide shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {busyId === slotId ? <Loader2 size={14} className="animate-spin" /> : <Calendar size={14} />}
                        Book Now
                      </motion.button>
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
