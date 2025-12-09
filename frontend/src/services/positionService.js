import { positionAPI } from '../api';

export const positionService = {
  async getPositions({ page = 1, limit = 100, search = '' } = {}) {
    try {
      const params = { page, limit, search };
      const response = await positionAPI.getPositions(params);
      return {
        data: response.data,
        pagination: {
          page: response.pagination.page,
          limit: response.pagination.limit,
          total: response.pagination.total,
          totalPages: response.pagination.total_pages,
        },
      };
    } catch (error) {
      console.error('Error fetching positions:', error);
      throw error;
    }
  },

  async getPositionById(id) {
    try {
      const response = await positionAPI.getPositionById(id);
      return response.data;
    } catch (error) {
      console.error('Error fetching position:', error);
      throw error;
    }
  },
};
