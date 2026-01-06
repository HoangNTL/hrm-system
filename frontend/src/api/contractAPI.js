import apiClient from './axios';

export const contractAPI = {
  async getContracts(params = {}) {
    const response = await apiClient.get('/contracts', { params });
    return response.data;
  },

  async createContract(contractData) {
    const response = await apiClient.post('/contracts', contractData);
    return response.data;
  },

  async updateContract(id, contractData) {
    const response = await apiClient.put(`/contracts/${id}`, contractData);
    return response.data;
  },
};
