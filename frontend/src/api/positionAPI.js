import apiClient from './axios';

export const positionAPI = {
  async getPositions(params = {}) {
    const response = await apiClient.get('/positions', { params });
    return response.data;
  },

  async createPosition(data) {
    const response = await apiClient.post('/positions', data);
    return response.data;
  },

  async updatePosition(id, data) {
    const response = await apiClient.put(`/positions/${id}`, data);
    return response.data;
  },

  async deletePosition(id) {
    const response = await apiClient.delete(`/positions/${id}`);
    return response.data;
  },
};
