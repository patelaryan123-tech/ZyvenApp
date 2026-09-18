import api from './api';

export const authService = {
  // Sync Firebase authenticated user with MongoDB
  syncUser: async (data) => {
    const response = await api.post('/auth/sync', data);
    return response.data;
  },

  // Get current user profile
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (data) => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },

  // Delete user profile
  deleteAccount: async () => {
    const response = await api.delete('/auth/profile');
    return response.data;
  }
};

export default authService;
