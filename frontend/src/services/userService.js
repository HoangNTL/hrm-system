import { userAPI } from '@api/userAPI';

export const userService = {
  // Get all users with pagination and search
  async getUsers({ page = 1, limit = 10, search = '', role = '', status = '' } = {}) {
    try {
      const params = { page, limit };
      if (search) params.search = search;
      if (role !== undefined && role !== '') params.role = role;
      if (status !== undefined && status !== '') params.status = status;

      const response = await userAPI.getUsers(params);

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
      console.error('Error fetching users:', error);
      throw {
        message: error.message || 'Failed to fetch users',
        status: error.status,
        errors: error.errors || {},
      };
    }
  },

  // Get user statistics
  async getUserStats() {
    try {
      const response = await userAPI.getUserStats();
      return response.data || {};
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw {
        message: error.message || 'Failed to fetch user statistics',
        status: error.status,
      };
    }
  },

  // Reset user password
  async resetPassword(id) {
    try {
      const response = await userAPI.resetPassword(id);
      return response.data || {};
    } catch (error) {
      console.error('Error resetting password:', error);
      throw {
        message: error.message || 'Failed to reset password',
        status: error.status,
        errors: error.errors || {},
      };
    }
  },

  // Toggle user lock status
  async toggleLock(id) {
    try {
      const response = await userAPI.toggleLock(id);
      return response.data || {};
    } catch (error) {
      console.error('Error toggling user lock:', error);
      throw {
        message: error.message || 'Failed to toggle user lock status',
        status: error.status,
        errors: error.errors || {},
      };
    }
  },

  // Bulk delete users
  async bulkDelete(ids) {
    try {
      const response = await userAPI.bulkDelete(ids);
      return response.data || {};
    } catch (error) {
      console.error('Error bulk deleting users:', error);
      throw {
        message: error.message || 'Failed to delete users',
        status: error.status,
        errors: error.errors || {},
      };
    }
  },
};
