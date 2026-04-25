// Centralized API service layer
// All requests are proxied through Vite to http://localhost:8000

const API_BASE = '/api';

// Helper to handle responses
async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'API Error');
  }
  return res.json();
}

// ─── Auction Types ────────────────────────────────────────────────────────────

export interface MediaItem {
  url: string;
  type: 'image' | 'video';
  isPinned?: boolean;
}

export interface Auction {
  id: string;
  title: string;
  description: string;
  startDate: string; // ISO string from API
  endDate: string;
  currentBid: number;
  startingBid: number;
  media: MediaItem[];
  legalDocuments: string[];
  remarks: string;
  gemType: string;
  carat: number;
  origin: string;
  certification: string;
  status: 'upcoming' | 'active' | 'completed';
  winnerId?: string;
  winnerName?: string;
}

export interface AuctionCreatePayload {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  startingBid: number;
  media: MediaItem[];
  legalDocuments: string[];
  remarks: string;
  gemType: string;
  carat: number;
  origin: string;
  certification: string;
}

// ─── Bid Types ────────────────────────────────────────────────────────────────

export interface Bid {
  id: string;
  auctionId: string;
  userId: string;
  userName: string;
  amount: number;
  timestamp: string;     // ISO string (with microsecond precision)
  timestamp_us: number;  // microseconds since epoch (for exact tie comparison)
  tie_flag: boolean;     // true if this bid was simultaneously-tied
}

export interface BidCreatePayload {
  auctionId: string;
  userId: string;
  userName: string;
  amount: number;
}

// ─── Settings Types ───────────────────────────────────────────────────────────

export interface Settings {
  id: string;
  auctionRules: string[];
}

export interface SettingsUpdatePayload {
  auctionRules: string[];
}

// ─── Auction API ─────────────────────────────────────────────────────────────

export const getAuctions = (status?: string): Promise<Auction[]> => {
  const url = status ? `${API_BASE}/auctions?status=${status}` : `${API_BASE}/auctions`;
  return fetch(url).then(r => handleResponse<Auction[]>(r));
};

export const getAuction = (id: string): Promise<Auction> =>
  fetch(`${API_BASE}/auctions/${id}`).then(r => handleResponse<Auction>(r));

export const createAuction = (data: AuctionCreatePayload): Promise<Auction> =>
  fetch(`${API_BASE}/auctions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(r => handleResponse<Auction>(r));

export const updateAuction = (id: string, data: Partial<AuctionCreatePayload>): Promise<Auction> =>
  fetch(`${API_BASE}/auctions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(r => handleResponse<Auction>(r));

export const deleteAuction = (id: string): Promise<{ message: string }> =>
  fetch(`${API_BASE}/auctions/${id}`, { method: 'DELETE' })
    .then(r => handleResponse<{ message: string }>(r));

// ─── Bids API ─────────────────────────────────────────────────────────────────

export const getBids = (auctionId: string): Promise<Bid[]> =>
  fetch(`${API_BASE}/bids/${auctionId}`).then(r => handleResponse<Bid[]>(r));

export const placeBid = (data: BidCreatePayload): Promise<Bid> =>
  fetch(`${API_BASE}/bids`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(r => handleResponse<Bid>(r));

export const getTieBids = (auctionId: string): Promise<Bid[]> =>
  fetch(`${API_BASE}/bids/ties/${auctionId}`).then(r => handleResponse<Bid[]>(r));

// ─── Settings API ─────────────────────────────────────────────────────────────

export const getSettings = (): Promise<Settings> =>
  fetch(`${API_BASE}/settings`).then(r => handleResponse<Settings>(r));

export const updateSettings = (data: SettingsUpdatePayload): Promise<Settings> =>
  fetch(`${API_BASE}/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(r => handleResponse<Settings>(r));

// ─── Utility API ──────────────────────────────────────────────────────────────

export const uploadFile = (file: File): Promise<{ url: string; filename: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  return fetch(`${API_BASE}/upload/`, {
    method: 'POST',
    body: formData,
  }).then(r => handleResponse<{ url: string; filename: string }>(r));
};
