import apiClient from './client';

export const goalApi = {
  /**
   * Retrieves all goals and to-dos for the authenticated user.
   */
  getGoals: async (filter = 'all') => {
    return apiClient.get('/goals', { params: { filter } });
  },

  /**
   * Creates a new goal or to-do task.
   */
  createGoal: async (payload) => {
    return apiClient.post('/goals', payload);
  },

  /**
   * Updates an existing goal or to-do task (title, counts, completion).
   */
  updateGoal: async (goalId, updates) => {
    return apiClient.patch(`/goals/${goalId}`, updates);
  },

  /**
   * Toggles completion status of a goal / to-do.
   */
  toggleGoal: async (goalId) => {
    return apiClient.patch(`/goals/${goalId}/toggle`);
  },

  /**
   * Deletes a goal or to-do item.
   */
  deleteGoal: async (goalId) => {
    return apiClient.delete(`/goals/${goalId}`);
  },
};

export default goalApi;

