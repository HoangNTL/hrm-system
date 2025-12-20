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
    await prisma.user.update({
      where: { id: userId },
      data: { refresh_token: refreshToken },
    });
  },

  async _clearRefreshToken(userId) {
    await prisma.user.update({
      where: { id: userId },
      data: { refresh_token: null },
    });
  },

  async _findUser(userId) {
    return await prisma.user.findUnique({ where: { id: userId } });
  },
};
