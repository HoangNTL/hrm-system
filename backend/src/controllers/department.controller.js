import response from '../utils/response.js';
import { departmentService } from '../services/department.service.js';
import { parsePagination } from '../utils/sanitizeQuery.js';

/**
 * @route GET /api/departments
 * @desc  Get all departments (with search + pagination)
 * @access Public
 */
export const getDepartments = async (req, res, next) => {
  try {
    const { search, page, limit } = parsePagination(req.query);
    const result = await departmentService.getAll({ search, page, limit });
    return response.success(res, { items: result.data, pagination: result.pagination }, 'Success', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * @route GET /api/departments/:id
 * @desc  Get department by ID
 * @access Public
 */
export const getDepartmentById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return response.fail(res, 400, 'Invalid department id');
    }

    const dept = await departmentService.getById(id);
    return response.success(res, { department: dept }, 'Success', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * @route POST /api/departments
 * @desc  Create a new department
 * @access Public
 */
export const createDepartment = async (req, res, next) => {
  try {
    const { name, code, description, status } = req.body;
    const created = await departmentService.create({ name, code, description, status });
    return response.success(res, { department: created }, 'Created', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @route PUT /api/departments/:id
 * @desc  Update a department
 * @access Public
 */
export const updateDepartment = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return response.fail(res, 400, 'Invalid department id');
    }

    const { name, code, description, status } = req.body;
    const updated = await departmentService.update(id, {
      name,
      code,
      description,
      status,
    });
    return response.success(res, { department: updated }, 'Updated', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * @route DELETE /api/departments/:id
 * @desc  Delete a department
 * @access Public
 */
export const deleteDepartment = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return response.fail(res, 400, 'Invalid department id');
    }

    const result = await departmentService.delete(id);
    return response.success(res, { department: result }, 'Deleted', 200);
  } catch (error) {
    next(error);
  }
};
