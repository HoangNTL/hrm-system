import ApiError from '../../utils/ApiError.js';
import { ERROR_CODES } from '../../utils/errorCodes.js';
import response from '../../shared/utils/response.js';
import { userService } from './user.service.js';

export const userController = {
  async getUsers(req, res, next) {
    try {
      const result = await userService.getAll(req.validated.listQuery);
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

  async createUser(req, res, next) {
    try {
      const result = await userService.create(req.validated.createBody);
      return response.success(res, result, 'Created', 201);
    } catch (error) {
      return next(error);
    }
  },

  async resetPassword(req, res, next) {
    try {
      const result = await userService.resetPassword(req.validated.userId);
      return response.success(res, result, 'Password reset successfully', 200);
    } catch (error) {
      return next(error);
    }
  },

  async toggleLock(req, res, next) {
    try {
      const user = await userService.toggleLock(req.validated.userId);
      return response.success(res, { user }, 'User lock status updated', 200);
    } catch (error) {
      return next(error);
    }
  },

  async getUserStats(req, res, next) {
    try {
      const stats = await userService.getStats();
      return response.success(res, stats, 'Success', 200);
    } catch (error) {
      return next(error);
    }
  },

  async bulkDeleteUsers(req, res, next) {
    try {
      const result = await userService.bulkDelete(req.validated.bulkDeleteIds);
      return response.success(res, result, 'Users deleted successfully', 200);
    } catch (error) {
      return next(error);
    }
  },

  async getCurrentUser(req, res, next) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new ApiError(ERROR_CODES.UNAUTHORIZED, 'Unauthorized');
      }

      const profile = await userService.getCurrentProfile(userId);
      return response.success(res, profile, 'Success', 200);
    } catch (error) {
      return next(error);
    }
  },

  async updateCurrentUser(req, res, next) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new ApiError(ERROR_CODES.UNAUTHORIZED, 'Unauthorized');
      }

      const updated = await userService.updateCurrentProfile(
        userId,
        req.validated.currentProfileBody,
      );
      return response.success(res, updated, 'Profile updated', 200);
    } catch (error) {
      return next(error);
    }
  },
};

export const {
  getUsers,
  createUser,
  resetPassword,
  toggleLock,
  getUserStats,
  bulkDeleteUsers,
  getCurrentUser,
  updateCurrentUser,
} = userController;
