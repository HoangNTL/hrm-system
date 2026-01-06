import { contractAPI } from '@api/contractAPI';

export const contractService = {
  async getContracts({ page = 1, limit = 10, search = '', status = '', type = '', employeeId = '' } = {}) {
    const params = { page, limit };
    if (search) params.search = search;
    if (status) params.status = status;
    if (type) params.type = type;
    if (employeeId) params.employeeId = employeeId;

    const response = await contractAPI.getContracts(params);
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

  async createContract(contractData) {
    const response = await contractAPI.createContract(contractData);
    return response.data;
  },

  async updateContract(id, contractData) {
    const response = await contractAPI.updateContract(id, contractData);
    return response.data;
  },
};
