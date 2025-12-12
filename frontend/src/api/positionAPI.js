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

  async createPosition(positionData) {
    const response = await apiClient.post('/positions', positionData);
    return response.data;
  },

  async updatePosition(id, positionData) {
    const response = await apiClient.put(`/positions/${id}`, positionData);
    return response.data;
  },

  async deletePosition(id) {
    const response = await apiClient.delete(`/positions/${id}`);
    return response.data;
  },
};
