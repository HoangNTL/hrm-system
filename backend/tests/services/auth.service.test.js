import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/config/db.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    $queryRaw: vi.fn(),
    $executeRaw: vi.fn(),
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

vi.mock('../../src/services/token.service.js', () => ({
  tokenService: {
    generateAccessToken: vi.fn(),
    generateRefreshToken: vi.fn(),
  },
}));

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../src/config/db.js';
import { authService } from '../../src/services/auth.service.js';
import { tokenService } from '../../src/services/token.service.js';
import ApiError from '../../src/utils/ApiError.js';
import { ERROR_CODES } from '../../src/utils/errorCodes.js';
import { hashRefreshToken } from '../../src/utils/refreshToken.js';

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
    await expect(authService.login('', 'pass')).rejects.toBeInstanceOf(ApiError);
    await expect(authService.login('a@b.com', '')).rejects.toBeInstanceOf(ApiError);
  });

  it('throws UNAUTHORIZED when user not found', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(authService.login('a@b.com', 'pass')).rejects.toMatchObject({
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

    await expect(authService.login('a@b.com', 'pass')).rejects.toMatchObject({
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

    await expect(authService.login('a@b.com', 'pass')).rejects.toMatchObject({
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
    prisma.$executeRaw.mockResolvedValue(1);
    bcrypt.compare.mockResolvedValue(true);
    tokenService.generateRefreshToken.mockReturnValue('issued-refresh-token');

    const res = await authService.login('a@b.com', 'pass');

    expect(res).toMatchObject({
      accessToken: 'access-token',
      refreshToken: 'issued-refresh-token',
      user: { id: 1, email: 'a@b.com', role: 'STAFF' },
    });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { last_login_at: expect.any(Date) },
    });
    expect(prisma.$executeRaw).toHaveBeenCalledTimes(1);
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
    prisma.$queryRaw.mockResolvedValue([]);

    await expect(authService.refreshToken('ok')).rejects.toMatchObject({
      status: ERROR_CODES.NOT_FOUND,
    });
  });

  it('rejects refresh when no stored refresh token exists', async () => {
    jwt.verify.mockReturnValue({ id: 1 });
    prisma.$queryRaw.mockResolvedValue([
      {
        id: 1,
        role: 'STAFF',
        employee_id: 10,
        is_locked: false,
        is_deleted: false,
        refresh_token_hash: null,
        refresh_token_expires_at: null,
      },
    ]);

    await expect(authService.refreshToken('ok')).rejects.toMatchObject({
      status: ERROR_CODES.FORBIDDEN,
      message: 'Refresh token has been revoked',
    });
  });

  it('rejects expired stored refresh token and clears it', async () => {
    jwt.verify.mockReturnValue({ id: 1 });
    prisma.$queryRaw.mockResolvedValue([
      {
        id: 1,
        role: 'STAFF',
        employee_id: 10,
        is_locked: false,
        is_deleted: false,
        refresh_token_hash: hashRefreshToken('expired-token'),
        refresh_token_expires_at: new Date(Date.now() - 1000),
      },
    ]);
    prisma.$executeRaw.mockResolvedValue(1);

    await expect(authService.refreshToken('expired-token')).rejects.toMatchObject({
      status: ERROR_CODES.FORBIDDEN,
      message: 'Invalid or expired refresh token',
    });
    expect(prisma.$executeRaw).toHaveBeenCalledTimes(1);
  });

  it('rejects reused or old refresh tokens and revokes the session', async () => {
    jwt.verify.mockReturnValue({ id: 1 });
    prisma.$queryRaw.mockResolvedValue([
      {
        id: 1,
        role: 'STAFF',
        employee_id: 10,
        is_locked: false,
        is_deleted: false,
        refresh_token_hash: hashRefreshToken('current-refresh-token'),
        refresh_token_expires_at: new Date(Date.now() + 60_000),
      },
    ]);
    prisma.$executeRaw.mockResolvedValue(1);

    await expect(authService.refreshToken('old-refresh-token')).rejects.toMatchObject({
      status: ERROR_CODES.FORBIDDEN,
      message: 'Refresh token has been revoked',
    });
    expect(prisma.$executeRaw).toHaveBeenCalledTimes(1);
  });

  it('returns new tokens and rotates the stored refresh token when valid', async () => {
    jwt.verify.mockReturnValue({ id: 1 });
    prisma.$queryRaw.mockResolvedValue([
      {
        id: 1,
        email: 'a@b.com',
        role: 'STAFF',
        employee_id: 10,
        is_locked: false,
        is_deleted: false,
        refresh_token_hash: hashRefreshToken('valid-refresh-token'),
        refresh_token_expires_at: new Date(Date.now() + 60_000),
      },
    ]);
    prisma.$executeRaw.mockResolvedValue(1);
    tokenService.generateRefreshToken.mockReturnValue('rotated-refresh-token');

    const res = await authService.refreshToken('valid-refresh-token');

    expect(res).toEqual({
      accessToken: 'access-token',
      refreshToken: 'rotated-refresh-token',
    });
    expect(tokenService.generateAccessToken).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1, role: 'STAFF', employee_id: 10 }),
    );
    expect(prisma.$executeRaw).toHaveBeenCalledTimes(1);
  });
});

describe('authService.logout', () => {
  it('throws BAD_REQUEST when no userId', async () => {
    await expect(authService.logout(null)).rejects.toMatchObject({
      status: ERROR_CODES.BAD_REQUEST,
    });
  });

  it('clears the stored refresh token on success', async () => {
    prisma.$executeRaw.mockResolvedValue(1);

    const res = await authService.logout(1);

    expect(res).toBeNull();
    expect(prisma.$executeRaw).toHaveBeenCalledTimes(1);
  });
});

describe('authService.changePassword', () => {
  it('validates required fields', async () => {
    await expect(authService.changePassword(null, 'new')).rejects.toMatchObject({
      status: ERROR_CODES.BAD_REQUEST,
    });
    await expect(authService.changePassword(1, '')).rejects.toMatchObject({
      status: ERROR_CODES.BAD_REQUEST,
    });
  });

  it('throws NOT_FOUND if user missing', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(authService.changePassword(1, 'new', 'old')).rejects.toMatchObject({
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

    await expect(authService.changePassword(1, 'new', 'wrong')).rejects.toMatchObject({
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

    const res = await authService.changePassword(1, 'new');

    expect(res).toEqual({ success: true, must_change_password: false });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { password_hash: 'hashed', must_change_password: false },
    });
  });
});
