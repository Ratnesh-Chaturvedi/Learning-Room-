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
   * Accepts plain object or FormData (for direct multipart avatar upload).
   */
  updateProfile: async (updates) => {
    return apiClient.patch('/users/profile', updates);
  },

  /**
   * Upload user avatar directly to Cloudinary and update profile.
   * @param {File | Blob | FormData} fileOrFormData
   */
  uploadAvatar: async (fileOrFormData) => {
    let formData;
    if (fileOrFormData instanceof FormData) {
      formData = fileOrFormData;
    } else {
      formData = new FormData();
      formData.append('avatar', fileOrFormData);
    }

    return apiClient.post('/users/avatar', formData);
  },

  /**
   * Fetch rooms created and joined by the user.
   */
  getMyRooms: async (filter = 'all') => {
    return apiClient.get('/users/my-rooms', { params: { filter } });
  },
};

export default userApi;
