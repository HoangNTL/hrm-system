import response from '../../shared/utils/response.js';
import { ERROR_CODES } from '../../utils/errorCodes.js';
import { getRefreshTokenCookieOptions } from '../../shared/utils/token.js';
import { authService } from './auth.service.js';

function clearRefreshTokenCookie(res) {
  res.clearCookie('refreshToken', {
    ...getRefreshTokenCookieOptions(),
    maxAge: 0,
  });
}

function resolveRefreshToken(req) {
  return (
    req.cookies?.refreshToken ||
    req.headers['x-refresh-token'] ||
    (req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : null) ||
    req.body?.refreshToken
  );
}

export const authController = {
  async login(req, res, next) {
    try {
      const result = await authService.login(req.validated.loginBody);

      res.cookie('refreshToken', result.refreshToken, getRefreshTokenCookieOptions());
      return response.success(res, result, 'Login successful', 200);
    } catch (error) {
      return next(error);
    }
  },

  async logout(req, res, next) {
    try {
      const result = await authService.logout(req.user?.id);
      clearRefreshTokenCookie(res);
      return response.success(res, result, 'Logout successful', 200);
    } catch (error) {
      return next(error);
    }
  },

  async refreshToken(req, res, next) {
    try {
      const token = resolveRefreshToken(req);

      if (!token) {
        return response.fail(res, ERROR_CODES.UNAUTHORIZED, 'No refresh token provided');
      }

      const result = await authService.refreshToken(token);
      if (result.refreshToken) {
        res.cookie('refreshToken', result.refreshToken, getRefreshTokenCookieOptions());
      }

      return response.success(res, result, 'Token refreshed successfully', 200);
    } catch (error) {
      if ([ERROR_CODES.UNAUTHORIZED, ERROR_CODES.FORBIDDEN].includes(error?.status)) {
        clearRefreshTokenCookie(res);
      }
      return next(error);
    }
  },

  async changePassword(req, res, next) {
    try {
      const result = await authService.changePassword({
        userId: req.user?.id,
        ...req.validated.changePasswordBody,
      });

      return response.success(res, result, 'Password updated successfully', 200);
    } catch (error) {
      return next(error);
    }
  },
};

export const { changePassword, login, logout, refreshToken } = authController;
