import apiClient from './client';

export const roomApi = {
  // Search and filter rooms
  searchRooms: async (params = {}) => {
    return apiClient.get('/rooms', { params });
  },

  // Fetch standard room categories
  getCategories: async () => {
    return apiClient.get('/rooms/categories');
  },

  // Get complete room details by code or ID
  getRoomDetails: async (roomCode) => {
    return apiClient.get(`/rooms/${encodeURIComponent(roomCode)}`);
  },

  // Create instant room
  createInstantRoom: async (payload) => {
    return apiClient.post('/rooms/instant', payload);
  },

  // Schedule future collaborative room
  scheduleRoom: async (payload) => {
    return apiClient.post('/rooms/schedule', payload);
  },

  // Register user as room participant
  joinRoom: async (roomCode) => {
    return apiClient.post(`/rooms/${encodeURIComponent(roomCode)}/join`);
  },

  // Remove user from room participants
  leaveRoom: async (roomCode) => {
    return apiClient.post(`/rooms/${encodeURIComponent(roomCode)}/leave`);
  },

  // Update room settings (Host only)
  updateRoom: async (roomId, updates) => {
    return apiClient.patch(`/rooms/${roomId}`, updates);
  },

  // Start scheduled room early (Host only)
  startRoom: async (roomId) => {
    return apiClient.patch(`/rooms/${roomId}/start`);
  },

  // End meeting room (Host only)
  endRoom: async (roomId) => {
    return apiClient.patch(`/rooms/${roomId}/end`);
  },

  // Regenerate private invite token (Host only)
  regenerateInvite: async (roomId) => {
    return apiClient.post(`/rooms/${roomId}/regenerate-invite`);
  },
};

export default roomApi;

