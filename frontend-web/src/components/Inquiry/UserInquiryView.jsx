import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Send, Clock, CheckCircle, ChevronDown,
  ChevronUp, Loader2, Plus, Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token') || localStorage.getItem('authToken') || ''}`,
});

const CATEGORIES = ['Technical', 'Billing', 'General', 'Gemstone Query', 'Appointment', 'Other'];
const PRIORITIES  = ['Low', 'Medium', 'High', 'Urgent'];

const STATUS_STYLE = {
  'Open':        'bg-blue-100 text-blue-700',
  'In Progress': 'bg-amber-100 text-amber-700',
  'Resolved':    'bg-green-100 text-green-700',
  'Closed':      'bg-slate-100 text-slate-600',
};

const PRIORITY_STYLE = {
  'Low':    'bg-slate-100 text-slate-600',
  'Medium': 'bg-blue-100 text-blue-700',
  'High':   'bg-amber-100 text-amber-700',
  'Urgent': 'bg-red-100 text-red-700',
};

export default function UserInquiryView() {
  const [tickets, setTickets]       = useState([]);
  const [showForm, setShowForm]     = useState(false);
  const [expanded, setExpanded]     = useState(null);
  const [replyText, setReplyText]   = useState('');
  const [replying, setReplying]     = useState(false);
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    subject: '', category: 'General', priority: 'Medium', message: '',
  });

  const fetchTickets = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/inquiries`, { headers: authHeaders() });
      setTickets(res.data || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const handleSubmit = async (e) => {
  if (e && e.preventDefault) e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) {
      toast.error('Subject and message are required.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await axios.post(`${API}/api/inquiries`, {
        subject:  form.subject.trim(),
        category: form.category,
        priority: form.priority,
        message:  form.message.trim(),
      }, { headers: authHeaders() });

      toast.success(`Ticket ${res.data.reference_id} submitted!`);
      setForm({ subject: '', category: 'General', priority: 'Medium', message: '' });
      setShowForm(false);
      fetchTickets();
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to submit ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (ticketId) => {
    if (!replyText.trim()) return;
    setReplying(true);
    try {
      await axios.post(
        `${API}/api/inquiries/${ticketId}/messages`,
        { text: replyText.trim(), is_internal: false },
        { headers: authHeaders() }
      );
      setReplyText('');
      fetchTickets();
    } catch {
      toast.error('Failed to send reply.');
    } finally {
      setReplying(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header banner — same style as BookAppointmentView */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#004AAD] via-[#0066CC] to-[#00B4D8] p-8 text-white shadow-xl"
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="relative flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-white/10 border border-white/10">
            <Sparkles size={28} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white">Help & Support</h2>
            <p className="text-sm text-purple-200 mt-1 max-w-xl">
              Submit a support ticket and our team will respond shortly. Track all your tickets here.
            </p>
          </div>
        </div>
      </motion.div>

      {/* New ticket button */}
      <div className="flex justify-end">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#004AAD] to-[#00B4D8] text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/25"
        >
          <Plus size={16} /> New Ticket
        </motion.button>
      </div>

      {/* New ticket form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4"
          >
            <h3 className="font-bold text-slate-800 text-lg">Submit a Support Ticket</h3>

            <input
              type="text"
              placeholder="Subject *"
              value={form.subject}
              onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">Category</label>
                <select
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 transition bg-white"
                >
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">Priority</label>
                <select
                  value={form.priority}
                  onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 transition bg-white"
                >
                  {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <textarea
              rows={4}
              placeholder="Describe your issue or question *"
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none transition"
            />

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={(e) => handleSubmit(e)}
                disabled={submitting}
                className="flex-1 py-2.5 bg-gradient-to-r from-[#004AAD] to-[#00B4D8] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition"
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Submit Ticket
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tickets list */}
      {loading ? (
        <div className="text-center py-16 text-slate-400">
          <Loader2 size={28} className="animate-spin mx-auto mb-2" />
          <p className="text-sm">Loading tickets...</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-14 text-center shadow-sm">
          <MessageSquare size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="font-bold text-slate-700">No tickets yet</p>
          <p className="text-sm text-slate-500 mt-1">Create a ticket and we'll get back to you soon.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map(ticket => (
            <div key={ticket.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">

              {/* Ticket header row */}
              <button
                className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-slate-50/80 transition"
                onClick={() => setExpanded(expanded === ticket.id ? null : ticket.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-mono text-xs font-bold text-slate-400">{ticket.reference_id}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${STATUS_STYLE[ticket.status]}`}>
                      {ticket.status}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${PRIORITY_STYLE[ticket.priority]}`}>
                      {ticket.priority}
                    </span>
                    <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                      {ticket.category}
                    </span>
                  </div>
                  <p className="font-bold text-slate-800 truncate">{ticket.subject}</p>
                </div>
                <div className="flex items-center gap-2 text-slate-400 flex-shrink-0">
                  <Clock size={13} />
                  <span className="text-xs">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                  {expanded === ticket.id
                    ? <ChevronUp size={16} />
                    : <ChevronDown size={16} />}
                </div>
              </button>

              {/* Message thread */}
              <AnimatePresence>
                {expanded === ticket.id && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden border-t border-slate-100"
                  >
                    <div className="p-5 space-y-3">
                      {ticket.messages?.length === 0 ? (
                        <p className="text-sm text-slate-400 text-center py-4">No messages yet.</p>
                      ) : (
                        ticket.messages.map((msg, i) => {
                          const isSupport = msg.sender?.includes('admin') || msg.sender?.includes('@pinnawala');
                          return (
                            <div key={i} className={`flex ${isSupport ? 'justify-start' : 'justify-end'}`}>
                              <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
                                isSupport
                                  ? 'bg-slate-100 text-slate-800 rounded-tl-sm'
                                  : 'bg-blue-500 text-white rounded-tr-sm'
                              }`}>
                                <p className={`text-xs font-bold mb-1 ${isSupport ? 'text-slate-500' : 'text-blue-100'}`}>
                                  {isSupport ? 'Support Team' : 'You'}
                                </p>
                                <p>{msg.text}</p>
                                <p className={`text-[10px] mt-1 ${isSupport ? 'text-slate-400' : 'text-blue-200'}`}>
                                  {new Date(msg.timestamp).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      )}

                      {/* Reply input — only for open tickets */}
                      {ticket.status !== 'Closed' && ticket.status !== 'Resolved' ? (
                        <div className="flex gap-2 pt-2">
                          <input
                            type="text"
                            placeholder="Add a reply..."
                            value={replyText}
                            onChange={e => setReplyText(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleReply(ticket.id)}
                            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 transition"
                          />
                          <button
                            onClick={() => handleReply(ticket.id)}
                            disabled={replying || !replyText.trim()}
                            className="px-4 py-2.5 bg-blue-500 text-white rounded-xl font-bold text-sm disabled:opacity-40 transition"
                          >
                            {replying ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-green-600 text-sm font-semibold pt-2">
                          <CheckCircle size={15} />
                          This ticket has been {ticket.status.toLowerCase()}.
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
