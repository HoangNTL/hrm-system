import { authService } from '../services/auth.service.js';
import response from '../utils/response.js';
import ApiError from '../utils/ApiError.js';
import { ERROR_CODES } from '../utils/errorCodes.js';

const isProd = process.env.NODE_ENV === 'production';
const cookieOptions = {
  httpOnly: true,
  secure: isProd, // In production, cookies should be secure (HTTPS)
  sameSite: isProd ? 'none' : 'lax', // Allow cross-site cookies in prod; lax in dev
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

/**
 * @route   POST /api/auth/login
 * @desc    User login
 * @access  Public
 * @returns {Object} accessToken, refreshToken, user info
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    // set refresh token in cookie
    res.cookie('refreshToken', result.refreshToken, cookieOptions);

    return response.success(res, result, 'Login successful', 200);
  } catch (error) {
    next(error); // Pass error to the error handling middleware
  }
};

/**
 * @route   POST /api/auth/logout
 * @desc    User logout
 * @access  Public
 * @returns {Object} message
 */
export const logout = async (req, res, next) => {
  try {
    const result = await authService.logout(req.user?.id);

    // clear refresh token cookie
    res.clearCookie('refreshToken', { ...cookieOptions, maxAge: 0 });

    return response.success(res, result, 'Logout successful', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh access token
 * @access  Public
 * @returns {Object} accessToken, refreshToken
 */
export const refreshToken = async (req, res, next) => {
  try {
    // get refresh token from cookie or header/body as fallback
    const token =
      req.cookies?.refreshToken ||
      req.headers['x-refresh-token'] ||
      (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null) ||
      req.body?.refreshToken;

    // Avoid noisy error logs for expected auth failures: respond directly
    if (!token) {
      return response.fail(res, ERROR_CODES.UNAUTHORIZED, 'No refresh token provided');
    }

    const result = await authService.refreshToken(token);

    // set new refresh token in cookie if provided
    if (result.refreshToken) {
      res.cookie('refreshToken', result.refreshToken, cookieOptions);
    }

    return response.success(res, result, 'Token refreshed successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/change-password
 * @desc    Change password for current user
 * @access  Private
 */
export const changePassword = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    const result = await authService.changePassword(userId, newPassword, currentPassword);

    return response.success(res, result, 'Password updated successfully', 200);
  } catch (error) {
    next(error);
  }
};
