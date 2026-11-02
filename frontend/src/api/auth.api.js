import apiClient from './client';

export const authApi = {
  /**
   * Login or register via Google ID token (One-tap / Credential).
   */
  googleLogin: async (idToken) => {
    return apiClient.post('/auth/google', { idToken });
  },

  /**
   * Fetches the current authenticated user's session.
   */
  getMe: async () => {
    return apiClient.get('/auth/me');
  },

  /**
   * Fast dev mode login for testing without live Google ID token.
   */
  devLogin: async (userNum = 1) => {
    return apiClient.post('/auth/dev-login', { userNum });
  },

  /**
   * Logs out the user and clears session cookies on the server.
   */
  logout: async () => {
    return apiClient.post('/auth/logout');
  },

  /**
   * Get server-redirect Google OAuth URL.
   */
  getGoogleOAuthUrl: () => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
    return `${baseUrl}/auth/google`;
  },
};

export default authApi;

