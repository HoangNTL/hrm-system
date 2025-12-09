import { departmentAPI } from '../api';

export const departmentService = {
  async getDepartments({ page = 1, limit = 10, search = '' } = {}) {
    try {
      const params = { page, limit, search };
      const response = await departmentAPI.getDepartments(params);
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
      console.error('Error fetching departments:', error);
      throw error;
    }
  },

  async getDepartmentById(id) {
    try {
      const response = await departmentAPI.getDepartmentById(id);
      return response.data;
    } catch (error) {
      console.error('Error fetching department:', error);
      throw error;
    }
  },
  async createDepartment(departmentData) {
    try {
      const response = await departmentAPI.createDepartment(departmentData);
      return response.data;
    } catch (error) {
      console.error('Error creating department:', error);
      throw error;
    }
  },
};
