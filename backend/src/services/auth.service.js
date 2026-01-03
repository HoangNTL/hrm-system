import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { prisma } from '../config/db.js';
import { tokenService } from './token.service.js';
import ApiError from '../utils/ApiError.js';
import { ERROR_CODES } from '../utils/errorCodes.js';

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

    const user = await this._findUser(payload.id);
    if (!user) throw new ApiError(ERROR_CODES.NOT_FOUND, 'User not found');

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
    // refresh_token column đã bị drop khỏi bảng users,
    // không còn lưu refresh token trong DB nữa.
    return;
  },

  async _clearRefreshToken(userId) {
    // Không còn cột refresh_token, nên không cần clear trong DB.
    return;
  },

  async _findUser(userId) {
    return await prisma.user.findUnique({ where: { id: userId } });
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
