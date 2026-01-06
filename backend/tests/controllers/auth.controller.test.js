import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock auth service
vi.mock('../../src/services/auth.service.js', () => ({
  authService: {
    login: vi.fn(),
    logout: vi.fn(),
    refreshToken: vi.fn(),
    changePassword: vi.fn(),
  },
}));

// Mock response utility
vi.mock('../../src/utils/response.js', () => ({
  default: {
    success: vi.fn((res, data, message, status) => {
      res.status(status).json({ ok: true, status, message, data });
      return res;
    }),
    fail: vi.fn((res, status, message, errors) => {
      res.status(status).json({ ok: false, status, message, errors, data: null });
      return res;
    }),
  },
}));

import { authService } from '../../src/services/auth.service.js';
import response from '../../src/utils/response.js';
import { login, logout, refreshToken, changePassword } from '../../src/controllers/auth.controller.js';
import ApiError from '../../src/utils/ApiError.js';
import { ERROR_CODES } from '../../src/utils/errorCodes.js';

// Mock request, response, next
const mockRequest = (body = {}, user = null, cookies = {}, headers = {}) => ({
  body,
  user,
  cookies,
  headers,
});

const mockResponse = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.cookie = vi.fn().mockReturnValue(res);
  res.clearCookie = vi.fn().mockReturnValue(res);
  return res;
};

const mockNext = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  process.env.NODE_ENV = 'development';
});

describe('Auth Controller', () => {
  describe('login', () => {
    it('should login successfully and set refresh token cookie', async () => {
      const req = mockRequest({ email: 'test@example.com', password: 'password123' });
      const res = mockResponse();

      const loginResult = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: { id: 1, email: 'test@example.com', role: 'STAFF' },
      };

      authService.login.mockResolvedValue(loginResult);

      await login(req, res, mockNext);

      expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(res.cookie).toHaveBeenCalledWith('refreshToken', 'refresh-token', expect.any(Object));
      expect(response.success).toHaveBeenCalledWith(res, loginResult, 'Login successful', 200);
    });

    it('should call next with error when login fails', async () => {
      const req = mockRequest({ email: 'test@example.com', password: 'wrongpassword' });
      const res = mockResponse();

      const error = new ApiError(ERROR_CODES.UNAUTHORIZED, 'Invalid credentials');
      authService.login.mockRejectedValue(error);

      await login(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should call next with error when email is missing', async () => {
      const req = mockRequest({ password: 'password123' });
      const res = mockResponse();

      const error = new ApiError(ERROR_CODES.BAD_REQUEST, 'Email is required');
      authService.login.mockRejectedValue(error);

      await login(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('logout', () => {
    it('should logout successfully and clear refresh token cookie', async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      const logoutResult = { message: 'Logged out successfully' };
      authService.logout.mockResolvedValue(logoutResult);

      await logout(req, res, mockNext);

      expect(authService.logout).toHaveBeenCalledWith(1);
      expect(res.clearCookie).toHaveBeenCalledWith('refreshToken', expect.any(Object));
      expect(response.success).toHaveBeenCalledWith(res, logoutResult, 'Logout successful', 200);
    });

    it('should handle logout when user is not authenticated', async () => {
      const req = mockRequest({}, null);
      const res = mockResponse();

      const logoutResult = { message: 'Logged out' };
      authService.logout.mockResolvedValue(logoutResult);

      await logout(req, res, mockNext);

      expect(authService.logout).toHaveBeenCalledWith(undefined);
      expect(res.clearCookie).toHaveBeenCalled();
    });

    it('should call next with error when logout fails', async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      const error = new Error('Logout failed');
      authService.logout.mockRejectedValue(error);

      await logout(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('refreshToken', () => {
    it('should refresh token from cookie successfully', async () => {
      const req = mockRequest({}, null, { refreshToken: 'old-refresh-token' });
      const res = mockResponse();

      const refreshResult = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      authService.refreshToken.mockResolvedValue(refreshResult);

      await refreshToken(req, res, mockNext);

      expect(authService.refreshToken).toHaveBeenCalledWith('old-refresh-token');
      expect(res.cookie).toHaveBeenCalledWith('refreshToken', 'new-refresh-token', expect.any(Object));
      expect(response.success).toHaveBeenCalledWith(res, refreshResult, 'Token refreshed successfully', 200);
    });

    it('should refresh token from x-refresh-token header', async () => {
      const req = mockRequest({}, null, {}, { 'x-refresh-token': 'header-refresh-token' });
      const res = mockResponse();

      const refreshResult = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      authService.refreshToken.mockResolvedValue(refreshResult);

      await refreshToken(req, res, mockNext);

      expect(authService.refreshToken).toHaveBeenCalledWith('header-refresh-token');
    });

    it('should refresh token from authorization header', async () => {
      const req = mockRequest({}, null, {}, { authorization: 'Bearer bearer-refresh-token' });
      const res = mockResponse();

      const refreshResult = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      authService.refreshToken.mockResolvedValue(refreshResult);

      await refreshToken(req, res, mockNext);

      expect(authService.refreshToken).toHaveBeenCalledWith('bearer-refresh-token');
    });

    it('should refresh token from request body', async () => {
      const req = mockRequest({ refreshToken: 'body-refresh-token' }, null, {}, {});
      const res = mockResponse();

      const refreshResult = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      authService.refreshToken.mockResolvedValue(refreshResult);

      await refreshToken(req, res, mockNext);

      expect(authService.refreshToken).toHaveBeenCalledWith('body-refresh-token');
    });

    it('should return fail response when no refresh token provided', async () => {
      const req = mockRequest({}, null, {}, {});
      const res = mockResponse();

      await refreshToken(req, res, mockNext);

      expect(response.fail).toHaveBeenCalledWith(res, ERROR_CODES.UNAUTHORIZED, 'No refresh token provided');
      expect(authService.refreshToken).not.toHaveBeenCalled();
    });

    it('should not set cookie when refreshToken is not in result', async () => {
      const req = mockRequest({}, null, { refreshToken: 'old-token' });
      const res = mockResponse();

      const refreshResult = {
        accessToken: 'new-access-token',
        // no refreshToken
      };

      authService.refreshToken.mockResolvedValue(refreshResult);

      await refreshToken(req, res, mockNext);

      expect(res.cookie).not.toHaveBeenCalled();
    });

    it('should call next with error when refresh token is invalid', async () => {
      const req = mockRequest({}, null, { refreshToken: 'invalid-token' });
      const res = mockResponse();

      const error = new ApiError(ERROR_CODES.FORBIDDEN, 'Invalid refresh token');
      authService.refreshToken.mockRejectedValue(error);

      await refreshToken(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const req = mockRequest(
        { currentPassword: 'oldpass', newPassword: 'newpass123' },
        { id: 1 }
      );
      const res = mockResponse();

      const changeResult = { message: 'Password changed successfully' };
      authService.changePassword.mockResolvedValue(changeResult);

      await changePassword(req, res, mockNext);

      expect(authService.changePassword).toHaveBeenCalledWith(1, 'newpass123', 'oldpass');
      expect(response.success).toHaveBeenCalledWith(res, changeResult, 'Password updated successfully', 200);
    });

    it('should handle user not authenticated', async () => {
      const req = mockRequest(
        { currentPassword: 'oldpass', newPassword: 'newpass123' },
        null
      );
      const res = mockResponse();

      const error = new ApiError(ERROR_CODES.UNAUTHORIZED, 'Unauthorized');
      authService.changePassword.mockRejectedValue(error);

      await changePassword(req, res, mockNext);

      expect(authService.changePassword).toHaveBeenCalledWith(undefined, 'newpass123', 'oldpass');
      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should call next with error when current password is wrong', async () => {
      const req = mockRequest(
        { currentPassword: 'wrongpass', newPassword: 'newpass123' },
        { id: 1 }
      );
      const res = mockResponse();

      const error = new ApiError(ERROR_CODES.BAD_REQUEST, 'Current password is incorrect');
      authService.changePassword.mockRejectedValue(error);

      await changePassword(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should call next with error when new password is invalid', async () => {
      const req = mockRequest(
        { currentPassword: 'oldpass', newPassword: '123' },
        { id: 1 }
      );
      const res = mockResponse();

      const error = new ApiError(ERROR_CODES.BAD_REQUEST, 'Password must be at least 6 characters');
      authService.changePassword.mockRejectedValue(error);

      await changePassword(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
