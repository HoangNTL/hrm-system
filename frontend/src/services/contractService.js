import { contractAPI } from '@api/contractAPI';

export const contractService = {
  async getContracts({ page = 1, limit = 10, search = '', status = '', type = '', employeeId = '' } = {}) {
    try {
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
    } catch (error) {
      console.error('Error fetching contracts:', error);
      throw {
        message: error.message || 'Failed to fetch contracts',
        status: error.status,
        errors: error.errors || {},
      };
    }
  },

  async getContractById(id) {
    try {
      const response = await contractAPI.getContractById(id);
      return response.data?.contract || response.data;
    } catch (error) {
      console.error('Error fetching contract:', error);
      throw {
        message: error.message || 'Failed to fetch contract',
        status: error.status,
        errors: error.errors || {},
      };
    }
  },

  async createContract(contractData) {
    try {
      const response = await contractAPI.createContract(contractData);
      return response.data;
    } catch (error) {
      console.error('Error creating contract:', error);
      throw {
        message: error.message || 'Failed to create contract',
        status: error.status,
        errors: error.errors || {},
      };
    }
  },

  async updateContract(id, contractData) {
    try {
      const response = await contractAPI.updateContract(id, contractData);
      return response.data;
    } catch (error) {
      console.error('Error updating contract:', error);
      throw {
        message: error.message || 'Failed to update contract',
        status: error.status,
        errors: error.errors || {},
      };
    }
  },

  async deleteContract(id) {
    try {
      const response = await contractAPI.deleteContract(id);
      return response.data;
    } catch (error) {
      console.error('Error deleting contract:', error);
      throw {
        message: error.message || 'Failed to delete contract',
        status: error.status,
        errors: error.errors || {},
      };
    }
  },
};
