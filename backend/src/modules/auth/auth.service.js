import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import ApiError from '../../utils/ApiError.js';
import { ERROR_CODES } from '../../utils/errorCodes.js';
import {
  getRefreshTokenExpiryDate,
  hashRefreshToken,
  refreshTokenMatchesHash,
  tokenService,
} from '../../shared/utils/token.js';
import { authRepository } from './auth.repository.js';

export const authService = {
  async login({ email, password }) {
    if (!email || !password) {
      throw new ApiError(ERROR_CODES.BAD_REQUEST, 'Email and password are required');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await authRepository.findUserForLoginByEmail(normalizedEmail);

    if (!user || user.is_deleted) {
      throw new ApiError(ERROR_CODES.UNAUTHORIZED, 'Invalid email or password');
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      throw new ApiError(ERROR_CODES.UNAUTHORIZED, 'Invalid email or password');
    }

    if (user.is_locked) {
      throw new ApiError(ERROR_CODES.FORBIDDEN, 'Account is locked. Please contact administrator.');
    }

    await authRepository.updateLastLogin(user.id);

    const accessToken = tokenService.generateAccessToken(user);
    const refreshToken = tokenService.generateRefreshToken(user);

    await this._saveRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        employee_id: user.employee_id,
        employee: user.employee,
      },
    };
  },

  async logout(userId) {
    if (!userId) {
      throw new ApiError(ERROR_CODES.BAD_REQUEST, 'User ID is required');
    }

    await this._clearRefreshToken(userId);
    return null;
  },

  async refreshToken(token) {
    if (!token) {
      throw new ApiError(ERROR_CODES.UNAUTHORIZED, 'No refresh token provided');
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch {
      throw new ApiError(ERROR_CODES.FORBIDDEN, 'Invalid or expired refresh token');
    }

    if (!payload?.id) {
      throw new ApiError(ERROR_CODES.FORBIDDEN, 'Invalid or expired refresh token');
    }

    const user = await authRepository.findUserForRefreshById(payload.id);
    if (!user) {
      throw new ApiError(ERROR_CODES.NOT_FOUND, 'User not found');
    }

    if (user.is_locked || user.is_deleted) {
      await this._clearRefreshToken(user.id);
      throw new ApiError(ERROR_CODES.FORBIDDEN, 'Refresh token has been revoked');
    }

    if (!user.refresh_token_hash || !user.refresh_token_expires_at) {
      throw new ApiError(ERROR_CODES.FORBIDDEN, 'Refresh token has been revoked');
    }

    if (new Date(user.refresh_token_expires_at).getTime() <= Date.now()) {
      await this._clearRefreshToken(user.id);
      throw new ApiError(ERROR_CODES.FORBIDDEN, 'Invalid or expired refresh token');
    }

    if (!refreshTokenMatchesHash(user.refresh_token_hash, token)) {
      await this._clearRefreshToken(user.id);
      throw new ApiError(ERROR_CODES.FORBIDDEN, 'Refresh token has been revoked');
    }

    const accessToken = tokenService.generateAccessToken(user);
    const refreshToken = tokenService.generateRefreshToken(user);

    await this._saveRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
    };
  },

  async changePassword({ userId, newPassword, currentPassword = null }) {
    if (!userId) {
      throw new ApiError(ERROR_CODES.BAD_REQUEST, 'User ID is required');
    }
    if (!newPassword) {
      throw new ApiError(ERROR_CODES.BAD_REQUEST, 'New password is required');
    }

    const user = await authRepository.findUserSecurityById(userId);
    if (!user) {
      throw new ApiError(ERROR_CODES.NOT_FOUND, 'User not found');
    }

    if (!user.must_change_password) {
      if (!currentPassword) {
        throw new ApiError(ERROR_CODES.BAD_REQUEST, 'Current password is required');
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isMatch) {
        throw new ApiError(ERROR_CODES.UNAUTHORIZED, 'Current password is incorrect');
      }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await authRepository.updatePassword(userId, hashedPassword, false);

    return { success: true, must_change_password: false };
  },

  async _saveRefreshToken(userId, refreshToken) {
    const refreshTokenHash = hashRefreshToken(refreshToken);
    const refreshTokenExpiresAt = getRefreshTokenExpiryDate();

    await authRepository.saveRefreshToken(userId, refreshTokenHash, refreshTokenExpiresAt);
  },

  async _clearRefreshToken(userId) {
    await authRepository.clearRefreshToken(userId);
  },
};
