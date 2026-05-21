import axios from 'axios';

let base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
if (base && !base.endsWith('/api') && !base.endsWith('/api/')) {
  base = base.endsWith('/') ? `${base}api` : `${base}/api`;
}
const API_BASE_URL = base;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to attach JWT token if it exists in localStorage
api.interceptors.request.use(
  (config) => {
    try {
      const authStorageStr = localStorage.getItem('auth-storage');
      if (authStorageStr) {
        const authData = JSON.parse(authStorageStr);
        if (authData?.state?.token) {
          config.headers.Authorization = `Bearer ${authData.state.token}`;
        }
      }
    } catch (e) {
      console.error('Error parsing auth storage', e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const apiRequest = async (url, options = {}) => {
  const method = options.method || 'GET';
  const data = options.body || options.data || null;
  const headers = options.headers || {};

  try {
    const response = await api({
      url,
      method,
      data,
      headers,
      ...options,
    });
    return response.data;
  } catch (error) {
    const responseData = error.response?.data || {};
    console.error(`API Request error on ${url}:`, responseData || error.message);
    
    // Auto redirect to login on token expiration or 401 Unauthorized
    if (error.response?.status === 401 || responseData.message === 'jwt expired') {
      localStorage.removeItem('auth-storage');
      if (!window.location.pathname.includes('/auth')) {
        window.location.href = '/auth/login';
      }
    }
    throw responseData || error;
  }
};

export default api;
