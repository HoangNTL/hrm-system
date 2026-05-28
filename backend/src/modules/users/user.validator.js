import ApiError from '../../utils/ApiError.js';
import { ERROR_CODES } from '../../utils/errorCodes.js';
import { parsePagination } from '../../utils/sanitizeQuery.js';
import { isValidUserRole, normalizeUserRole } from '../../shared/constants/roles.js';

const USER_STATUS_FILTERS = ['active', 'locked', 'never_logged_in'];
const USER_GENDERS = ['male', 'female'];

function setValidated(req, key, value) {
  req.validated = req.validated || {};
  req.validated[key] = value;
}

function parsePositiveInt(value, fieldName) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new ApiError(ERROR_CODES.BAD_REQUEST, `Invalid ${fieldName}`);
  }

  return parsed;
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

export const userValidator = {
  validateListQuery(req, res, next) {
    try {
      const { search, page, limit } = parsePagination(req.query);
      const role = req.query.role ? normalizeUserRole(req.query.role, '') : '';
      const status = req.query.status ? String(req.query.status).trim() : '';

      if (role && !isValidUserRole(role)) {
        throw new ApiError(ERROR_CODES.BAD_REQUEST, 'Invalid role');
      }

      if (status && !USER_STATUS_FILTERS.includes(status)) {
        throw new ApiError(ERROR_CODES.BAD_REQUEST, 'Invalid status');
      }

      setValidated(req, 'listQuery', { search, page, limit, role, status });
      next();
    } catch (error) {
      next(error);
    }
  },

  validateCreate(req, res, next) {
    try {
      const email = optionalString(req.body?.email, 'email');
      const password = optionalString(req.body?.password, 'password');
      const role = req.body?.role ? normalizeUserRole(req.body.role, '') : undefined;
      const employeeIdValue = req.body?.employee_id;
      const employee_id =
        employeeIdValue === undefined || employeeIdValue === null || employeeIdValue === ''
          ? undefined
          : parsePositiveInt(employeeIdValue, 'employee_id');

      if (!email || !email.trim()) {
        throw new ApiError(ERROR_CODES.BAD_REQUEST, 'Email is required');
      }

      if (role !== undefined && role !== '' && !isValidUserRole(role)) {
        throw new ApiError(ERROR_CODES.BAD_REQUEST, 'Invalid role');
      }

      setValidated(req, 'createBody', {
        email,
        password,
        role,
        employee_id,
      });
      next();
    } catch (error) {
      next(error);
    }
  },

  validateUserIdParam(req, res, next) {
    try {
      setValidated(req, 'userId', parsePositiveInt(req.params.id, 'user id'));
      next();
    } catch (error) {
      next(error);
    }
  },

  validateBulkDelete(req, res, next) {
    try {
      const ids = req.body?.ids;
      if (!Array.isArray(ids) || ids.length === 0) {
        throw new ApiError(ERROR_CODES.BAD_REQUEST, 'Invalid user IDs');
      }

      setValidated(
        req,
        'bulkDeleteIds',
        ids.map((id) => parsePositiveInt(id, 'user id')),
      );
      next();
    } catch (error) {
      next(error);
    }
  },

  validateCurrentProfileUpdate(req, res, next) {
    try {
      const payload = {};

      if ('full_name' in req.body) {
        payload.full_name = optionalString(req.body.full_name, 'full_name');
      }
      if ('phone' in req.body) {
        payload.phone = optionalString(req.body.phone, 'phone');
      }
      if ('address' in req.body) {
        payload.address = optionalString(req.body.address, 'address');
      }
      if ('gender' in req.body) {
        if (req.body.gender !== null && !USER_GENDERS.includes(req.body.gender)) {
          throw new ApiError(ERROR_CODES.BAD_REQUEST, 'Invalid gender');
        }
        payload.gender = req.body.gender;
      }
      if ('dob' in req.body) {
        if (req.body.dob !== null && Number.isNaN(new Date(req.body.dob).getTime())) {
          throw new ApiError(ERROR_CODES.BAD_REQUEST, 'Invalid date format for dob');
        }
        payload.dob = req.body.dob;
      }

      setValidated(req, 'currentProfileBody', payload);
      next();
    } catch (error) {
      next(error);
    }
  },
};
