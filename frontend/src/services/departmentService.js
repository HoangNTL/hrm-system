import { departmentAPI } from '@api/departmentAPI';

export const departmentService = {
  async getDepartments({ page = 1, limit = 10, search = '' } = {}) {
    const params = { page, limit, search };
    const response = await departmentAPI.getDepartments(params);
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

  async createDepartment(departmentData) {
    const response = await departmentAPI.createDepartment(departmentData);
    return response.data;
  },

  async updateDepartment(id, departmentData) {
    const response = await departmentAPI.updateDepartment(id, departmentData);
    return response.data;
  },

  async deleteDepartment(id) {
    const response = await departmentAPI.deleteDepartment(id);
    return response.data;
  }
};
