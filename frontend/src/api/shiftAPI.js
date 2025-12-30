import apiClient from './axios';

export const shiftAPI = {
  async getShifts(params = {}) {
    const response = await apiClient.get('/shifts', { params });
    return response.data;
  },

  async getShiftById(id) {
    const response = await apiClient.get(`/shifts/${id}`);
    return response.data;
  },

  async createShift(shiftData) {
    const response = await apiClient.post('/shifts', shiftData);
    return response.data;
  },

  async updateShift(id, shiftData) {
    const response = await apiClient.put(`/shifts/${id}`, shiftData);
    return response.data;
  },

  async deleteShift(id) {
    const response = await apiClient.delete(`/shifts/${id}`);
    return response.data;
  },
};
