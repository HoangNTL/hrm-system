import { userAPI } from '@api/userAPI';

export const userService = {
  // Get all users with pagination and search
  async getUsers({ page = 1, limit = 10, search = '', role = '', status = '' } = {}) {
    const params = { page, limit };
    if (search) params.search = search;
    if (role !== undefined && role !== '') params.role = role;
    if (status !== undefined && status !== '') params.status = status;

    const response = await userAPI.getUsers(params);
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

  // Reset user password
  async resetPassword(id) {
    const response = await userAPI.resetPassword(id);
    return response.data || {};
  },

  // Toggle user lock status
  async toggleLock(id) {
    const response = await userAPI.toggleLock(id);
    return response.data || {};
  },

  async getMe() {
    const response = await userAPI.getMe();
    return response.data || response;
  },

  async updateMe(payload) {
    const response = await userAPI.updateMe(payload);
    return response.data || response;
  },
};
