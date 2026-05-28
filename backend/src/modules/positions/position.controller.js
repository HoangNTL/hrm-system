import response from '../../shared/utils/response.js';
import { positionService } from './position.service.js';

export const positionController = {
  async getPositions(req, res, next) {
    try {
      const result = await positionService.getAll(req.validated.listQuery);
      return response.success(res, { items: result.data, pagination: result.pagination }, 'Success', 200);
    } catch (error) {
      return next(error);
    }
  },

  async getPositionById(req, res, next) {
    try {
      const position = await positionService.getById(req.validated.positionId);
      return response.success(res, { position }, 'Success', 200);
    } catch (error) {
      return next(error);
    }
  },

  async createPosition(req, res, next) {
    try {
      const position = await positionService.create(req.validated.createBody);
      return response.success(res, { position }, 'Created', 201);
    } catch (error) {
      return next(error);
    }
  },

  async updatePosition(req, res, next) {
    try {
      const position = await positionService.update(req.validated.positionId, req.validated.updateBody);
      return response.success(res, { position }, 'Updated', 200);
    } catch (error) {
      return next(error);
    }
  },

  async deletePosition(req, res, next) {
    try {
      const position = await positionService.delete(req.validated.positionId);
      return response.success(res, { position }, 'Deleted', 200);
    } catch (error) {
      return next(error);
    }
  },
};

export const {
  createPosition,
  deletePosition,
  getPositionById,
  getPositions,
  updatePosition,
} = positionController;
