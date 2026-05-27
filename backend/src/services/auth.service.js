import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { prisma } from '../config/db.js';
import { tokenService } from './token.service.js';
import ApiError from '../utils/ApiError.js';
import { ERROR_CODES } from '../utils/errorCodes.js';
import {
  getRefreshTokenExpiryDate,
  hashRefreshToken,
  refreshTokenMatchesHash,
} from '../utils/refreshToken.js';

export const authService = {
  async login(email, password) {
    if (!email || !password) {
      throw new ApiError(
        ERROR_CODES.BAD_REQUEST,
        'Email and password are required',
      );
    }

    // find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: { employee: true },
    });

    if (!user)
      throw new ApiError(ERROR_CODES.UNAUTHORIZED, 'Invalid email or password');

    // compare password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch)
      throw new ApiError(ERROR_CODES.UNAUTHORIZED, 'Invalid email or password');

    // Check if account is locked
    if (user.is_locked) {
      throw new ApiError(ERROR_CODES.FORBIDDEN, 'Account is locked. Please contact administrator.');
    }

    // Update last login time
    await prisma.user.update({
      where: { id: user.id },
      data: { last_login_at: new Date() },
    });

    // generate tokens
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
    if (!userId) throw new ApiError(ERROR_CODES.BAD_REQUEST, 'User ID is required');

    // clear refresh token from database
    await this._clearRefreshToken(userId);

    return null;
  },

  async refreshToken(token) {
    if (!token) throw new ApiError(ERROR_CODES.UNAUTHORIZED, 'No refresh token provided');

    // verify token
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch {
      throw new ApiError(ERROR_CODES.FORBIDDEN, 'Invalid or expired refresh token');
    }

    if (!payload?.id) {
      throw new ApiError(ERROR_CODES.FORBIDDEN, 'Invalid or expired refresh token');
    }

    const user = await this._findUserWithRefreshToken(payload.id);
    if (!user) throw new ApiError(ERROR_CODES.NOT_FOUND, 'User not found');

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

    // generate new tokens
    const accessToken = tokenService.generateAccessToken(user);
    const refreshToken = tokenService.generateRefreshToken(user);

    await this._saveRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
    };
  },

  // _helpers
  async _saveRefreshToken(userId, refreshToken) {
    const refreshTokenHash = hashRefreshToken(refreshToken);
    const refreshTokenExpiresAt = getRefreshTokenExpiryDate();

    await prisma.$executeRaw`
      UPDATE "users"
      SET
        "refresh_token_hash" = ${refreshTokenHash},
        "refresh_token_expires_at" = ${refreshTokenExpiresAt}
      WHERE "id" = ${userId}
    `;
  },

  async _clearRefreshToken(userId) {
    await prisma.$executeRaw`
      UPDATE "users"
      SET
        "refresh_token_hash" = NULL,
        "refresh_token_expires_at" = NULL
      WHERE "id" = ${userId}
    `;
  },

  async _findUserWithRefreshToken(userId) {
    const rows = await prisma.$queryRaw`
      SELECT
        "id",
        "email",
        "role",
        "employee_id",
        "is_locked",
        "is_deleted",
        "refresh_token_hash",
        "refresh_token_expires_at"
      FROM "users"
      WHERE "id" = ${userId}
      LIMIT 1
    `;

    return rows[0] ?? null;
  },

  async changePassword(userId, newPassword, currentPassword = null) {
    if (!userId) {
      throw new ApiError(ERROR_CODES.BAD_REQUEST, 'User ID is required');
    }
    if (!newPassword) {
      throw new ApiError(ERROR_CODES.BAD_REQUEST, 'New password is required');
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new ApiError(ERROR_CODES.NOT_FOUND, 'User not found');
    }

    // If not forced to change password, require current password verification
    if (!user.must_change_password) {
      if (!currentPassword) {
        throw new ApiError(ERROR_CODES.BAD_REQUEST, 'Current password is required');
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isMatch) {
        throw new ApiError(ERROR_CODES.UNAUTHORIZED, 'Current password is incorrect');
      }
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: {
        password_hash: hashed,
        must_change_password: false,
      },
    });

    return { success: true, must_change_password: false };
  },
};
