import response from '../utils/response.js';
import { shiftService } from '../services/shift.service.js';
import { parsePagination } from '../utils/sanitizeQuery.js';

export const getShifts = async (req, res, next) => {
  try {
    const { search, page, limit } = parsePagination(req.query);
    const result = await shiftService.getAll({ search, page, limit });
    return response.success(
      res,
      { items: result.data, pagination: result.pagination },
      'Success',
      200,
    );
  } catch (error) {
    next(error);
  }
};

export const getShiftById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return response.fail(res, 400, 'Invalid shift id');
    }
    const result = await shiftService.getById(id);
    return response.success(res, { shift: result }, 'Success', 200);
  } catch (error) {
    next(error);
  }
};

export const createShift = async (req, res, next) => {
  try {
    const {
      shift_name,
      start_time,
      end_time,
      early_check_in_minutes,
      late_checkout_minutes,
    } = req.body;

    const created = await shiftService.create({
      shift_name,
      start_time,
      end_time,
      early_check_in_minutes,
      late_checkout_minutes,
    });

    return response.success(res, { shift: created }, 'Created', 201);
  } catch (error) {
    next(error);
  }
};

export const updateShift = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return response.fail(res, 400, 'Invalid shift id');
    }

    const {
      shift_name,
      start_time,
      end_time,
      early_check_in_minutes,
      late_checkout_minutes,
    } = req.body;

    const updated = await shiftService.update(id, {
      shift_name,
      start_time,
      end_time,
      early_check_in_minutes,
      late_checkout_minutes,
    });

    return response.success(res, { shift: updated }, 'Updated', 200);
  } catch (error) {
    next(error);
  }
};

export const deleteShift = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return response.fail(res, 400, 'Invalid shift id');
    }

    const result = await shiftService.delete(id);
    return response.success(res, { shift: result }, 'Deleted', 200);
  } catch (error) {
    next(error);
  }
};
