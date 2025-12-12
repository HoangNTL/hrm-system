import { positionAPI } from '@api/positionAPI';

export const positionService = {
  async getPositions({ page = 1, limit = 100, search = '' } = {}) {
    try {
      const params = { page, limit, search };
      const response = await positionAPI.getPositions(params);

      // The response structure is { data: { items, pagination } }
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
    } catch (error) {
      console.error('Error fetching positions:', error);
      throw {
        message: error.message || 'Failed to fetch positions',
        status: error.status,
        errors: error.errors || {},
      };
    }
  },

  async getPositionById(id) {
    try {
      const response = await positionAPI.getPositionById(id);
      // The response structure is { data: { position } }
      return response.data?.position || response.data;
    } catch (error) {
      console.error('Error fetching position:', error);
      throw {
        message: error.message || 'Failed to fetch position',
        status: error.status,
        errors: error.errors || {},
      };
    }
  },

  async createPosition(positionData) {
    try {
      const response = await positionAPI.createPosition(positionData);
      return response.data;
    } catch (error) {
      console.error('Error creating position:', error);
      throw {
        message: error.message || 'Failed to create position',
        status: error.status,
        errors: error.errors || {},
      };
    }
  },

  async updatePosition(id, positionData) {
    try {
      const response = await positionAPI.updatePosition(id, positionData);
      return response.data;
    } catch (error) {
      console.error('Error updating position:', error);
      throw {
        message: error.message || 'Failed to update position',
        status: error.status,
        errors: error.errors || {},
      };
    }
  },

  async deletePosition(id) {
    try {
      const response = await positionAPI.deletePosition(id);
      return response.data;
    } catch (error) {
      console.error('Error deleting position:', error);
      throw {
        message: error.message || 'Failed to delete position',
        status: error.status,
        errors: error.errors || {},
      };
    }
  }
};
