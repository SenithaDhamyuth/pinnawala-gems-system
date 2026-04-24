import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, CheckCircle, ChevronRight, ChevronLeft, Loader2, User } from 'lucide-react';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token') || localStorage.getItem('authToken') || ''}`,
});

const PURPOSES = [
  { label: 'Jewelry collections',        icon: '💎' },
  { label: 'Rare gemstone collections',  icon: '🪨' },
  { label: 'Other / Need assistance',    icon: '🤝' },
];

const STEPS = ['Purpose', 'Gemologist', 'Date & Time', 'Confirm'];

export default function BookAppointmentView() {
  const [step, setStep]               = useState(0);
  const [purpose, setPurpose]         = useState('');
  const [gemologists, setGemologists] = useState([]);
  const [gemologist, setGemologist]   = useState(null);
  const [date, setDate]               = useState('');
  const [slots, setSlots]             = useState({ available: [], blocked: [] });
  const [timeSlot, setTimeSlot]       = useState('');
  const [tcAgreed, setTcAgreed]       = useState(false);
  const [reminder, setReminder]       = useState('Email');
  const [subscribe, setSubscribe]     = useState(false);
  const [loading, setLoading]         = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [myAppts, setMyAppts]         = useState([]);
  const [apptsDone, setApptsDone]     = useState(false);

  // Load gemologists on mount
  useEffect(() => {
    axios.get(`${API}/api/appointments/gemologists`, { headers: authHeaders() })
      .then(r => setGemologists(r.data))
      .catch(() => {});
  }, []);

  // Load my appointments
  const loadMyAppts = useCallback(() => {
    axios.get(`${API}/api/appointments`, { headers: authHeaders() })
      .then(r => setMyAppts(r.data))
      .catch(() => {});
  }, []);

  useEffect(() => { loadMyAppts(); }, [loadMyAppts]);

  // Load available slots when gemologist + date are set
  useEffect(() => {
    if (!gemologist || !date) return;
    setSlotsLoading(true);
    setTimeSlot('');
    axios.get(`${API}/api/appointments/available`, {
      headers: authHeaders(),
      params: { gemologist_id: gemologist.id, date },
    })
      .then(r => setSlots({ available: r.data.available_slots, blocked: r.data.blocked_slots }))
      .catch(() => setSlots({ available: [], blocked: [] }))
      .finally(() => setSlotsLoading(false));
  }, [gemologist, date]);

  const handleBook = async () => {
    if (!tcAgreed) { toast.error('Please agree to the Terms and Conditions.'); return; }
    setLoading(true);
    try {
      await axios.post(`${API}/api/appointments/book`, {
        gemologist_id: gemologist.id,
        purpose,
        date,
        time_slot: timeSlot,
        tc_agreed: true,
        reminder_method: reminder,
        subscribe_updates: subscribe,
      }, { headers: authHeaders() });
      toast.success('Appointment booked successfully!');
      setApptsDone(true);
      loadMyAppts();
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Booking failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      await axios.patch(`${API}/api/appointments/${id}/cancel`, {}, { headers: authHeaders() });
      toast.success('Appointment cancelled.');
      loadMyAppts();
    } catch {
      toast.error('Could not cancel appointment.');
    }
  };

  const today = new Date().toISOString().split('T')[0];

  // ── Step 0: Purpose ──────────────────────────────────────────────
  const StepPurpose = (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-slate-800">What is the purpose of your visit?</h3>
      <div className="grid gap-3">
        {PURPOSES.map(p => (
          <button key={p.label} type="button"
            onClick={() => setPurpose(p.label)}
            className={`flex items-center gap-4 px-5 py-4 rounded-2xl border-2 text-left transition-all ${
              purpose === p.label
                ? 'border-blue-500 bg-blue-50'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <span className="text-2xl">{p.icon}</span>
            <span className="font-semibold text-slate-800">{p.label}</span>
            {purpose === p.label && <CheckCircle size={18} className="ml-auto text-blue-500" />}
          </button>
        ))}
      </div>
    </div>
  );

  // ── Step 1: Gemologist ───────────────────────────────────────────
  const StepGemologist = (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-slate-800">Select a gemologist</h3>
      {gemologists.length === 0 ? (
        <div className="text-slate-500 text-sm py-8 text-center">
          <User size={32} className="mx-auto text-slate-300 mb-2" />
          No gemologists available right now.
        </div>
      ) : (
        <div className="grid gap-3">
          {gemologists.map(g => (
            <button key={g.id} type="button"
              onClick={() => setGemologist(g)}
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl border-2 text-left transition-all ${
                gemologist?.id === g.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-white font-bold text-sm">
                {g.full_name?.[0] || 'G'}
              </div>
              <div>
                <p className="font-semibold text-slate-800">{g.full_name}</p>
                <p className="text-xs text-slate-500">{g.email}</p>
              </div>
              {gemologist?.id === g.id && <CheckCircle size={18} className="ml-auto text-blue-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  // ── Step 2: Date & Time ──────────────────────────────────────────
  const StepDateTime = (
    <div className="space-y-5">
      <h3 className="text-lg font-bold text-slate-800">Select a date and time</h3>
      <div>
        <label className="block text-xs font-bold text-slate-500 mb-2">Date</label>
        <input type="date" value={date} min={today}
          onChange={e => {
  const selected = e.target.value;
  if (selected && selected < today) {
    toast.error("You cannot book an appointment in the past.");
    setDate(''); // This clears the invalid input
  } else {
    setDate(selected);
  }
}}
          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
        />
      </div>
      {date && (
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-2">Available time slots</label>
          {slotsLoading ? (
            <div className="flex items-center gap-2 text-slate-500 text-sm py-4">
              <Loader2 size={16} className="animate-spin" /> Loading slots...
            </div>
          ) : slots.available.length === 0 ? (
            <p className="text-slate-500 text-sm py-4">No available slots on this date. Try another date.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {slots.available.map(s => (
                <button key={s} type="button"
                  onClick={() => setTimeSlot(s)}
                  className={`py-3 rounded-xl text-sm font-semibold border-2 transition-all ${
                    timeSlot === s
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-white hover:border-blue-300 text-slate-700'
                  }`}
                >
                  <Clock size={12} className="inline mr-1" />{s}
                </button>
              ))}
            </div>
          )}
          {slots.blocked.length > 0 && (
            <p className="text-xs text-slate-400 mt-2">
              {slots.blocked.length} slot(s) unavailable due to existing bookings or buffer time.
            </p>
          )}
        </div>
      )}
    </div>
  );

  // ── Step 3: Confirm ──────────────────────────────────────────────
  const StepConfirm = (
    <div className="space-y-5">
      <h3 className="text-lg font-bold text-slate-800">Confirm your appointment</h3>
      <div className="bg-slate-50 rounded-2xl p-5 space-y-3 text-sm">
        {[
          ['Purpose',     purpose],
          ['Gemologist',  gemologist?.full_name],
          ['Date',        date],
          ['Time',        timeSlot],
        ].map(([label, val]) => (
          <div key={label} className="flex justify-between">
            <span className="text-slate-500 font-medium">{label}</span>
            <span className="font-bold text-slate-800">{val}</span>
          </div>
        ))}
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 mb-2">Reminder method</label>
        <div className="flex gap-2">
          {['Email', 'SMS', 'Both'].map(m => (
            <button key={m} type="button"
              onClick={() => setReminder(m)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                reminder === m
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-slate-200 bg-white text-slate-600'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-1">You'll receive reminders 24 hours and 1 hour before your appointment.</p>
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" checked={subscribe} onChange={e => setSubscribe(e.target.checked)}
          className="w-4 h-4 rounded border-slate-300 text-blue-500" />
        <span className="text-sm text-slate-600">Subscribe to updates and new gem arrivals</span>
      </label>

      <label className="flex items-start gap-3 cursor-pointer">
        <input type="checkbox" checked={tcAgreed} onChange={e => setTcAgreed(e.target.checked)}
          className="w-4 h-4 mt-0.5 rounded border-slate-300 text-blue-500" />
        <span className="text-sm text-slate-600">
          I agree to the <span className="text-blue-500 underline cursor-pointer">Terms and Conditions</span> of the appointment booking.
        </span>
      </label>
    </div>
  );

  const steps = [StepPurpose, StepGemologist, StepDateTime, StepConfirm];

  const canNext = [
    !!purpose,
    !!gemologist,
    !!date && !!timeSlot,
    tcAgreed,
  ];

  // ── Success screen ───────────────────────────────────────────────
  if (apptsDone) {
    return (
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
          <CheckCircle size={48} className="mx-auto text-green-500 mb-3" />
          <h2 className="text-xl font-black text-slate-900">Appointment Confirmed!</h2>
          <p className="text-slate-500 text-sm mt-1">You'll receive a reminder via {reminder} 24 hours and 1 hour before.</p>
          <button onClick={() => { setApptsDone(false); setStep(0); setPurpose(''); setGemologist(null); setDate(''); setTimeSlot(''); setTcAgreed(false); }}
            className="mt-5 px-6 py-2.5 bg-gradient-to-r from-[#004AAD] to-[#00B4D8] text-white rounded-xl font-bold text-sm">
            Book Another
          </button>
        </motion.div>
        <MyAppointments appts={myAppts} onCancel={handleCancel} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
     {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#004AAD] via-[#0077B6] to-[#00B4D8] p-10 text-white shadow-2xl border border-white/10"
      >
        {/* Decorative Glass Effect Blobs */}
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-400/20 rounded-full blur-2xl" />

        <div className="relative z-10 flex items-center gap-6">
          {/* Calendar Icon with Glassmorphism */}
          <div className="hidden sm:flex p-4 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner">
            <Calendar size={32} className="text-white" />
          </div>
          
          <div>
            <h2 className="text-3xl font-black tracking-tight drop-shadow-md">
              Schedule Your Appointment
            </h2>
            <p className="text-blue-50 font-medium mt-1 opacity-90 italic">
              Experience the finest gemstone evaluations at Pinnawala Gems.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full transition-all ${
              i === step ? 'bg-blue-500 text-white' :
              i < step  ? 'bg-green-100 text-green-700' :
              'bg-slate-100 text-slate-400'
            }`}>
              {i < step ? <CheckCircle size={12} /> : <span>{i + 1}</span>}
              {s}
            </div>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 ${i < step ? 'bg-green-300' : 'bg-slate-200'}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* Step content */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm min-h-[260px]">
        <AnimatePresence mode="wait">
          <motion.div key={step}
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}>
            {steps[step]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        {step > 0 && (
          <button type="button" onClick={() => setStep(s => s - 1)}
            className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50">
            <ChevronLeft size={16} /> Back
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button type="button" disabled={!canNext[step]} onClick={() => setStep(s => s + 1)}
            className="ml-auto flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#004AAD] to-[#00B4D8] text-white rounded-xl text-sm font-bold disabled:opacity-40">
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button type="button" disabled={!tcAgreed || loading} onClick={handleBook}
            className="ml-auto flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#004AAD] to-[#00B4D8] text-white rounded-xl text-sm font-bold disabled:opacity-40">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
            Confirm Booking
          </button>
        )}
      </div>

      {/* My appointments */}
      {myAppts.length > 0 && <MyAppointments appts={myAppts} onCancel={handleCancel} />}
    </div>
  );
}

function MyAppointments({ appts, onCancel }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="font-bold text-slate-800">My Appointments</h3>
      </div>
      <table className="w-full text-left">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            {['Date', 'Time', 'Gemologist', 'Purpose', 'Status', 'Action'].map(h => (
              <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {appts.map(a => (
            <tr key={a.id} className="hover:bg-slate-50/80">
              <td className="px-4 py-3 text-sm font-semibold text-slate-800">{a.date}</td>
              <td className="px-4 py-3 text-sm text-slate-700">
                <span className="inline-flex items-center gap-1"><Clock size={13} className="text-blue-400" />{a.time_slot}</span>
              </td>
              <td className="px-4 py-3 text-sm text-slate-700">{a.gemologist_id?.full_name || '—'}</td>
              <td className="px-4 py-3 text-sm text-slate-600">{a.purpose}</td>
              <td className="px-4 py-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  a.status === 'Confirmed'  ? 'bg-green-100 text-green-700' :
                  a.status === 'Pending'    ? 'bg-yellow-100 text-yellow-700' :
                  a.status === 'Cancelled'  ? 'bg-red-100 text-red-700' :
                  'bg-slate-100 text-slate-600'
                }`}>{a.status}</span>
              </td>
              <td className="px-4 py-3">
                {(a.status === 'Pending' || a.status === 'Confirmed') && (
                  <button onClick={() => onCancel(a.id)}
                    className="text-xs font-bold text-red-500 hover:text-red-700 border border-red-200 px-3 py-1 rounded-lg hover:bg-red-50">
                    Cancel
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
