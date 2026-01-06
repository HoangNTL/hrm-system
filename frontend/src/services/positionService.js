import { positionAPI } from '@api/positionAPI';

export const positionService = {
  async getPositions({ page = 1, limit = 100, search = '' } = {}) {
    const params = { page, limit, search };
    const response = await positionAPI.getPositions(params);
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

  async deletePosition(id) {
    const response = await positionAPI.deletePosition(id);
    return response.data;
  },
};
