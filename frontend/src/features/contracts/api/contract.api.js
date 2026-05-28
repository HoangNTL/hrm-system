import axiosClient from '@/shared/api/axiosClient';
import { normalizePaginatedResponse } from '@/shared/api/pagination';

export const contractAPI = {
  async getContracts(params = {}) {
    const response = await axiosClient.get('/contracts', { params });
    return response.data;
  },

  async listContracts({ page = 1, limit = 10, search = '', status = '', type = '', employeeId = '' } = {}) {
    const params = { page, limit };
    if (search) params.search = search;
    if (status) params.status = status;
    if (type) params.type = type;
    if (employeeId) params.employeeId = employeeId;

    const response = await this.getContracts(params);
    return normalizePaginatedResponse(response, page, limit);
  },

  async createContract(contractData) {
    const response = await axiosClient.post('/contracts', contractData);
    return response.data;
  },

  async createContractRecord(contractData) {
    const response = await this.createContract(contractData);
    return response.data;
  },

  async updateContract(id, contractData) {
    const response = await axiosClient.put(`/contracts/${id}`, contractData);
    return response.data;
  },

  async updateContractRecord(id, contractData) {
    const response = await this.updateContract(id, contractData);
    return response.data;
  },
};

export default contractAPI;
