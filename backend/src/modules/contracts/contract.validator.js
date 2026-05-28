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

function normalizeOptionalId(value, fieldName) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  return parsePositiveInt(value, fieldName);
}

function optionalString(value, fieldName) {
  if (value === undefined || value === null) return value;
  if (typeof value !== 'string') {
    throw new ApiError(ERROR_CODES.BAD_REQUEST, `${fieldName} must be a string`);
  }
  return value;
}

export const contractValidator = {
  validateListQuery(req, res, next) {
    try {
      const { search, page, limit } = parsePagination(req.query);
      setValidated(req, 'listQuery', {
        search,
        page,
        limit,
        status: req.query.status || '',
        type: req.query.type || '',
        employeeId: normalizeOptionalId(req.query.employeeId, 'employeeId') ?? null,
      });
      next();
    } catch (error) {
      next(error);
    }
  },

  validateIdParam(req, res, next) {
    try {
      setValidated(req, 'contractId', parsePositiveInt(req.params.id, 'contract ID'));
      next();
    } catch (error) {
      next(error);
    }
  },

  validateCreate(req, res, next) {
    try {
      const payload = {
        code: optionalString(req.body?.code, 'code'),
        employee_id: normalizeOptionalId(req.body?.employee_id, 'employee_id'),
        contract_type: req.body?.contract_type,
        status: req.body?.status,
        start_date: optionalString(req.body?.start_date, 'start_date'),
        end_date: optionalString(req.body?.end_date, 'end_date'),
        salary: req.body?.salary,
        work_location: optionalString(req.body?.work_location, 'work_location'),
        notes: optionalString(req.body?.notes, 'notes'),
      };

      if (!payload.code || !payload.code.trim()) {
        throw new ApiError(ERROR_CODES.BAD_REQUEST, 'Contract code is required');
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
        code: optionalString(req.body?.code, 'code'),
        employee_id: normalizeOptionalId(req.body?.employee_id, 'employee_id'),
        contract_type: req.body?.contract_type,
        status: req.body?.status,
        start_date: optionalString(req.body?.start_date, 'start_date'),
        end_date: optionalString(req.body?.end_date, 'end_date'),
        salary: req.body?.salary,
        work_location: optionalString(req.body?.work_location, 'work_location'),
        notes: optionalString(req.body?.notes, 'notes'),
      });
      next();
    } catch (error) {
      next(error);
    }
  },
};
