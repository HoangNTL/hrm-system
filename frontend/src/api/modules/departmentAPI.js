import apiClient from '../config/axios';

export const departmentAPI = {
  async getDepartments(params = {}) {
    const response = await apiClient.get('/departments', { params });
    return response.data;
  },

  async getDepartmentById(id) {
    const response = await apiClient.get(`/departments/${id}`);
    return response.data;
  },
  async createDepartment(departmentData) {
    const response = await apiClient.post('/departments', departmentData);
    return response.data;
  },
};
