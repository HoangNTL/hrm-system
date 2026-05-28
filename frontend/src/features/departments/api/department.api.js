import axiosClient from '@/shared/api/axiosClient';
import { normalizePaginatedResponse } from '@/shared/api/pagination';

export const departmentAPI = {
  async getDepartments(params = {}) {
    const response = await axiosClient.get('/departments', { params });
    return response.data;
  },

  async listDepartments({ page = 1, limit = 10, search = '' } = {}) {
    const response = await this.getDepartments({ page, limit, search });
    return normalizePaginatedResponse(response, page, limit);
  },

  async createDepartment(departmentData) {
    const response = await axiosClient.post('/departments', departmentData);
    return response.data;
  },

  async createDepartmentRecord(departmentData) {
    const response = await this.createDepartment(departmentData);
    return response.data;
  },

  async updateDepartment(id, departmentData) {
    const response = await axiosClient.put(`/departments/${id}`, departmentData);
    return response.data;
  },

  async updateDepartmentRecord(id, departmentData) {
    const response = await this.updateDepartment(id, departmentData);
    return response.data;
  },

  async deleteDepartment(id) {
    const response = await axiosClient.delete(`/departments/${id}`);
    return response.data;
  },

  async deleteDepartmentRecord(id) {
    const response = await this.deleteDepartment(id);
    return response.data;
  },
};

export default departmentAPI;
