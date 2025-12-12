import response from '../utils/response.js';
import { parsePagination } from '../utils/sanitizeQuery.js';
import { userService } from '../services/user.service.js';

/**
 * @route GET /api/users
 * @desc  Get all users (with search + pagination)
 * @access Public
 */
export const getUsers = async (req, res, next) => {
  try {
    const { search, page, limit } = parsePagination(req.query);
    const result = await userService.getAll({ search, page, limit });
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
// export const createUser = async (req, res, next) => {
//   try {
//     const { email, role, employee_id, password } = req.body;
//     const result = await userService.create({ email, role, employee_id, password });
//     return response.success(res, result, 'Created', 201);
//   } catch (error) {
//     next(error);
//   }
// };

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
