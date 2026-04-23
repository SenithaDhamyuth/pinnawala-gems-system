import toast from 'react-hot-toast';

const BASE_STYLE = {
  borderRadius: '12px',
  fontSize: '13px',
  fontWeight: '500',
  maxWidth: '360px',
  border: '1px solid rgba(255,255,255,0.06)',
};

const DARK_BASE = {
  ...BASE_STYLE,
  background: '#1e293b',
  color: '#f1f5f9',
};

const LIGHT_BASE = {
  ...BASE_STYLE,
  background: '#ffffff',
  color: '#0f172a',
  boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
};

export const showToast = {
  success: (msg) => toast.success(msg, {
    duration: 3500,
    style: { ...DARK_BASE, borderColor: 'rgba(52,211,153,0.25)' },
    iconTheme: { primary: '#34d399', secondary: '#1e293b' },
  }),

  error: (msg) => toast.error(msg, {
    duration: 4000,
    style: { ...DARK_BASE, borderColor: 'rgba(248,113,113,0.25)' },
    iconTheme: { primary: '#f87171', secondary: '#1e293b' },
  }),

  loading: (msg) => toast.loading(msg, {
    style: DARK_BASE,
  }),

  info: (msg, icon = '💬') => toast(msg, {
    icon,
    duration: 3500,
    style: DARK_BASE,
  }),

  offer: (msg) => toast(msg, {
    icon: '💎',
    duration: 4000,
    style: { ...DARK_BASE, borderColor: 'rgba(52,211,153,0.25)' },
  }),

  kyc: (msg) => toast(msg, {
    icon: '🛡️',
    duration: 4000,
    style: { ...DARK_BASE, borderColor: 'rgba(251,191,36,0.25)' },
  }),

  dismiss: (id) => toast.dismiss(id),
  dismissAll: () => toast.dismiss(),
};

export default showToast;