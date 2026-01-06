import apiClient from './axios';

export const positionAPI = {
  async getPositions(params = {}) {
    const response = await apiClient.get('/positions', { params });
    return response.data;
  },

  async deletePosition(id) {
    const response = await apiClient.delete(`/positions/${id}`);
    return response.data;
  },
};
