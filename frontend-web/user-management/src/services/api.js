import axios from "axios"

const API = axios.create({
  baseURL: "http://localhost:8000",
})

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token")
  if (token) req.headers.Authorization = `Bearer ${token}`
  return req
})

export const registerUser    = (data)          => API.post("/auth/register", data)
export const loginUser       = (data)          => API.post("/auth/login", data)
export const uploadKYC       = (formData)      => API.post("/auth/seller/upload-kyc", formData)
export const getPendingKYC   = ()              => API.get("/auth/admin/pending-kyc")
export const getAllUsers      = ()              => API.get("/auth/admin/users")
export const updateKYCStatus = (email, action) => API.put(`/auth/admin/kyc/${email}/${action}`)
export const banUser         = (email)         => API.put(`/auth/admin/ban/${email}`)

export default API