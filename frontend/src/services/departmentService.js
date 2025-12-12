import { departmentAPI } from '@api/departmentAPI';

export const departmentService = {
  async getDepartments({ page = 1, limit = 10, search = '' } = {}) {
    try {
      const params = { page, limit, search };
      const response = await departmentAPI.getDepartments(params);

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
      console.error('Error fetching departments:', error);
      throw {
        message: error.message || 'Failed to fetch departments',
        status: error.status,
        errors: error.errors || {},
      };
    }
  },

  async getDepartmentById(id) {
    try {
      const response = await departmentAPI.getDepartmentById(id);
      // The response structure is { data: { department } }
      return response.data?.department || response.data;
    } catch (error) {
      console.error('Error fetching department:', error);
      throw {
        message: error.message || 'Failed to fetch department',
        status: error.status,
        errors: error.errors || {},
      };
    }
  },

  async createDepartment(departmentData) {
    try {
      const response = await departmentAPI.createDepartment(departmentData);
      return response.data;
    } catch (error) {
      console.error('Error creating department:', error);
      throw {
        message: error.message || 'Failed to create department',
        status: error.status,
        errors: error.errors || {},
      };
    }
  },

  async updateDepartment(id, departmentData) {
    try {
      const response = await departmentAPI.updateDepartment(id, departmentData);
      return response.data;
    } catch (error) {
      console.error('Error updating department:', error);
      throw {
        message: error.message || 'Failed to update department',
        status: error.status,
        errors: error.errors || {},
      };
    }
  },

  async deleteDepartment(id) {
    try {
      const response = await departmentAPI.deleteDepartment(id);
      return response.data;
    } catch (error) {
      console.error('Error deleting department:', error);
      throw {
        message: error.message || 'Failed to delete department',
        status: error.status,
        errors: error.errors || {},
      };
    }
  }
};
