import axiosClient from '@/shared/api/axiosClient';
import { normalizePaginatedResponse } from '@/shared/api/pagination';

export const employeeAPI = {
  async getEmployees(params = {}) {
    const response = await axiosClient.get('/employees', { params });
    return response.data;
  },

  async listEmployees({ page = 1, limit = 10, search = '', department_id, gender, work_status } = {}) {
    const params = { page, limit };
    if (search) params.search = search;
    if (department_id !== undefined && department_id !== '') params.department_id = department_id;
    if (gender !== undefined && gender !== '') params.gender = gender;
    if (work_status !== undefined && work_status !== '') params.work_status = work_status;

    const response = await this.getEmployees(params);
    return normalizePaginatedResponse(response, page, limit);
  },

  async getEmployeesForSelect() {
    const response = await axiosClient.get('/employees/select/list');
    return response.data;
  },

  async getEmployeesForSelectWithoutUser() {
    const response = await axiosClient.get('/employees/select/without-user');
    return response.data;
  },

  async getEmployeeById(id) {
    const response = await axiosClient.get(`/employees/${id}`);
    return response.data;
  },

  async createEmployee(employeeData) {
    const response = await axiosClient.post('/employees', employeeData);
    return response.data;
  },

  async createEmployeeRecord(employeeData) {
    const response = await this.createEmployee(employeeData);
    return response.data;
  },

  async updateEmployee(id, employeeData) {
    const response = await axiosClient.put(`/employees/${id}`, employeeData);
    return response.data;
  },

  async updateEmployeeRecord(id, employeeData) {
    const response = await this.updateEmployee(id, employeeData);
    return response.data;
  },

  async deleteEmployee(id) {
    const response = await axiosClient.delete(`/employees/${id}`);
    return response.data;
  },

  async deleteEmployeeRecord(id) {
    const response = await this.deleteEmployee(id);
    return response.data;
  },
};

export default employeeAPI;
