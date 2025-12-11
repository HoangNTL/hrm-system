import response from '../utils/response.js';
import { positionService } from '../services/position.service.js';
import { parsePagination } from '../utils/sanitizeQuery.js';

/**
 * @route GET /api/positions
 * @desc  Get all positions (with search + pagination)
 * @access Public
 */
export const getPositions = async (req, res, next) => {
  try {
    const { search, page, limit } = parsePagination(req.query);
    const result = await positionService.getAll({ search, page, limit });
    return response.success(res, { items: result.data, pagination: result.pagination }, 'Success', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * @route GET /api/positions/:id
 * @desc  Get position by ID
 * @access Public
 */
export const getPositionById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return response.fail(res, 400, 'Invalid position id');
    }

    const result = await positionService.getById(id);
    return response.success(res, { position: result }, 'Success', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * @route POST /api/positions
 * @desc  Create a new position
 * @access Public
 */
export const createPosition = async (req, res, next) => {
  try {
    const { name, description, status } = req.body;
    const created = await positionService.create({ name, description, status });
    return response.success(res, { position: created }, 'Created', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @route PUT /api/positions/:id
 * @desc  Update a position
 * @access Public
 */
export const updatePosition = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return response.fail(res, 400, 'Invalid position id');
    }

    const { name, description, status } = req.body;
    const updated = await positionService.update(id, {
      name,
      description,
      status,
    });
    return response.success(res, { position: updated }, 'Updated', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * @route DELETE /api/positions/:id
 * @desc  Delete a position
 * @access Public
 */
export const deletePosition = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return response.fail(res, 400, 'Invalid position id');
    }

    const result = await positionService.delete(id);
    return response.success(res, { position: result }, 'Deleted', 200);
  } catch (error) {
    next(error);
  }
};
