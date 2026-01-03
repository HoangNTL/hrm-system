import response from '../utils/response.js';
import { parsePagination } from '../utils/sanitizeQuery.js';
import { userService } from '../services/user.service.js';
import ApiError from '../utils/ApiError.js';
import { ERROR_CODES } from '../utils/errorCodes.js';

/**
 * @route GET /api/users
 * @desc  Get all users (with search + pagination + filters)
 * @access Public
 */
export const getUsers = async (req, res, next) => {
  try {
    const { search, page, limit } = parsePagination(req.query);
    const { role = '', status = '' } = req.query;
    const result = await userService.getAll({ search, role, status, page, limit });
    return response.success(res, { items: result.data, pagination: result.pagination }, 'Success', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * @route GET /api/users/:id
 * @desc  Get user by ID
 * @access Public
 */
// export const getUserById = async (req, res, next) => {
//   try {
//     const id = Number(req.params.id);
//     if (!Number.isInteger(id) || id <= 0) {
//       return response.fail(res, 400, 'Invalid user id');
//     }
//     const user = await userService.getById(id);
//     return response.success(res, { user }, 'Success', 200);
//   } catch (error) {
//     next(error);
//   }
// };

/**
 * @route POST /api/users
 * @desc  Create a new user
 * @access Public
 */
export const createUser = async (req, res, next) => {
  try {
    const { email, role, employee_id, password } = req.body;
    const result = await userService.create({ email, role, employee_id, password });
    return response.success(res, result, 'Created', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @route PUT /api/users/:id
 * @desc  Update a user
 * @access Public
 */
// export const updateUser = async (req, res, next) => {
//   try {
//     const id = Number(req.params.id);
//     if (!Number.isInteger(id) || id <= 0) {
//       return response.fail(res, 400, 'Invalid user id');
//     }

//     const { email, role, employee_id, password } = req.body;
//     const result = await userService.update(id, { email, role, employee_id, password });
//     return response.success(res, result, 'Updated', 200);
//   } catch (error) {
//     next(error);
//   }
// };

/**
 * @route DELETE /api/users/:id
 * @desc  Soft delete a user
 * @access Public
 */
// export const deleteUser = async (req, res, next) => {
//   try {
//     const id = Number(req.params.id);
//     if (!Number.isInteger(id) || id <= 0) {
//       return response.fail(res, 400, 'Invalid user id');
//     }

//     const result = await userService.delete(id);
//     return response.success(res, { user: result }, 'Deleted', 200);
//   } catch (error) {
//     next(error);
//   }
// };

/**
 * @route POST /api/users/:id/reset-password
 * @desc  Reset user password
 * @access Public
 */
export const resetPassword = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return response.fail(res, 400, 'Invalid user id');
    }

    const result = await userService.resetPassword(id);
    return response.success(res, result, 'Password reset successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * @route PATCH /api/users/:id/toggle-lock
 * @desc  Toggle user lock status
 * @access Public
 */
export const toggleLock = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return response.fail(res, 400, 'Invalid user id');
    }

    const user = await userService.toggleLock(id);
    return response.success(res, { user }, 'User lock status updated', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * @route GET /api/users/stats
 * @desc  Get user statistics
 * @access Public
 */
export const getUserStats = async (req, res, next) => {
  try {
    const stats = await userService.getStats();
    return response.success(res, stats, 'Success', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * @route POST /api/users/bulk-delete
 * @desc  Bulk delete users
 * @access Public
 */
export const bulkDeleteUsers = async (req, res, next) => {
  try {
    const { ids } = req.body;
    const result = await userService.bulkDelete(ids);
    return response.success(res, result, 'Users deleted successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * @route GET /api/users/me
 * @desc  Get current user profile (user + employee)
 * @access Private
 */
export const getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(ERROR_CODES.UNAUTHORIZED, 'Unauthorized');
    }
    const profile = await userService.getCurrentProfile(userId);
    return response.success(res, profile, 'Success', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * @route PUT /api/users/me
 * @desc  Update current user profile (limited fields)
 * @access Private
 */
export const updateCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(ERROR_CODES.UNAUTHORIZED, 'Unauthorized');
    }
    const { full_name, phone, address, gender, dob } = req.body;
    const updated = await userService.updateCurrentProfile(userId, { full_name, phone, address, gender, dob });
    return response.success(res, updated, 'Profile updated', 200);
  } catch (error) {
    next(error);
  }
};

