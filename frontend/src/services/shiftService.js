import { shiftAPI } from '@api/shiftAPI';

export const shiftService = {
  async getShifts({ page = 1, limit = 10, search = '' } = {}) {
    const params = { page, limit, search };
    const response = await shiftAPI.getShifts(params);
    const { items = [], pagination = {} } = response.data || {};

    return {
      data: items,
      pagination: {
        page: pagination.page || page,
        limit: pagination.limit || limit,
        total: pagination.total || 0,
        totalPages: pagination.total_pages || 1,
      },
    };
  },

  async createShift(shiftData) {
    const response = await shiftAPI.createShift(shiftData);
    return response.data;
  },

  async updateShift(id, shiftData) {
    const response = await shiftAPI.updateShift(id, shiftData);
    return response.data;
  },

  async deleteShift(id) {
    const response = await shiftAPI.deleteShift(id);
    return response.data;
  },
};
