import { employeeAPI } from '@api/employeeAPI';

export const employeeService = {
  // Get all employees with pagination, search, and filters
  async getEmployees({ page = 1, limit = 10, search = '', department_id, gender, work_status } = {}) {
    const params = { page, limit };
    if (search) params.search = search;
    if (department_id !== undefined && department_id !== '') params.department_id = department_id;
    if (gender !== undefined && gender !== '') params.gender = gender;
    if (work_status !== undefined && work_status !== '') params.work_status = work_status;

    const response = await employeeAPI.getEmployees(params);
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

  // Create new employee
  async createEmployee(employeeData) {
    const response = await employeeAPI.createEmployee(employeeData);
    return response.data;
  },

  // Update employee
  async updateEmployee(id, employeeData) {
    const response = await employeeAPI.updateEmployee(id, employeeData);
    return response.data;
  },

  // Delete employee
  async deleteEmployee(id) {
    const response = await employeeAPI.deleteEmployee(id);
    return response.data;
  },
};
