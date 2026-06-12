import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically attach authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cloudops_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle global auth errors (e.g. expired tokens)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the backend returns unauthorized (e.g., token invalid or expired),
    // we can clear local storage so the frontend redirects to login.
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('cloudops_token');
      localStorage.removeItem('cloudops_user');
      // If we are in the browser, we could redirect or let context state handle it
    }
    return Promise.reject(error);
  }
);

export default api;
