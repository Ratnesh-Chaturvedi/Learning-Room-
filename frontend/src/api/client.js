import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

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
      } catch {}
      
      const currentPath = window.location.pathname;
      if (currentPath !== '/' && currentPath !== '/login') {
        window.dispatchEvent(new CustomEvent('learningroom:auth-expired'));
      }
    }

    return Promise.reject(new Error(message));
  }
);

export default apiClient;

