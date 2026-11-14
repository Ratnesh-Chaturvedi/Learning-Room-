import apiClient from './client';

export const authApi = {
  // Login with Google ID token
  googleLogin: async (idToken) => {
    return apiClient.post('/auth/google', { idToken });
  },

  // Fetch current user session
  getMe: async () => {
    return apiClient.get('/auth/me');
  },

  // Dev login without live Google credentials
  devLogin: async (userNum = 1) => {
    return apiClient.post('/auth/dev-login', { userNum });
  },

  // Log out and clear session
  logout: async () => {
    return apiClient.post('/auth/logout');
  },

  // Get server-redirect Google OAuth URL
  getGoogleOAuthUrl: () => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
    return `${baseUrl}/auth/google`;
  },
};

export default authApi;

