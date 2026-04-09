import axios from "axios"

const API = axios.create({
  baseURL: "http://localhost:8000",
})

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token")
  if (token) req.headers.Authorization = `Bearer ${token}`
  return req
})

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Retry once with 127.0.0.1 when localhost is unreachable.
    if (error?.message === "Network Error" && error.config && !error.config.__retriedWith127) {
      error.config.__retriedWith127 = true
      error.config.baseURL = "http://127.0.0.1:8000"
      return API.request(error.config)
    }
    return Promise.reject(error)
  }
)

export const registerUser    = (data)          => API.post("/auth/register", data)
export const loginUser       = (data)          => API.post("/auth/login", data)
export const uploadKYC       = (formData)      => API.post("/auth/seller/upload-kyc", formData)
export const getPendingKYC   = ()              => API.get("/auth/admin/pending-kyc")
export const getAllUsers      = ()              => API.get("/auth/admin/users")
export const updateKYCStatus = (email, action) => API.put(`/auth/admin/kyc/${email}/${action}`)
export const banUser         = (email)         => API.put(`/auth/admin/ban/${email}`)

export default API