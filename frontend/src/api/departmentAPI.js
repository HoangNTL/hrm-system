import apiClient from './axios';

export const departmentAPI = {

  async getDepartments(params = {}) {
    const response = await apiClient.get('/departments', { params });
    return response.data;
  },

  async createDepartment(departmentData) {
    const response = await apiClient.post('/departments', departmentData);
    return response.data;
  },

  async updateDepartment(id, departmentData) {
    const response = await apiClient.put(`/departments/${id}`, departmentData);
    return response.data;
  },

  async deleteDepartment(id) {
    const response = await apiClient.delete(`/departments/${id}`);
    return response.data;
  }
};
