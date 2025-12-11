import apiClient from './axios';

export const positionAPI = {
  async getPositions(params = {}) {
    const response = await apiClient.get('/positions', { params });
    return response.data;
  },

  async getPositionById(id) {
    const response = await apiClient.get(`/positions/${id}`);
    return response.data;
  },
};
