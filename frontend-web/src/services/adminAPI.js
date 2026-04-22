import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('adminUser');
      localStorage.removeItem('adminRole');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export const adminAPI = {
  login: (email, password) => 
    apiClient.post('/api/auth/admin-login', { email, password }),
  
  getUsers: () => 
    apiClient.get('/api/admin/users'),
  
  getProducts: () => 
    apiClient.get('/api/admin/products'),
  
  getAnalytics: () => 
    apiClient.get('/api/admin/analytics'),
  
  getRevenue: () => 
    apiClient.get('/api/admin/revenue'),
  
  updateUser: (userId, data) => 
    apiClient.put(`/api/admin/users/${userId}`, data),
  
  deleteUser: (userId) => 
    apiClient.delete(`/api/admin/users/${userId}`),
  
  getAdminProfile: () => 
    apiClient.get('/api/admin/profile'),
  
  updateAdminProfile: (data) => 
    apiClient.put('/api/admin/profile', data),
};

export default apiClient;
