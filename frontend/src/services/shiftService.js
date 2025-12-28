import { shiftAPI } from '@api/shiftAPI';

export const shiftService = {
  async getShifts({ page = 1, limit = 10, search = '' } = {}) {
    try {
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
    } catch (error) {
      console.error('Error fetching shifts:', error);
      throw {
        message: error.message || 'Failed to fetch shifts',
        status: error.status,
        errors: error.errors || {},
      };
    }
  },

  async getShiftById(id) {
    try {
      const response = await shiftAPI.getShiftById(id);
      return response.data?.shift || response.data;
    } catch (error) {
      console.error('Error fetching shift:', error);
      throw {
        message: error.message || 'Failed to fetch shift',
        status: error.status,
        errors: error.errors || {},
      };
    }
  },

  async createShift(shiftData) {
    try {
      const response = await shiftAPI.createShift(shiftData);
      return response.data;
    } catch (error) {
      console.error('Error creating shift:', error);
      throw {
        message: error.message || 'Failed to create shift',
        status: error.status,
        errors: error.errors || {},
      };
    }
  },

  async updateShift(id, shiftData) {
    try {
      const response = await shiftAPI.updateShift(id, shiftData);
      return response.data;
    } catch (error) {
      console.error('Error updating shift:', error);
      throw {
        message: error.message || 'Failed to update shift',
        status: error.status,
        errors: error.errors || {},
      };
    }
  },

  async deleteShift(id) {
    try {
      const response = await shiftAPI.deleteShift(id);
      return response.data;
    } catch (error) {
      console.error('Error deleting shift:', error);
      throw {
        message: error.message || 'Failed to delete shift',
        status: error.status,
        errors: error.errors || {},
      };
    }
  },
};
