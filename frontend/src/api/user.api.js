import apiClient from './client';

export const userApi = {
  /**
   * Fetch authenticated user's profile and stats.
   */
  getProfile: async () => {
    return apiClient.get('/users/profile');
  },

  /**
   * Update authenticated user's profile information.
   */
  updateProfile: async (updates) => {
    return apiClient.patch('/users/profile', updates);
  },

  /**
   * Fetch rooms created and joined by the user.
   */
  getMyRooms: async () => {
    return apiClient.get('/users/my-rooms');
  },
};

export default userApi;

