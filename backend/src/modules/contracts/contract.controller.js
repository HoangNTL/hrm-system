import response from '../../shared/utils/response.js';
import { contractService } from './contract.service.js';

export const contractController = {
  async getContracts(req, res, next) {
    try {
      const result = await contractService.getAll(req.validated.listQuery);
      return response.success(res, { items: result.data, pagination: result.pagination }, 'Success', 200);
    } catch (error) {
      return next(error);
    }
  },

  async getContractById(req, res, next) {
    try {
      const contract = await contractService.getById(req.validated.contractId);
      return response.success(res, { contract }, 'Success', 200);
    } catch (error) {
      return next(error);
    }
  },

  async createContract(req, res, next) {
    try {
      const contract = await contractService.create(req.validated.createBody);
      return response.success(res, { contract }, 'Created', 201);
    } catch (error) {
      return next(error);
    }
  },

  async updateContract(req, res, next) {
    try {
      const contract = await contractService.update(req.validated.contractId, req.validated.updateBody);
      return response.success(res, { contract }, 'Updated', 200);
    } catch (error) {
      return next(error);
    }
  },

  async deleteContract(req, res, next) {
    try {
      const contract = await contractService.delete(req.validated.contractId);
      return response.success(res, { contract }, 'Deleted', 200);
    } catch (error) {
      return next(error);
    }
  },
};

export const {
  createContract,
  deleteContract,
  getContractById,
  getContracts,
  updateContract,
} = contractController;
