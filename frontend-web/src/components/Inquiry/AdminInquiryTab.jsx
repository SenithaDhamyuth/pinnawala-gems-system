import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Send, Loader2, ChevronDown, ChevronUp,
  Clock, Filter, Lock, CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token') || localStorage.getItem('authToken') || ''}`,
});

const STATUS_STYLE = {
  'Open':        'bg-blue-100 text-blue-700 border-blue-200',
  'In Progress': 'bg-amber-100 text-amber-700 border-amber-200',
  'Resolved':    'bg-green-100 text-green-700 border-green-200',
  'Closed':      'bg-slate-100 text-slate-600 border-slate-200',
};

const PRIORITY_STYLE = {
  'Low':    'bg-slate-100 text-slate-600',
  'Medium': 'bg-blue-100 text-blue-700',
  'High':   'bg-amber-100 text-amber-700',
  'Urgent': 'bg-red-100 text-red-700',
};

const STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed'];

export default function AdminInquiryTab() {
  const [tickets, setTickets]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [expanded, setExpanded]     = useState(null);
  const [filter, setFilter]         = useState('All');
  const [replyText, setReplyText]   = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [replying, setReplying]     = useState(false);
  const [updating, setUpdating]     = useState(null);

  const fetchTickets = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/inquiries`, { headers: authHeaders() });
      setTickets(res.data || []);
    } catch {
      toast.error('Failed to load tickets.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const filtered = filter === 'All' ? tickets : tickets.filter(t => t.status === filter);

  const stats = {
    total:      tickets.length,
    open:       tickets.filter(t => t.status === 'Open').length,
    inProgress: tickets.filter(t => t.status === 'In Progress').length,
    resolved:   tickets.filter(t => t.status === 'Resolved').length,
  };

  const handleStatusChange = async (ticketId, status) => {
    setUpdating(ticketId);
    try {
      await axios.patch(`${API}/api/inquiries/${ticketId}`, { status }, { headers: authHeaders() });
      toast.success(`Status → ${status}`);
      fetchTickets();
    } catch {
      toast.error('Failed to update status.');
    } finally {
      setUpdating(null);
    }
  };

  const handleReply = async (ticketId) => {
    if (!replyText.trim()) return;
    setReplying(true);
    try {
      await axios.post(
        `${API}/api/inquiries/${ticketId}/messages`,
        { text: replyText.trim(), is_internal: isInternal },
        { headers: authHeaders() }
      );
      setReplyText('');
      setIsInternal(false);
      fetchTickets();
      toast.success(isInternal ? 'Internal note added.' : 'Reply sent to user.');
    } catch {
      toast.error('Failed to send reply.');
    } finally {
      setReplying(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Support Tickets</h2>
        <p className="text-sm text-slate-500 mt-1">
          Manage user inquiries, reply, and track ticket status.
        </p>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total',       val: stats.total,       color: 'bg-slate-50  text-slate-700' },
          { label: 'Open',        val: stats.open,        color: 'bg-blue-50   text-blue-700'  },
          { label: 'In Progress', val: stats.inProgress,  color: 'bg-amber-50  text-amber-700' },
          { label: 'Resolved',    val: stats.resolved,    color: 'bg-green-50  text-green-700' },
        ].map(s => (
          <div key={s.label} className={`${s.color} rounded-2xl p-5 border border-slate-200 shadow-sm`}>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{s.label}</p>
            <p className="text-3xl font-black mt-1">{s.val}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={14} className="text-slate-400" />
        {['All', ...STATUSES].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
              filter === s
                ? 'bg-slate-900 text-white border-slate-900'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}>
            {s}
          </button>
        ))}
      </div>

      {/* Tickets */}
      {loading ? (
        <div className="text-center py-16 text-slate-400">
          <Loader2 size={28} className="animate-spin mx-auto mb-2" />
          <p className="text-sm">Loading tickets...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-14 text-center shadow-sm">
          <MessageSquare size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="font-bold text-slate-700">No tickets found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ticket, idx) => (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
            >
              {/* Header row */}
              <div className="px-5 py-4 flex items-center gap-4">
                <button
                  className="flex-1 flex items-center gap-4 text-left"
                  onClick={() => setExpanded(expanded === ticket.id ? null : ticket.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-mono text-xs font-bold text-slate-400">{ticket.reference_id}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${STATUS_STYLE[ticket.status]}`}>
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
                    <p className="text-xs text-slate-500 mt-0.5">
                      {ticket.user_id?.full_name || ticket.user_id?.email || 'Unknown'}
                      {' · '}
                      <Clock size={10} className="inline" />{' '}
                      {new Date(ticket.createdAt).toLocaleDateString()}
                      {' · '}
                      {ticket.messages?.length || 0} message{ticket.messages?.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {expanded === ticket.id
                    ? <ChevronUp size={16} className="text-slate-400 flex-shrink-0" />
                    : <ChevronDown size={16} className="text-slate-400 flex-shrink-0" />}
                </button>

                {/* Status dropdown */}
                <select
                  value={ticket.status}
                  onChange={e => handleStatusChange(ticket.id, e.target.value)}
                  disabled={updating === ticket.id}
                  className="text-xs font-bold border border-slate-200 rounded-xl px-3 py-2 outline-none bg-white cursor-pointer disabled:opacity-50"
                >
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>

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
                          const isAdminMsg = msg.sender?.includes('admin') || msg.sender?.includes('@pinnawala');
                          return (
                            <div key={i} className={`flex ${isAdminMsg ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
                                msg.is_internal
                                  ? 'bg-amber-50 border border-amber-200 text-amber-900 rounded-tr-sm'
                                  : isAdminMsg
                                    ? 'bg-blue-500 text-white rounded-tr-sm'
                                    : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                              }`}>
                                <p className={`text-xs font-bold mb-1 flex items-center gap-1 ${
                                  msg.is_internal ? 'text-amber-700'
                                  : isAdminMsg    ? 'text-blue-100'
                                  : 'text-slate-500'
                                }`}>
                                  {msg.is_internal && <Lock size={10} />}
                                  {msg.is_internal ? 'Internal Note' : isAdminMsg ? 'You (Admin)' : 'User'}
                                  {' · '}{msg.sender}
                                </p>
                                <p>{msg.text}</p>
                                <p className={`text-[10px] mt-1 ${
                                  msg.is_internal ? 'text-amber-600'
                                  : isAdminMsg    ? 'text-blue-200'
                                  : 'text-slate-400'
                                }`}>
                                  {new Date(msg.timestamp).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      )}

                      {/* Admin reply box */}
                      <div className="pt-3 space-y-2 border-t border-slate-100">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer w-fit">
                          <input
                            type="checkbox"
                            checked={isInternal}
                            onChange={e => setIsInternal(e.target.checked)}
                            className="rounded border-slate-300"
                          />
                          <Lock size={12} className="text-amber-600" />
                          Internal note (hidden from user)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder={isInternal ? 'Add internal staff note...' : 'Reply to user...'}
                            value={replyText}
                            onChange={e => setReplyText(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleReply(ticket.id)}
                            className={`flex-1 px-4 py-2.5 border rounded-xl text-sm outline-none focus:ring-2 transition ${
                              isInternal
                                ? 'border-amber-300 bg-amber-50 focus:border-amber-400 focus:ring-amber-400/20'
                                : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'
                            }`}
                          />
                          <button
                            onClick={() => handleReply(ticket.id)}
                            disabled={replying || !replyText.trim()}
                            className={`px-4 py-2.5 rounded-xl font-bold text-sm text-white disabled:opacity-40 transition ${
                              isInternal ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-500 hover:bg-blue-600'
                            }`}
                          >
                            {replying
                              ? <Loader2 size={14} className="animate-spin" />
                              : <Send size={14} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
