import ApiError from '../../utils/ApiError.js';
import { ERROR_CODES } from '../../utils/errorCodes.js';
import { parsePagination } from '../../utils/sanitizeQuery.js';

const VALID_GENDERS = ['male', 'female'];
const VALID_WORK_STATUSES = ['working', 'resigned', 'probation', 'leave'];

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
  if (value === undefined || value === null) {
    return value;
  }

  if (typeof value !== 'string') {
    throw new ApiError(ERROR_CODES.BAD_REQUEST, `${fieldName} must be a string`);
  }

  return value;
}

function validateEmployeeBody(body, { requireCoreFields }) {
  const payload = {
    full_name: optionalString(body?.full_name, 'full_name'),
    gender: body?.gender,
    dob: optionalString(body?.dob, 'dob'),
    cccd: optionalString(body?.cccd, 'cccd'),
    phone: optionalString(body?.phone, 'phone'),
    email: optionalString(body?.email, 'email'),
    address: optionalString(body?.address, 'address'),
    department_id: normalizeOptionalId(body?.department_id, 'department_id'),
    position_id: normalizeOptionalId(body?.position_id, 'position_id'),
    create_login:
      body?.create_login === undefined ? false : Boolean(body.create_login),
  };

  if (requireCoreFields) {
    if (!payload.full_name || !payload.gender || !payload.dob || !payload.cccd) {
      throw new ApiError(
        ERROR_CODES.BAD_REQUEST,
        'Missing required fields: full_name, gender, dob, cccd',
      );
    }
  }

  if (payload.gender !== undefined && payload.gender !== null && !VALID_GENDERS.includes(payload.gender)) {
    throw new ApiError(ERROR_CODES.BAD_REQUEST, 'Invalid gender');
  }

  if ('dob' in payload && payload.dob !== undefined && payload.dob !== null) {
    const dobDate = new Date(payload.dob);
    if (Number.isNaN(dobDate.getTime())) {
      throw new ApiError(ERROR_CODES.BAD_REQUEST, 'Invalid date format for dob.');
    }
  }

  return payload;
}

export const employeeValidator = {
  validateListQuery(req, res, next) {
    try {
      const { search, page, limit } = parsePagination(req.query);
      const department_id = normalizeOptionalId(req.query.department_id, 'department_id');
      const gender = req.query.gender ? String(req.query.gender).trim() : undefined;
      const work_status = req.query.work_status ? String(req.query.work_status).trim() : undefined;

      if (gender && !VALID_GENDERS.includes(gender)) {
        throw new ApiError(ERROR_CODES.BAD_REQUEST, 'Invalid gender');
      }

      if (work_status && !VALID_WORK_STATUSES.includes(work_status)) {
        throw new ApiError(ERROR_CODES.BAD_REQUEST, 'Invalid work_status');
      }

      setValidated(req, 'listQuery', {
        search,
        page,
        limit,
        department_id,
        gender,
        work_status,
      });
      next();
    } catch (error) {
      next(error);
    }
  },

  validateIdParam(req, res, next) {
    try {
      setValidated(req, 'employeeId', parsePositiveInt(req.params.id, 'employee id'));
      next();
    } catch (error) {
      next(error);
    }
  },

  validateCreate(req, res, next) {
    try {
      setValidated(req, 'createBody', validateEmployeeBody(req.body, { requireCoreFields: true }));
      next();
    } catch (error) {
      next(error);
    }
  },

  validateUpdate(req, res, next) {
    try {
      setValidated(req, 'updateBody', validateEmployeeBody(req.body, { requireCoreFields: false }));
      next();
    } catch (error) {
      next(error);
    }
  },
};
