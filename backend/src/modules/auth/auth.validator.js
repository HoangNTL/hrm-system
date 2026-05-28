import ApiError from '../../utils/ApiError.js';
import { ERROR_CODES } from '../../utils/errorCodes.js';

function setValidated(req, key, value) {
  req.validated = req.validated || {};
  req.validated[key] = value;
}

function optionalString(value, fieldName) {
  if (value === undefined || value === null) {
    return value;
  }

  if (typeof value !== 'string') {
    throw new ApiError(ERROR_CODES.BAD_REQUEST, `${fieldName} must be a string`);
  }

  return value;
}

export const authValidator = {
  validateLogin(req, res, next) {
    try {
      const email = optionalString(req.body?.email, 'email');
      const password = optionalString(req.body?.password, 'password');

      if (!email || !email.trim()) {
        throw new ApiError(ERROR_CODES.BAD_REQUEST, 'Email is required');
      }

      if (!password) {
        throw new ApiError(ERROR_CODES.BAD_REQUEST, 'Password is required');
      }

      setValidated(req, 'loginBody', {
        email,
        password,
      });
      next();
    } catch (error) {
      next(error);
    }
  },

  validateChangePassword(req, res, next) {
    try {
      const currentPassword = optionalString(req.body?.currentPassword, 'currentPassword');
      const newPassword = optionalString(req.body?.newPassword, 'newPassword');

      if (!newPassword) {
        throw new ApiError(ERROR_CODES.BAD_REQUEST, 'New password is required');
      }

      setValidated(req, 'changePasswordBody', {
        currentPassword,
        newPassword,
      });
      next();
    } catch (error) {
      next(error);
    }
  },
};
