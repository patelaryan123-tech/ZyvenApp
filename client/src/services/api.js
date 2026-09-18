import axios from 'axios';
import { auth } from '../config/firebase';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use(async (config) => {
  const localToken = localStorage.getItem('zyven_token');
  if (localToken) {
    config.headers.Authorization = `Bearer ${localToken}`;
  } else if (auth.currentUser) {
    try {
      const token = await auth.currentUser.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    } catch (e) {}
  }
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data?.message || error.message);
    return Promise.reject(error);
  }
);

export default api;
