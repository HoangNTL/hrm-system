import response from '../../shared/utils/response.js';
import { departmentService } from './department.service.js';

export const departmentController = {
  async getDepartments(req, res, next) {
    try {
      const result = await departmentService.getAll(req.validated.listQuery);
      return response.success(res, { items: result.data, pagination: result.pagination }, 'Success', 200);
    } catch (error) {
      return next(error);
    }
  },

  async getDepartmentById(req, res, next) {
    try {
      const department = await departmentService.getById(req.validated.departmentId);
      return response.success(res, { department }, 'Success', 200);
    } catch (error) {
      return next(error);
    }
  },

  async createDepartment(req, res, next) {
    try {
      const department = await departmentService.create(req.validated.createBody);
      return response.success(res, { department }, 'Created', 201);
    } catch (error) {
      return next(error);
    }
  },

  async updateDepartment(req, res, next) {
    try {
      const department = await departmentService.update(
        req.validated.departmentId,
        req.validated.updateBody,
      );
      return response.success(res, { department }, 'Updated', 200);
    } catch (error) {
      return next(error);
    }
  },

  async deleteDepartment(req, res, next) {
    try {
      const department = await departmentService.delete(req.validated.departmentId);
      return response.success(res, { department }, 'Deleted', 200);
    } catch (error) {
      return next(error);
    }
  },
};

export const {
  createDepartment,
  deleteDepartment,
  getDepartmentById,
  getDepartments,
  updateDepartment,
} = departmentController;
