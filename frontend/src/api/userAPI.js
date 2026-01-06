import apiClient from './axios';

export const userAPI = {
  async getUsers(params = {}) {
    const response = await apiClient.get('/users', { params });
    return response.data;
  },

  async createUser(payload) {
    const response = await apiClient.post('/users', payload);
    return response.data;
  },

  async resetPassword(id) {
    const response = await apiClient.post(`/users/${id}/reset-password`);
    return response.data;
  },

  async toggleLock(id) {
    const response = await apiClient.patch(`/users/${id}/toggle-lock`);
    return response.data;
  },

  async getMe() {
    const response = await apiClient.get('/users/me');
    return response.data;
  },

  async updateMe(payload) {
    const response = await apiClient.put('/users/me', payload);
    return response.data;
  },
};
