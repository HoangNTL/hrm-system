import axiosClient from '@/shared/api/axiosClient';
import { normalizePaginatedResponse } from '@/shared/api/pagination';

export const shiftAPI = {
  async getShifts(params = {}) {
    const response = await axiosClient.get('/shifts', { params });
    return response.data;
  },

  async listShifts({ page = 1, limit = 10, search = '' } = {}) {
    const response = await this.getShifts({ page, limit, search });
    return normalizePaginatedResponse(response, page, limit);
  },

  async createShift(shiftData) {
    const response = await axiosClient.post('/shifts', shiftData);
    return response.data;
  },

  async createShiftRecord(shiftData) {
    const response = await this.createShift(shiftData);
    return response.data;
  },

  async updateShift(id, shiftData) {
    const response = await axiosClient.put(`/shifts/${id}`, shiftData);
    return response.data;
  },

  async updateShiftRecord(id, shiftData) {
    const response = await this.updateShift(id, shiftData);
    return response.data;
  },

  async deleteShift(id) {
    const response = await axiosClient.delete(`/shifts/${id}`);
    return response.data;
  },

  async deleteShiftRecord(id) {
    const response = await this.deleteShift(id);
    return response.data;
  },
};

export default shiftAPI;
