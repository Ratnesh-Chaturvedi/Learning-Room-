import apiClient from './client';

export const userApi = {
  // Fetch user profile and stats
  getProfile: async () => {
    return apiClient.get('/users/profile');
  },

  // Update profile details (name, avatar)
  updateProfile: async (updates) => {
    return apiClient.patch('/users/profile', updates);
  },

  // Upload user avatar image
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

  // Fetch rooms created and joined by user
  getMyRooms: async (filter = 'all') => {
    return apiClient.get('/users/my-rooms', { params: { filter } });
  },
};

export default userApi;
