import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5001/api",
});

API.interceptors.request.use((req) => {
  // "token"     → set by Login.jsx / Register.jsx (regular buyer/seller flow)
  // "authToken" → set by AuthContext.jsx (admin login flow)
  // Fallback ensures Admin JWTs are sent correctly on all shared API calls.
  const token = localStorage.getItem("token") || localStorage.getItem("authToken");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// ── Auth ──────────────────────────────────────────────────────────────────────
export const registerUser   = (data)           => API.post("/auth/register", data).then(r => r.data);
export const loginUser      = (data)           => API.post("/auth/login", data).then(r => r.data);
export const uploadKYC      = (formData)       => 
  API.post("/auth/kyc/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then(r => r.data);

// ── Gems — Public ─────────────────────────────────────────────────────────────
export const getGemstones   = ()               => API.get("/gems").then(r => r.data);
export const getGemById     = (id)             => API.get(`/gems/${id}`).then(r => r.data);

// ── Gems — Seller ─────────────────────────────────────────────────────────────
export const getMyGems      = ()               => API.get("/gems/my/listings").then(r => r.data);
export const createGemstone = (data)           => API.post("/gems", data, {
  headers: { "Content-Type": "multipart/form-data" },
}).then(r => r.data);
export const updateGemstone = (id, data)       => API.put(`/gems/${id}`, data).then(r => r.data);
export const deleteGemstone = (id)             => API.delete(`/gems/${id}`).then(r => r.data);

// ── Gems — Admin (Company Inventory) ───────────────────────────────────────────
export const createGem      = (data)           => API.post("/gems", data, {
  headers: { "Content-Type": "multipart/form-data" },
}).then(r => r.data);

// ── Gems — Admin ──────────────────────────────────────────────────────────────
export const getAdminGems   = ()               => API.get("/gems/admin/all").then(r => r.data);
export const getAdminCompanyGems = ()           => API.get("/gems/admin/company").then(r => r.data);
export const updateGemStatus= (id, status)     => API.patch(`/gems/${id}/status`, { status }).then(r => r.data);
export const deleteAnyGem   = (id)             => API.delete(`/gems/${id}`).then(r => r.data);

// ── Offers — Buyer ────────────────────────────────────────────────────────────
export const createOffer    = (data)           => API.post("/offers", data).then(r => r.data);
export const getBuyerOffers = ()               => API.get("/offers/buyer").then(r => r.data);
export const processOfferPayment = async (offerId) => { return await API.post(`/offers/${offerId}/pay`); };

// ── Offers — Seller ───────────────────────────────────────────────────────────
export const getSellerOffers= ()               => API.get("/offers/seller").then(r => r.data);
export const respondToOffer = (id, data)       => API.patch(`/offers/${id}/respond`, data).then(r => r.data);
export const acceptCounter  = (id)             => API.patch(`/offers/${id}/accept-counter`).then(r => r.data);

// ── Admin — Users & KYC ───────────────────────────────────────────────────────
export const getAllUsers     = ()               => API.get("/users").then(r => r.data);
export const approveSeller   = (id)             => API.put(`/users/${id}/approve`).then(r => r.data);
// Keeping the old updateKYCStatus for backward compatibility if needed elsewhere
export const updateKYCStatus = (id, kycStatus)  => API.patch(`/users/${id}/kyc`, { kycStatus }).then(r => r.data);

// ── Ads — Public ──────────────────────────────────────────────────────────────
export const getActiveAds   = ()               => API.get("/ads").then(r => r.data);
export const getAdsByPosition = (position)     => API.get(`/ads/position/${position}`).then(r => r.data);

// ── Ads — Admin ───────────────────────────────────────────────────────────────
// createAd and updateAd both accept a plain FormData object so that the image
// file reaches the Multer middleware on the backend.
// Build FormData in the caller like this:
//   const fd = new FormData();
//   fd.append('title', 'My Ad');
//   fd.append('image', fileInput.files[0]);   // optional — omit to keep existing image
//   fd.append('target_gem_id', gemId);        // optional
//   fd.append('status', 'Active');            // optional

export const getAllAds      = ()               => API.get("/ads/admin/all").then(r => r.data);

export const createAd       = (formData)       =>
  API.post("/ads", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then(r => r.data);

export const updateAd       = (id, formData)   =>
  API.put(`/ads/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then(r => r.data);

export const deleteAd       = (id)             => API.delete(`/ads/${id}`).then(r => r.data);

// ── Seller Profile & Storefront ──────────────────────────────────────────────
export const getStorefront      = (id)   => API.get(`/seller/storefront/${id}`).then(r => r.data);
export const getSellerDirectory = ()     => API.get("/seller/directory").then(r => r.data);
export const updateSellerProfile = (formData) => API.put("/seller/profile", formData).then(r => r.data);

// ── Payments & Wallet ─────────────────────────────────────────────────────────
export const processPayment    = (data)  => API.post("/payments", data).then(r => r.data);
export const getMyWallet       = ()      => API.get("/payments/my").then(r => r.data);
export const getAdminRevenue   = ()      => API.get("/payments/admin/revenue").then(r => r.data);

// ── Learning Hub — Public ─────────────────────────────────────────────────────
export const getLearningContent = (filters = {}) => {
  let url = "/learning";
  const params = new URLSearchParams();
  if (filters.category) params.append("category", filters.category);
  if (filters.content_type) params.append("content_type", filters.content_type);
  if (filters.q) params.append("q", filters.q);
  if (params.toString()) url += `?${params.toString()}`;
  return API.get(url).then(r => r.data);
};

// ── Learning Hub — Admin ──────────────────────────────────────────────────────
export const getAdminLearningContent = (filters = {}) => {
  let url = "/learning/admin/all";
  const params = new URLSearchParams();
  if (filters.category) params.append("category", filters.category);
  if (filters.content_type) params.append("content_type", filters.content_type);
  if (filters.is_published !== undefined) params.append("is_published", filters.is_published);
  if (params.toString()) url += `?${params.toString()}`;
  return API.get(url).then(r => r.data);
};

export const createLearningContent = (data) => 
  API.post("/learning", data).then(r => r.data);

export const updateLearningContent = (id, data) => 
  API.put(`/learning/${id}`, data).then(r => r.data);

export const deleteLearningContent = (id) => 
  API.delete(`/learning/${id}`).then(r => r.data);

export const togglePublishLearning = (id) => 
  API.patch(`/learning/${id}/publish`).then(r => r.data);

// ── Feedback & Rating ────────────────────────────────────────────────────────
export const submitFeedback = (data) => API.post("/feedback", data).then(r => r.data);
export const getAllFeedback = () => API.get("/feedback").then(r => r.data);

export default API;