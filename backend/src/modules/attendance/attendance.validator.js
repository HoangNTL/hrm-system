import ApiError from '../../utils/ApiError.js';
import { ERROR_CODES } from '../../utils/errorCodes.js';

function setValidated(req, key, value) {
  req.validated = req.validated || {};
  req.validated[key] = value;
}

function parseOptionalPositiveInt(value, fieldName) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new ApiError(ERROR_CODES.BAD_REQUEST, `Invalid ${fieldName}`);
  }

  return parsed;
}

function parseRequiredPositiveInt(value, fieldName) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new ApiError(ERROR_CODES.BAD_REQUEST, `Invalid ${fieldName}`);
  }
  return parsed;
}

function parseOptionalDate(value, fieldName) {
  if (!value) {
    return undefined;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new ApiError(ERROR_CODES.BAD_REQUEST, `Invalid ${fieldName}`);
  }

  return parsed;
}

export const attendanceValidator = {
  validateCheckAction(req, res, next) {
    try {
      setValidated(req, 'checkActionBody', {
        employeeId: parseOptionalPositiveInt(req.body?.employeeId, 'employeeId'),
        shiftId: parseOptionalPositiveInt(req.body?.shiftId, 'shiftId'),
      });
      next();
    } catch (error) {
      next(error);
    }
  },

  validateTodayQuery(req, res, next) {
    try {
      setValidated(req, 'todayQuery', {
        employeeId: parseOptionalPositiveInt(req.params?.employeeId, 'employeeId'),
        shiftId: parseOptionalPositiveInt(req.query?.shiftId, 'shiftId'),
      });
      next();
    } catch (error) {
      next(error);
    }
  },

  validateMonthlyQuery(req, res, next) {
    try {
      setValidated(req, 'monthlyQuery', {
        year: req.query?.year ? Number(req.query.year) : undefined,
        month: req.query?.month ? Number(req.query.month) : undefined,
      });
      next();
    } catch (error) {
      next(error);
    }
  },

  validateHistoryQuery(req, res, next) {
    try {
      setValidated(req, 'historyQuery', {
        fromDate: parseOptionalDate(req.query?.fromDate, 'fromDate'),
        toDate: parseOptionalDate(req.query?.toDate, 'toDate'),
      });
      next();
    } catch (error) {
      next(error);
    }
  },

  validateListQuery(req, res, next) {
    try {
      const page = req.query?.page ? Number(req.query.page) : 1;
      const limit = req.query?.limit ? Number(req.query.limit) : 10;

      setValidated(req, 'listQuery', {
        employeeId: parseOptionalPositiveInt(req.query?.employeeId, 'employeeId'),
        status: req.query?.status ? String(req.query.status) : undefined,
        fromDate: parseOptionalDate(req.query?.fromDate, 'fromDate'),
        toDate: parseOptionalDate(req.query?.toDate, 'toDate'),
        page: Number.isInteger(page) && page > 0 ? page : 1,
        limit: Number.isInteger(limit) && limit > 0 ? limit : 10,
      });
      next();
    } catch (error) {
      next(error);
    }
  },

  validateIdParam(req, res, next) {
    try {
      setValidated(req, 'attendanceId', parseRequiredPositiveInt(req.params.id, 'attendance id'));
      next();
    } catch (error) {
      next(error);
    }
  },

  validateUpdate(req, res, next) {
    try {
      setValidated(req, 'updateBody', req.body || {});
      next();
    } catch (error) {
      next(error);
    }
  },
};
