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

export const shiftValidator = {
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
      setValidated(req, 'shiftId', parsePositiveInt(req.params.id, 'shift id'));
      next();
    } catch (error) {
      next(error);
    }
  },

  validateCreate(req, res, next) {
    try {
      const payload = {
        shift_name: optionalString(req.body?.shift_name, 'shift_name'),
        start_time: req.body?.start_time,
        end_time: req.body?.end_time,
        early_check_in_minutes: req.body?.early_check_in_minutes,
        late_checkout_minutes: req.body?.late_checkout_minutes,
      };

      if (!payload.shift_name || !payload.shift_name.trim()) {
        throw new ApiError(ERROR_CODES.BAD_REQUEST, 'Shift name is required');
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
        shift_name: optionalString(req.body?.shift_name, 'shift_name'),
        start_time: req.body?.start_time,
        end_time: req.body?.end_time,
        early_check_in_minutes: req.body?.early_check_in_minutes,
        late_checkout_minutes: req.body?.late_checkout_minutes,
      });
      next();
    } catch (error) {
      next(error);
    }
  },
};
