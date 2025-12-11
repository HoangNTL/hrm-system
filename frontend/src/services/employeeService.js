import { employeeAPI } from '@api/employeeAPI';

export const employeeService = {
  // Get all employees with pagination and search
  async getEmployees({ page = 1, limit = 10, search = "" }) {
    try {
      const params = {
        page,
        limit,
        search,
      };

      const response = await employeeAPI.getEmployees(params);

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
      console.error('Error fetching employees:', error);
      throw error;
    }
  },

  // Get single employee by ID
  async getEmployeeById(id) {
    try {
      const response = await employeeAPI.getEmployeeById(id);
      return response.data;
    } catch (error) {
      console.error('Error fetching employee:', error);
      throw error;
    }
  },

  // Create new employee
  async createEmployee(employeeData) {
    try {
      const response = await employeeAPI.createEmployee(employeeData);
      return response;
    } catch (error) {
      console.error('Error creating employee:', error);
      throw error;
    }
  },

  // Update employee
  async updateEmployee(id, employeeData) {
    try {
      const response = await employeeAPI.updateEmployee(id, employeeData);
      return response;
    } catch (error) {
      console.error('Error updating employee:', error);
      throw error;
    }
  },

  // Delete employee
  async deleteEmployee(id) {
    try {
      const response = await employeeAPI.deleteEmployee(id);
      return response;
    } catch (error) {
      console.error('Error deleting employee:', error);
      throw error;
    }
  },
};
