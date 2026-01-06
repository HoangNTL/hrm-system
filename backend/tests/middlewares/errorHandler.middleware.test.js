import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock logger
vi.mock('../../src/utils/logger.js', () => ({
  default: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

// Mock response utility
vi.mock('../../src/utils/response.js', () => ({
  default: {
    fail: vi.fn((res, status, message, errors) => {
      res.status(status).json({
        ok: false,
        status,
        message,
        errors,
        data: null,
      });
      return res;
    }),
  },
}));

import { errorHandler } from '../../src/middlewares/errorHandler.js';
import logger from '../../src/utils/logger.js';
import response from '../../src/utils/response.js';
import ApiError from '../../src/utils/ApiError.js';
import { ERROR_CODES } from '../../src/utils/errorCodes.js';
import { ErrorMessages } from '../../src/utils/errorMessages.js';

// Mock request, response, next
const mockRequest = () => ({
  method: 'GET',
  path: '/test',
});

const mockResponse = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.headersSent = false;
  return res;
};

const mockNext = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
});

describe('errorHandler middleware', () => {
  describe('logging', () => {
    it('should log the error', () => {
      const req = mockRequest();
      const res = mockResponse();
      const error = new Error('Test error');

      errorHandler(error, req, res, mockNext);

      expect(logger.error).toHaveBeenCalledWith(error);
    });

    it('should log ApiError instances', () => {
      const req = mockRequest();
      const res = mockResponse();
      const error = new ApiError(ERROR_CODES.BAD_REQUEST, 'Bad request error');

      errorHandler(error, req, res, mockNext);

      expect(logger.error).toHaveBeenCalledWith(error);
    });
  });

  describe('when headers have already been sent', () => {
    it('should call next(err) and not send response', () => {
      const req = mockRequest();
      const res = mockResponse();
      res.headersSent = true;
      const error = new Error('Test error');

      errorHandler(error, req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(response.fail).not.toHaveBeenCalled();
    });
  });

  describe('when handling errors', () => {
    it('should return 500 status for generic errors (non-operational)', () => {
      const req = mockRequest();
      const res = mockResponse();
      const error = new Error('Generic error');
      // Generic Error không có isOperational, nên sẽ trả về message mặc định trong production

      errorHandler(error, req, res, mockNext);

      // Trong production/test mode, generic errors trả về message an toàn
      expect(response.fail).toHaveBeenCalledWith(res, 500, ErrorMessages.INTERNAL_SERVER_ERROR, null);
    });

    it('should return custom status for ApiError', () => {
      const req = mockRequest();
      const res = mockResponse();
      const error = new ApiError(ERROR_CODES.BAD_REQUEST, 'Bad request');

      errorHandler(error, req, res, mockNext);

      expect(response.fail).toHaveBeenCalledWith(res, 400, 'Bad request', null);
    });

    it('should return 401 for unauthorized errors', () => {
      const req = mockRequest();
      const res = mockResponse();
      const error = new ApiError(ERROR_CODES.UNAUTHORIZED, 'Unauthorized');

      errorHandler(error, req, res, mockNext);

      expect(response.fail).toHaveBeenCalledWith(res, 401, 'Unauthorized', null);
    });

    it('should return 403 for forbidden errors', () => {
      const req = mockRequest();
      const res = mockResponse();
      const error = new ApiError(ERROR_CODES.FORBIDDEN, 'Forbidden');

      errorHandler(error, req, res, mockNext);

      expect(response.fail).toHaveBeenCalledWith(res, 403, 'Forbidden', null);
    });

    it('should return 404 for not found errors', () => {
      const req = mockRequest();
      const res = mockResponse();
      const error = new ApiError(ERROR_CODES.NOT_FOUND, 'Resource not found');

      errorHandler(error, req, res, mockNext);

      expect(response.fail).toHaveBeenCalledWith(res, 404, 'Resource not found', null);
    });

    it('should return 409 for conflict errors', () => {
      const req = mockRequest();
      const res = mockResponse();
      const error = new ApiError(ERROR_CODES.CONFLICT, 'Resource already exists');

      errorHandler(error, req, res, mockNext);

      expect(response.fail).toHaveBeenCalledWith(res, 409, 'Resource already exists', null);
    });
  });

  describe('when handling errors with additional details', () => {
    it('should pass errors array to response', () => {
      const req = mockRequest();
      const res = mockResponse();
      const validationErrors = [
        { field: 'email', message: 'Invalid email format' },
        { field: 'password', message: 'Password too short' },
      ];
      const error = new ApiError(ERROR_CODES.BAD_REQUEST, 'Validation failed', validationErrors);

      errorHandler(error, req, res, mockNext);

      expect(response.fail).toHaveBeenCalledWith(
        res,
        400,
        'Validation failed',
        validationErrors
      );
    });
  });

  describe('edge cases', () => {
    it('should use default message when error has no message', () => {
      const req = mockRequest();
      const res = mockResponse();
      const error = new Error();
      error.message = '';

      errorHandler(error, req, res, mockNext);

      // Non-operational error với empty message -> trả về message mặc định
      expect(response.fail).toHaveBeenCalledWith(res, 500, ErrorMessages.INTERNAL_SERVER_ERROR, null);
    });

    it('should use default status 500 when error has no status', () => {
      const req = mockRequest();
      const res = mockResponse();
      const error = { message: 'Custom error object' };

      errorHandler(error, req, res, mockNext);

      // Non-operational error -> trả về message mặc định
      expect(response.fail).toHaveBeenCalledWith(res, 500, ErrorMessages.INTERNAL_SERVER_ERROR, null);
    });

    it('should handle null error message', () => {
      const req = mockRequest();
      const res = mockResponse();
      const error = { status: 400, message: null };

      errorHandler(error, req, res, mockNext);

      // Status 400 -> message mặc định cho BAD_REQUEST
      expect(response.fail).toHaveBeenCalledWith(res, 400, ErrorMessages.BAD_REQUEST, null);
    });

    it('should handle undefined error properties gracefully', () => {
      const req = mockRequest();
      const res = mockResponse();
      const error = {};

      errorHandler(error, req, res, mockNext);

      expect(response.fail).toHaveBeenCalledWith(res, 500, ErrorMessages.INTERNAL_SERVER_ERROR, null);
    });
  });

  describe('different error types', () => {
    it('should handle TypeError', () => {
      const req = mockRequest();
      const res = mockResponse();
      const error = new TypeError('Cannot read property of undefined');

      errorHandler(error, req, res, mockNext);

      // TypeError không phải operational error -> trả về message an toàn
      expect(response.fail).toHaveBeenCalledWith(
        res,
        500,
        ErrorMessages.INTERNAL_SERVER_ERROR,
        null
      );
    });

    it('should handle SyntaxError', () => {
      const req = mockRequest();
      const res = mockResponse();
      const error = new SyntaxError('Unexpected token');

      errorHandler(error, req, res, mockNext);

      // SyntaxError không phải operational error -> trả về message an toàn
      expect(response.fail).toHaveBeenCalledWith(res, 500, ErrorMessages.INTERNAL_SERVER_ERROR, null);
    });

    it('should handle RangeError', () => {
      const req = mockRequest();
      const res = mockResponse();
      const error = new RangeError('Invalid array length');

      errorHandler(error, req, res, mockNext);

      // RangeError không phải operational error -> trả về message an toàn
      expect(response.fail).toHaveBeenCalledWith(res, 500, ErrorMessages.INTERNAL_SERVER_ERROR, null);
    });
  });
});
