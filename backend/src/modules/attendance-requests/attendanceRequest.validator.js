import ApiError from '../../utils/ApiError.js';
import { ERROR_CODES } from '../../utils/errorCodes.js';

function setValidated(req, key, value) {
  req.validated = req.validated || {};
  req.validated[key] = value;
}

function parseRequiredPositiveInt(value, fieldName) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new ApiError(ERROR_CODES.BAD_REQUEST, `Invalid ${fieldName}`);
  }
  return parsed;
}

export const attendanceRequestValidator = {
  validateIdParam(req, res, next) {
    try {
      setValidated(req, 'requestId', parseRequiredPositiveInt(req.params.id, 'request id'));
      next();
    } catch (error) {
      next(error);
    }
  },

  validateCreate(req, res, next) {
    try {
      setValidated(req, 'createBody', req.body || {});
      next();
    } catch (error) {
      next(error);
    }
  },

  validateListQuery(req, res, next) {
    try {
      setValidated(req, 'listQuery', {
        status: req.query?.status,
        page: req.query?.page,
        limit: req.query?.limit,
        employeeName: req.query?.employeeName,
      });
      next();
    } catch (error) {
      next(error);
    }
  },

  validateReviewBody(req, res, next) {
    try {
      setValidated(req, 'reviewBody', {
        notes: req.body?.notes,
      });
      next();
    } catch (error) {
      next(error);
    }
  },
};
