import apiClient from './client';

export const goalApi = {
  // Retrieve user goals and to-dos
  getGoals: async (filter = 'all') => {
    return apiClient.get('/goals', { params: { filter } });
  },

  // Create new goal or to-do task
  createGoal: async (payload) => {
    return apiClient.post('/goals', payload);
  },

  // Update existing goal or task
  updateGoal: async (goalId, updates) => {
    return apiClient.patch(`/goals/${goalId}`, updates);
  },

  // Toggle goal completion status
  toggleGoal: async (goalId) => {
    return apiClient.patch(`/goals/${goalId}/toggle`);
  },

  // Delete goal or to-do item
  deleteGoal: async (goalId) => {
    return apiClient.delete(`/goals/${goalId}`);
  },
};

export default goalApi;

