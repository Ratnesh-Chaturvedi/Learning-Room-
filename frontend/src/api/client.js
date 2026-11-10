import axios from 'axios';

const isProductionHost =
  typeof window !== 'undefined' &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1';

const configuredApiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
const rawApiUrl =
  isProductionHost && (!configuredApiUrl || configuredApiUrl.includes('localhost'))
    ? 'https://learning-room-backend.onrender.com/api/v1'
    : configuredApiUrl || 'http://localhost:5000/api/v1';

const API_BASE_URL = rawApiUrl.endsWith('/api/v1') ? rawApiUrl : `${rawApiUrl}/api/v1`;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 15000,
});

// Request interceptor: Attach JWT token from localStorage
apiClient.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('learningroom_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Ignore localStorage access failures
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Extract data and handle auth errors
apiClient.interceptors.response.use(
  (response) => {
    // Backend standard format: { statusCode, data, message, success }
    return response.data;
  },
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred.';

    if (status === 401) {
      // Check if not already on the login or public page
      try {
        localStorage.removeItem('learningroom_token');
        localStorage.removeItem('learningroom_user');
      } catch (_e) {
        // Ignore localStorage access failures
      }
      
      const currentPath = window.location.pathname;
      if (currentPath !== '/' && currentPath !== '/login') {
        window.dispatchEvent(new CustomEvent('learningroom:auth-expired'));
      }
    }

    return Promise.reject(new Error(message));
  }
);

export default apiClient;

