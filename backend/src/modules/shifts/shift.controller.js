import response from '../../shared/utils/response.js';
import { shiftService } from './shift.service.js';

export const shiftController = {
  async getShifts(req, res, next) {
    try {
      const result = await shiftService.getAll(req.validated.listQuery);
      return response.success(res, { items: result.data, pagination: result.pagination }, 'Success', 200);
    } catch (error) {
      return next(error);
    }
  },

  async getShiftById(req, res, next) {
    try {
      const shift = await shiftService.getById(req.validated.shiftId);
      return response.success(res, { shift }, 'Success', 200);
    } catch (error) {
      return next(error);
    }
  },

  async createShift(req, res, next) {
    try {
      const shift = await shiftService.create(req.validated.createBody);
      return response.success(res, { shift }, 'Created', 201);
    } catch (error) {
      return next(error);
    }
  },

  async updateShift(req, res, next) {
    try {
      const shift = await shiftService.update(req.validated.shiftId, req.validated.updateBody);
      return response.success(res, { shift }, 'Updated', 200);
    } catch (error) {
      return next(error);
    }
  },

  async deleteShift(req, res, next) {
    try {
      const shift = await shiftService.delete(req.validated.shiftId);
      return response.success(res, { shift }, 'Deleted', 200);
    } catch (error) {
      return next(error);
    }
  },
};

export const {
  createShift,
  deleteShift,
  getShiftById,
  getShifts,
  updateShift,
} = shiftController;
