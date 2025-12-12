import apiClient from './axios';

export const userAPI = {
  async getUsers(params = {}) {
    const response = await apiClient.get('/users', { params });
    return response.data;
  },
};
