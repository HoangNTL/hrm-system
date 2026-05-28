import ApiError from '../../utils/ApiError.js';
import { ERROR_CODES } from '../../utils/errorCodes.js';
import { parsePagination } from '../../utils/sanitizeQuery.js';

function setValidated(req, key, value) {
  req.validated = req.validated || {};
  req.validated[key] = value;
}

function parseOptionalInt(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const parsed = parseInt(value);
  return Number.isNaN(parsed) ? null : parsed;
}

export const payrollValidator = {
  validateMonthlyQuery(req, res, next) {
    try {
      const year = parseInt(req.query.year) || new Date().getFullYear();
      const month = parseInt(req.query.month) || new Date().getMonth() + 1;
      const { page, limit, search } = parsePagination(req.query);
      setValidated(req, 'monthlyQuery', {
        year,
        month,
        page,
        limit,
        search,
        departmentId: parseOptionalInt(req.query.departmentId),
      });
      next();
    } catch (error) {
      next(error);
    }
  },

  validateExportQuery(req, res, next) {
    try {
      const year = parseInt(req.query.year) || new Date().getFullYear();
      const month = parseInt(req.query.month) || new Date().getMonth() + 1;
      setValidated(req, 'exportQuery', {
        year,
        month,
        search: (req.query.search || '').trim(),
        departmentId: parseOptionalInt(req.query.departmentId),
      });
      next();
    } catch (error) {
      next(error);
    }
  },

  validatePayslipQuery(req, res, next) {
    try {
      setValidated(req, 'payslipQuery', {
        year: parseInt(req.query.year) || new Date().getFullYear(),
        month: parseInt(req.query.month) || new Date().getMonth() + 1,
        employeeId: parseOptionalInt(req.query.employeeId),
      });
      next();
    } catch (error) {
      next(error);
    }
  },
};
