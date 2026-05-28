import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/config/database.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock('bcrypt', () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  },
}));

vi.mock('jsonwebtoken', () => ({
  default: {
    verify: vi.fn(),
  },
}));

vi.mock('../../src/shared/utils/token.js', async () => {
  const actual = await vi.importActual('../../src/shared/utils/token.js');

  return {
    ...actual,
    tokenService: {
      generateAccessToken: vi.fn(),
      generateRefreshToken: vi.fn(),
    },
  };
});

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../src/config/database.js';
import { authService } from '../../src/modules/auth/auth.service.js';
import { tokenService } from '../../src/shared/utils/token.js';
import ApiError from '../../src/utils/ApiError.js';
import { ERROR_CODES } from '../../src/utils/errorCodes.js';
import { hashRefreshToken } from '../../src/shared/utils/token.js';

beforeEach(() => {
  vi.clearAllMocks();
  process.env.JWT_SECRET = 'test-access-secret';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
  process.env.REFRESH_TOKEN_HASH_SECRET = 'test-refresh-hash-secret';

  tokenService.generateAccessToken.mockReturnValue('access-token');
  tokenService.generateRefreshToken.mockReturnValue('refresh-token');
});

describe('authService.login', () => {
  it('throws BAD_REQUEST when missing email or password', async () => {
    await expect(authService.login({ email: '', password: 'pass' })).rejects.toBeInstanceOf(ApiError);
    await expect(authService.login({ email: 'a@b.com', password: '' })).rejects.toBeInstanceOf(ApiError);
  });

  it('throws UNAUTHORIZED when user not found', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(authService.login({ email: 'a@b.com', password: 'pass' })).rejects.toMatchObject({
      status: ERROR_CODES.UNAUTHORIZED,
    });
  });

  it('throws UNAUTHORIZED when password mismatch', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'a@b.com',
      password_hash: 'hash',
      is_locked: false,
    });
    bcrypt.compare.mockResolvedValue(false);

    await expect(authService.login({ email: 'a@b.com', password: 'pass' })).rejects.toMatchObject({
      status: ERROR_CODES.UNAUTHORIZED,
    });
  });

  it('throws FORBIDDEN when account is locked', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'a@b.com',
      password_hash: 'hash',
      is_locked: true,
    });
    bcrypt.compare.mockResolvedValue(true);

    await expect(authService.login({ email: 'a@b.com', password: 'pass' })).rejects.toMatchObject({
      status: ERROR_CODES.FORBIDDEN,
    });
  });

  it('returns tokens, updates last login, and stores hashed refresh token', async () => {
    const user = {
      id: 1,
      email: 'a@b.com',
      role: 'STAFF',
      employee_id: 10,
      employee: { id: 10 },
      password_hash: 'hash',
      is_locked: false,
    };

    prisma.user.findUnique.mockResolvedValue(user);
    prisma.user.update.mockResolvedValue({});
    bcrypt.compare.mockResolvedValue(true);
    tokenService.generateRefreshToken.mockReturnValue('issued-refresh-token');

    const res = await authService.login({ email: 'a@b.com', password: 'pass' });

    expect(res).toMatchObject({
      accessToken: 'access-token',
      refreshToken: 'issued-refresh-token',
      user: { id: 1, email: 'a@b.com', role: 'STAFF' },
    });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { last_login_at: expect.any(Date) },
    });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: expect.objectContaining({
        refresh_token_hash: expect.any(String),
        refresh_token_expires_at: expect.any(Date),
      }),
    });
  });
});

describe('authService.refreshToken', () => {
  it('throws UNAUTHORIZED when no token', async () => {
    await expect(authService.refreshToken('')).rejects.toMatchObject({
      status: ERROR_CODES.UNAUTHORIZED,
    });
  });

  it('throws FORBIDDEN on invalid token signature', async () => {
    jwt.verify.mockImplementation(() => {
      throw new Error('invalid');
    });

    await expect(authService.refreshToken('bad-token')).rejects.toMatchObject({
      status: ERROR_CODES.FORBIDDEN,
    });
  });

  it('throws NOT_FOUND when user missing', async () => {
    jwt.verify.mockReturnValue({ id: 1 });
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(authService.refreshToken('ok')).rejects.toMatchObject({
      status: ERROR_CODES.NOT_FOUND,
    });
  });

  it('rejects refresh when no stored refresh token exists', async () => {
    jwt.verify.mockReturnValue({ id: 1 });
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      role: 'STAFF',
      employee_id: 10,
      is_locked: false,
      is_deleted: false,
      refresh_token_hash: null,
      refresh_token_expires_at: null,
    });

    await expect(authService.refreshToken('ok')).rejects.toMatchObject({
      status: ERROR_CODES.FORBIDDEN,
      message: 'Refresh token has been revoked',
    });
  });

  it('rejects expired stored refresh token and clears it', async () => {
    jwt.verify.mockReturnValue({ id: 1 });
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      role: 'STAFF',
      employee_id: 10,
      is_locked: false,
      is_deleted: false,
      refresh_token_hash: hashRefreshToken('expired-token'),
      refresh_token_expires_at: new Date(Date.now() - 1000),
    });

    await expect(authService.refreshToken('expired-token')).rejects.toMatchObject({
      status: ERROR_CODES.FORBIDDEN,
      message: 'Invalid or expired refresh token',
    });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { refresh_token_hash: null, refresh_token_expires_at: null },
    });
  });

  it('rejects reused or old refresh tokens and revokes the session', async () => {
    jwt.verify.mockReturnValue({ id: 1 });
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      role: 'STAFF',
      employee_id: 10,
      is_locked: false,
      is_deleted: false,
      refresh_token_hash: hashRefreshToken('current-refresh-token'),
      refresh_token_expires_at: new Date(Date.now() + 60_000),
    });

    await expect(authService.refreshToken('old-refresh-token')).rejects.toMatchObject({
      status: ERROR_CODES.FORBIDDEN,
      message: 'Refresh token has been revoked',
    });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { refresh_token_hash: null, refresh_token_expires_at: null },
    });
  });

  it('returns new tokens and rotates the stored refresh token when valid', async () => {
    jwt.verify.mockReturnValue({ id: 1 });
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'a@b.com',
      role: 'STAFF',
      employee_id: 10,
      is_locked: false,
      is_deleted: false,
      refresh_token_hash: hashRefreshToken('valid-refresh-token'),
      refresh_token_expires_at: new Date(Date.now() + 60_000),
    });
    tokenService.generateRefreshToken.mockReturnValue('rotated-refresh-token');

    const res = await authService.refreshToken('valid-refresh-token');

    expect(res).toEqual({
      accessToken: 'access-token',
      refreshToken: 'rotated-refresh-token',
    });
    expect(tokenService.generateAccessToken).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1, role: 'STAFF', employee_id: 10 }),
    );
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: expect.objectContaining({
        refresh_token_hash: expect.any(String),
        refresh_token_expires_at: expect.any(Date),
      }),
    });
  });
});

describe('authService.logout', () => {
  it('throws BAD_REQUEST when no userId', async () => {
    await expect(authService.logout(null)).rejects.toMatchObject({
      status: ERROR_CODES.BAD_REQUEST,
    });
  });

  it('clears the stored refresh token on success', async () => {
    prisma.user.update.mockResolvedValue({});

    const res = await authService.logout(1);

    expect(res).toBeNull();
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { refresh_token_hash: null, refresh_token_expires_at: null },
    });
  });
});

describe('authService.changePassword', () => {
  it('validates required fields', async () => {
    await expect(authService.changePassword({ userId: null, newPassword: 'new' })).rejects.toMatchObject({
      status: ERROR_CODES.BAD_REQUEST,
    });
    await expect(authService.changePassword({ userId: 1, newPassword: '' })).rejects.toMatchObject({
      status: ERROR_CODES.BAD_REQUEST,
    });
  });

  it('throws NOT_FOUND if user missing', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(authService.changePassword({ userId: 1, newPassword: 'new', currentPassword: 'old' })).rejects.toMatchObject({
      status: ERROR_CODES.NOT_FOUND,
    });
  });

  it('requires current password when must_change_password=false', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      password_hash: 'hash',
      must_change_password: false,
    });
    bcrypt.compare.mockResolvedValue(false);

    await expect(authService.changePassword({ userId: 1, newPassword: 'new', currentPassword: 'wrong' })).rejects.toMatchObject({
      status: ERROR_CODES.UNAUTHORIZED,
    });
  });

  it('updates password and clears must_change_password', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      password_hash: 'hash',
      must_change_password: true,
    });
    bcrypt.hash.mockResolvedValue('hashed');
    prisma.user.update.mockResolvedValue({});

    const res = await authService.changePassword({ userId: 1, newPassword: 'new' });

    expect(res).toEqual({ success: true, must_change_password: false });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { password_hash: 'hashed', must_change_password: false },
    });
  });
});
