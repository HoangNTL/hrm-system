import response from '../../shared/utils/response.js';
import { employeeService } from './employee.service.js';

export const employeeController = {
  async getEmployees(req, res, next) {
    try {
      const result = await employeeService.getAll(req.validated.listQuery);
      return response.success(
        res,
        { items: result.data, pagination: result.pagination },
        'Success',
        200,
      );
    } catch (error) {
      return next(error);
    }
  },

  async getEmployeeById(req, res, next) {
    try {
      const employee = await employeeService.getById(req.validated.employeeId);
      return response.success(res, { employee }, 'Success', 200);
    } catch (error) {
      return next(error);
    }
  },

  async createEmployee(req, res, next) {
    try {
      const result = await employeeService.create(req.validated.createBody);
      return response.success(res, result, 'Created', 201);
    } catch (error) {
      return next(error);
    }
  },

  async updateEmployee(req, res, next) {
    try {
      const employee = await employeeService.update(
        req.validated.employeeId,
        req.validated.updateBody,
      );

      return response.success(res, { employee }, 'Updated', 200);
    } catch (error) {
      return next(error);
    }
  },

  async deleteEmployee(req, res, next) {
    try {
      const result = await employeeService.delete(req.validated.employeeId);
      return response.success(res, { employee: result }, 'Deleted', 200);
    } catch (error) {
      return next(error);
    }
  },

  async getEmployeesForSelect(req, res, next) {
    try {
      const employees = await employeeService.getListForSelect();
      return response.success(res, { items: employees }, 'Success', 200);
    } catch (error) {
      return next(error);
    }
  },

  async getEmployeesForSelectWithoutUser(req, res, next) {
    try {
      const employees = await employeeService.getListForSelectWithoutUser();
      return response.success(res, { items: employees }, 'Success', 200);
    } catch (error) {
      return next(error);
    }
  },

  async getEmployeesForSelectWithUser(req, res, next) {
    try {
      const employees = await employeeService.getListForSelectWithUser();
      return response.success(res, { items: employees }, 'Success', 200);
    } catch (error) {
      return next(error);
    }
  },
};

export const {
  createEmployee,
  deleteEmployee,
  getEmployeeById,
  getEmployees,
  getEmployeesForSelect,
  getEmployeesForSelectWithUser,
  getEmployeesForSelectWithoutUser,
  updateEmployee,
} = employeeController;
