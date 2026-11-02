import apiClient from './client';

export const roomApi = {
  /**
   * Search and filter rooms by category, keyword query, and status.
   */
  searchRooms: async (params = {}) => {
    return apiClient.get('/rooms', { params });
  },

  /**
   * Fetch standard enum categories supported by the platform.
   */
  getCategories: async () => {
    return apiClient.get('/rooms/categories');
  },

  /**
   * Get complete details of a room by roomCode or UUID.
   */
  getRoomDetails: async (roomCode) => {
    return apiClient.get(`/rooms/${encodeURIComponent(roomCode)}`);
  },

  /**
   * Create an instant live room.
   */
  createInstantRoom: async (payload) => {
    return apiClient.post('/rooms/instant', payload);
  },

  /**
   * Schedule a future collaborative room with start and end times.
   */
  scheduleRoom: async (payload) => {
    return apiClient.post('/rooms/schedule', payload);
  },

  /**
   * Register user as participant in a room.
   */
  joinRoom: async (roomCode) => {
    return apiClient.post(`/rooms/${encodeURIComponent(roomCode)}/join`);
  },

  /**
   * Remove user from room participants.
   */
  leaveRoom: async (roomCode) => {
    return apiClient.post(`/rooms/${encodeURIComponent(roomCode)}/leave`);
  },

  /**
   * Host modifies room settings (title, description, category, times, privacy).
   */
  updateRoom: async (roomId, updates) => {
    return apiClient.patch(`/rooms/${roomId}`, updates);
  },

  /**
   * Host terminates the meeting room.
   */
  endRoom: async (roomId) => {
    return apiClient.patch(`/rooms/${roomId}/end`);
  },

  /**
   * Host regenerates the private invite token.
   */
  regenerateInvite: async (roomId) => {
    return apiClient.post(`/rooms/${roomId}/regenerate-invite`);
  },
};

export default roomApi;

