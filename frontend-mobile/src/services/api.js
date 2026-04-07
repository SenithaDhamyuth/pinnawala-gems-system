import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Change this to your computer's local IP when testing on phone
// e.g. 192.168.1.10:5000 — NOT localhost (localhost doesn't work on phones)
const BASE_URL = 'http://192.168.1.10:5000/api';

const api = axios.create({ baseURL: BASE_URL });

// Automatically attach the JWT token to every request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const fetchGems = () => api.get('/gems');
export const fetchGemById = (id) => api.get(`/gems/${id}`);
export const createGem = (data) => api.post('/gems', data);
export const updateGem = (id, data) => api.put(`/gems/${id}`, data);
export const deleteGem = (id) => api.delete(`/gems/${id}`);
export const createOffer = (data) => api.post('/offers', data);