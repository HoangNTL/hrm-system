import ApiError from '../../utils/ApiError.js';
import { ERROR_CODES } from '../../utils/errorCodes.js';
import { parsePagination } from '../../utils/sanitizeQuery.js';

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
  if (value === undefined || value === null) return value;
  if (typeof value !== 'string') {
    throw new ApiError(ERROR_CODES.BAD_REQUEST, `${fieldName} must be a string`);
  }
  return value;
}

export const positionValidator = {
  validateListQuery(req, res, next) {
    try {
      setValidated(req, 'listQuery', parsePagination(req.query));
      next();
    } catch (error) {
      next(error);
    }
  },

  validateIdParam(req, res, next) {
    try {
      setValidated(req, 'positionId', parsePositiveInt(req.params.id, 'position id'));
      next();
    } catch (error) {
      next(error);
    }
  },

  validateCreate(req, res, next) {
    try {
      const payload = {
        name: optionalString(req.body?.name, 'name'),
        description: optionalString(req.body?.description, 'description'),
        status: req.body?.status,
      };

      if (!payload.name || !payload.name.trim()) {
        throw new ApiError(ERROR_CODES.BAD_REQUEST, 'Name is required');
      }

      setValidated(req, 'createBody', payload);
      next();
    } catch (error) {
      next(error);
    }
  },

  validateUpdate(req, res, next) {
    try {
      setValidated(req, 'updateBody', {
        name: optionalString(req.body?.name, 'name'),
        description: optionalString(req.body?.description, 'description'),
        status: req.body?.status,
      });
      next();
    } catch (error) {
      next(error);
    }
  },
};
