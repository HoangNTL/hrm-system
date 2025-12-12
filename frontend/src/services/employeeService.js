import { employeeAPI } from '@api/employeeAPI';

export const employeeService = {
  // Get all employees with pagination, search, and filters
  async getEmployees({ page = 1, limit = 10, search = '', department_id, gender, work_status } = {}) {
    try {
      const params = { page, limit };
      if (search) params.search = search;
      if (department_id !== undefined && department_id !== '') params.department_id = department_id;
      if (gender !== undefined && gender !== '') params.gender = gender;
      if (work_status !== undefined && work_status !== '') params.work_status = work_status;

      const response = await employeeAPI.getEmployees(params);

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
      console.error('Error fetching employees:', error);
      throw {
        message: error.message || 'Failed to fetch employees',
        status: error.status,
        errors: error.errors || {},
      };
    }
  },

  // Get single employee by ID
  async getEmployeeById(id) {
    try {
      const response = await employeeAPI.getEmployeeById(id);
      // The response structure is { data: { employee } }
      return response.data?.employee || response.data;
    } catch (error) {
      console.error('Error fetching employee:', error);
      throw {
        message: error.message || 'Failed to fetch employee',
        status: error.status,
        errors: error.errors || {},
      };
    }
  },

  // Create new employee
  async createEmployee(employeeData) {
    try {
      const response = await employeeAPI.createEmployee(employeeData);
      return response.data;
    } catch (error) {
      console.error('Error creating employee:', error);
      throw {
        message: error.message || 'Failed to create employee',
        status: error.status,
        errors: error.errors || {},
      };
    }
  },

  // Update employee
  async updateEmployee(id, employeeData) {
    try {
      const response = await employeeAPI.updateEmployee(id, employeeData);
      return response.data;
    } catch (error) {
      console.error('Error updating employee:', error);
      throw {
        message: error.message || 'Failed to update employee',
        status: error.status,
        errors: error.errors || {},
      };
    }
  },

  // Delete employee
  async deleteEmployee(id) {
    try {
      const response = await employeeAPI.deleteEmployee(id);
      return response.data;
    } catch (error) {
      console.error('Error deleting employee:', error);
      throw {
        message: error.message || 'Failed to delete employee',
        status: error.status,
        errors: error.errors || {},
      };
    }
  },
};
