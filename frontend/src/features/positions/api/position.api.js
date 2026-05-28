import axiosClient from '@/shared/api/axiosClient';
import { normalizePaginatedResponse } from '@/shared/api/pagination';

export const positionAPI = {
  async getPositions(params = {}) {
    const response = await axiosClient.get('/positions', { params });
    return response.data;
  },

  async listPositions({ page = 1, limit = 100, search = '' } = {}) {
    const response = await this.getPositions({ page, limit, search });
    return normalizePaginatedResponse(response, page, limit);
  },

  async createPosition(data) {
    const response = await axiosClient.post('/positions', data);
    return response.data;
  },

  async createPositionRecord(data) {
    const response = await this.createPosition(data);
    return response.data;
  },

  async updatePosition(id, data) {
    const response = await axiosClient.put(`/positions/${id}`, data);
    return response.data;
  },

  async updatePositionRecord(id, data) {
    const response = await this.updatePosition(id, data);
    return response.data;
  },

  async deletePosition(id) {
    const response = await axiosClient.delete(`/positions/${id}`);
    return response.data;
  },

  async deletePositionRecord(id) {
    const response = await this.deletePosition(id);
    return response.data;
  },
};

export default positionAPI;
