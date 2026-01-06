import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock jsonwebtoken
vi.mock('jsonwebtoken', () => ({
  default: {
    verify: vi.fn(),
  },
}));

import jwt from 'jsonwebtoken';
import { verifyToken, verifyRole } from '../../src/middlewares/auth.js';
import ApiError from '../../src/utils/ApiError.js';
import { ERROR_CODES } from '../../src/utils/errorCodes.js';

// Mock request, response, next
const mockRequest = (headers = {}, user = null) => ({
  headers,
  user,
});

const mockResponse = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

const mockNext = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  process.env.JWT_SECRET = 'test-secret';
});

describe('verifyToken middleware', () => {
  describe('when no token is provided', () => {
    it('should call next with ApiError UNAUTHORIZED when authorization header is missing', () => {
      const req = mockRequest({});
      const res = mockResponse();

      verifyToken(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(ApiError);
      expect(error.status).toBe(ERROR_CODES.FORBIDDEN);
    });

    it('should call next with ApiError when authorization header has no token', () => {
      const req = mockRequest({ authorization: 'Bearer ' });
      const res = mockResponse();

      verifyToken(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(ApiError);
    });

    it('should call next with ApiError when authorization header format is invalid', () => {
      const req = mockRequest({ authorization: 'InvalidFormat' });
      const res = mockResponse();

      verifyToken(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(ApiError);
    });
  });

  describe('when token is invalid or expired', () => {
    it('should call next with ApiError FORBIDDEN when token verification fails', () => {
      const req = mockRequest({ authorization: 'Bearer invalid-token' });
      const res = mockResponse();

      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      verifyToken(req, res, mockNext);

      expect(jwt.verify).toHaveBeenCalledWith('invalid-token', process.env.JWT_SECRET);
      expect(mockNext).toHaveBeenCalledTimes(1);
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(ApiError);
      expect(error.status).toBe(ERROR_CODES.FORBIDDEN);
      expect(error.message).toBe('Invalid or expired token');
    });

    it('should call next with ApiError when token is expired', () => {
      const req = mockRequest({ authorization: 'Bearer expired-token' });
      const res = mockResponse();

      jwt.verify.mockImplementation(() => {
        const error = new Error('jwt expired');
        error.name = 'TokenExpiredError';
        throw error;
      });

      verifyToken(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(ApiError);
      expect(error.status).toBe(ERROR_CODES.FORBIDDEN);
    });
  });

  describe('when token is valid', () => {
    it('should attach decoded payload to req.user and call next()', () => {
      const decodedPayload = { id: 1, role: 'ADMIN' };
      const req = mockRequest({ authorization: 'Bearer valid-token' });
      const res = mockResponse();

      jwt.verify.mockReturnValue(decodedPayload);

      verifyToken(req, res, mockNext);

      expect(jwt.verify).toHaveBeenCalledWith('valid-token', process.env.JWT_SECRET);
      expect(req.user).toEqual(decodedPayload);
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(); // called without arguments
    });

    it('should correctly parse user with different roles', () => {
      const testCases = [
        { id: 1, role: 'ADMIN' },
        { id: 2, role: 'HR' },
        { id: 3, role: 'STAFF' },
      ];

      testCases.forEach((payload) => {
        vi.clearAllMocks();
        const req = mockRequest({ authorization: 'Bearer valid-token' });
        const res = mockResponse();

        jwt.verify.mockReturnValue(payload);

        verifyToken(req, res, mockNext);

        expect(req.user).toEqual(payload);
        expect(mockNext).toHaveBeenCalledWith();
      });
    });
  });
});

describe('verifyRole middleware', () => {
  describe('when user is not authenticated', () => {
    it('should throw ApiError UNAUTHORIZED when req.user is undefined', () => {
      const req = mockRequest({}, undefined);
      const res = mockResponse();
      const middleware = verifyRole(['ADMIN']);

      expect(() => middleware(req, res, mockNext)).toThrow(ApiError);
      expect(() => middleware(req, res, mockNext)).toThrow('Unauthorized');
    });

    it('should throw ApiError UNAUTHORIZED when req.user is null', () => {
      const req = mockRequest({}, null);
      const res = mockResponse();
      const middleware = verifyRole(['ADMIN']);

      expect(() => middleware(req, res, mockNext)).toThrow(ApiError);
    });
  });

  describe('when user has insufficient permissions', () => {
    it('should throw ApiError FORBIDDEN when user role is not in allowed roles', () => {
      const req = mockRequest({});
      req.user = { id: 1, role: 'STAFF' };
      const res = mockResponse();
      const middleware = verifyRole(['ADMIN', 'HR']);

      expect(() => middleware(req, res, mockNext)).toThrow(ApiError);
      expect(() => middleware(req, res, mockNext)).toThrow('Insufficient permissions');
    });

    it('should throw ApiError FORBIDDEN when roles array is empty and user exists', () => {
      const req = mockRequest({});
      req.user = { id: 1, role: 'ADMIN' };
      const res = mockResponse();
      const middleware = verifyRole([]);

      expect(() => middleware(req, res, mockNext)).toThrow('Insufficient permissions');
    });
  });

  describe('when user has correct permissions', () => {
    it('should call next() when user role matches single allowed role', () => {
      const req = mockRequest({});
      req.user = { id: 1, role: 'ADMIN' };
      const res = mockResponse();
      const middleware = verifyRole(['ADMIN']);

      middleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should call next() when user role is one of multiple allowed roles', () => {
      const req = mockRequest({});
      req.user = { id: 1, role: 'HR' };
      const res = mockResponse();
      const middleware = verifyRole(['ADMIN', 'HR', 'STAFF']);

      middleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('should work correctly for each role type', () => {
      const roles = ['ADMIN', 'HR', 'STAFF'];

      roles.forEach((role) => {
        vi.clearAllMocks();
        const req = mockRequest({});
        req.user = { id: 1, role };
        const res = mockResponse();
        const middleware = verifyRole([role]);

        middleware(req, res, mockNext);

        expect(mockNext).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('edge cases', () => {
    it('should be case-sensitive for role comparison', () => {
      const req = mockRequest({});
      req.user = { id: 1, role: 'admin' }; // lowercase
      const res = mockResponse();
      const middleware = verifyRole(['ADMIN']); // uppercase

      expect(() => middleware(req, res, mockNext)).toThrow('Insufficient permissions');
    });

    it('should handle user with undefined role', () => {
      const req = mockRequest({});
      req.user = { id: 1 }; // no role property
      const res = mockResponse();
      const middleware = verifyRole(['ADMIN']);

      expect(() => middleware(req, res, mockNext)).toThrow('Insufficient permissions');
    });
  });
});
