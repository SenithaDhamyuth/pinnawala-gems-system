import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5001/api",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
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

// ── Offers — Seller ───────────────────────────────────────────────────────────
export const getSellerOffers= ()               => API.get("/offers/seller").then(r => r.data);
export const respondToOffer = (id, data)       => API.patch(`/offers/${id}/respond`, data).then(r => r.data);
export const acceptCounter  = (id)             => API.patch(`/offers/${id}/accept-counter`).then(r => r.data);

// ── Admin — Users & KYC ───────────────────────────────────────────────────────
export const getAllUsers     = ()               => API.get("/auth/users").then(r => r.data);
export const updateKYCStatus= (id, kycStatus)  => API.patch(`/auth/users/${id}/kyc`, { kycStatus }).then(r => r.data);

// ── Ads — Public ──────────────────────────────────────────────────────────────
export const getActiveAds   = ()               => API.get("/ads").then(r => r.data);

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

export default API;