import apiClient from '@/shared/api/axiosClient';
import { normalizePaginatedResponse } from '@/shared/api/pagination';

export const userAPI = {
  async getUsers(params = {}) {
    const response = await apiClient.get('/users', { params });
    return response.data;
  },

  async listUsers({ page = 1, limit = 10, search = '', role = '', status = '' } = {}) {
    const params = { page, limit };
    if (search) params.search = search;
    if (role !== undefined && role !== '') params.role = role;
    if (status !== undefined && status !== '') params.status = status;

    const response = await this.getUsers(params);
    return normalizePaginatedResponse(response, page, limit);
  },

  async createUser(payload) {
    const response = await apiClient.post('/users', payload);
    return response.data;
  },

  async resetPassword(id) {
    const response = await apiClient.post(`/users/${id}/reset-password`);
    return response.data;
  },

  async resetUserPassword(id) {
    const response = await this.resetPassword(id);
    return response.data || {};
  },

  async toggleLock(id) {
    const response = await apiClient.patch(`/users/${id}/toggle-lock`);
    return response.data;
  },

  async toggleUserLock(id) {
    const response = await this.toggleLock(id);
    return response.data || {};
  },

  async getMe() {
    const response = await apiClient.get('/users/me');
    return response.data;
  },

  async getCurrentUserProfile() {
    const response = await this.getMe();
    return response.data || response;
  },

  async updateMe(payload) {
    const response = await apiClient.put('/users/me', payload);
    return response.data;
  },

  async updateCurrentUserProfile(payload) {
    const response = await this.updateMe(payload);
    return response.data || response;
  },
};
