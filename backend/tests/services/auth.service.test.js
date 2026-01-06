import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocks
vi.mock('../../src/config/db.js', () => {
  return {
    prisma: {
      user: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
    },
  };
});

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
    generateAccessToken: vi.fn(() => 'access-token'),
    generateRefreshToken: vi.fn(() => 'refresh-token'),
  },
}));

import { prisma } from '../../src/config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { tokenService } from '../../src/services/token.service.js';

import { authService } from '../../src/services/auth.service.js';
import ApiError from '../../src/utils/ApiError.js';
import { ERROR_CODES } from '../../src/utils/errorCodes.js';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('authService.login', () => {
  it('throws BAD_REQUEST when missing email or password', async () => {
    await expect(authService.login('', 'pass')).rejects.toBeInstanceOf(ApiError);
    await expect(authService.login('a@b.com', '')).rejects.toBeInstanceOf(ApiError);
  });

  it('throws UNAUTHORIZED when user not found', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(authService.login('a@b.com', 'pass')).rejects.toMatchObject({ status: ERROR_CODES.UNAUTHORIZED });
  });

  it('throws UNAUTHORIZED when password mismatch', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 1, email: 'a@b.com', password_hash: 'hash', is_locked: false });
    bcrypt.compare.mockResolvedValue(false);
    await expect(authService.login('a@b.com', 'pass')).rejects.toMatchObject({ status: ERROR_CODES.UNAUTHORIZED });
  });

  it('throws FORBIDDEN when account is locked', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 1, email: 'a@b.com', password_hash: 'hash', is_locked: true });
    bcrypt.compare.mockResolvedValue(true);
    await expect(authService.login('a@b.com', 'pass')).rejects.toMatchObject({ status: ERROR_CODES.FORBIDDEN });
  });

  it('returns tokens and user info on success', async () => {
    const user = { id: 1, email: 'a@b.com', role: 'USER', employee_id: 10, employee: { id: 10 }, password_hash: 'hash', is_locked: false };
    prisma.user.findUnique.mockResolvedValue(user);
    bcrypt.compare.mockResolvedValue(true);
    prisma.user.update.mockResolvedValue({});

    const res = await authService.login('a@b.com', 'pass');

    expect(res).toMatchObject({ accessToken: 'access-token', refreshToken: 'refresh-token', user: { id: 1, email: 'a@b.com' } });
    expect(prisma.user.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { last_login_at: expect.any(Date) } });
    expect(tokenService.generateAccessToken).toHaveBeenCalledWith(user);
    expect(tokenService.generateRefreshToken).toHaveBeenCalledWith(user);
  });
});

describe('authService.refreshToken', () => {
  it('throws UNAUTHORIZED when no token', async () => {
    await expect(authService.refreshToken('')).rejects.toMatchObject({ status: ERROR_CODES.UNAUTHORIZED });
  });

  it('throws FORBIDDEN on invalid token', async () => {
    jwt.verify.mockImplementation(() => { throw new Error('invalid'); });
    await expect(authService.refreshToken('bad-token')).rejects.toMatchObject({ status: ERROR_CODES.FORBIDDEN });
  });

  it('throws NOT_FOUND when user missing', async () => {
    jwt.verify.mockReturnValue({ id: 1 });
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(authService.refreshToken('ok')).rejects.toMatchObject({ status: ERROR_CODES.NOT_FOUND });
  });

  it('returns new tokens when valid', async () => {
    jwt.verify.mockReturnValue({ id: 1 });
    prisma.user.findUnique.mockResolvedValue({ id: 1 });
    const res = await authService.refreshToken('ok');
    expect(res).toEqual({ accessToken: 'access-token', refreshToken: 'refresh-token' });
  });
});

describe('authService.logout', () => {
  it('throws BAD_REQUEST when no userId', async () => {
    await expect(authService.logout(null)).rejects.toMatchObject({ status: ERROR_CODES.BAD_REQUEST });
  });

  it('returns null on success', async () => {
    const res = await authService.logout(1);
    expect(res).toBeNull();
  });
});

describe('authService.changePassword', () => {
  it('validates required fields', async () => {
    await expect(authService.changePassword(null, 'new')).rejects.toMatchObject({ status: ERROR_CODES.BAD_REQUEST });
    await expect(authService.changePassword(1, '')).rejects.toMatchObject({ status: ERROR_CODES.BAD_REQUEST });
  });

  it('throws NOT_FOUND if user missing', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(authService.changePassword(1, 'new', 'old')).rejects.toMatchObject({ status: ERROR_CODES.NOT_FOUND });
  });

  it('requires current password when must_change_password=false', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 1, password_hash: 'hash', must_change_password: false });
    bcrypt.compare.mockResolvedValue(false);
    await expect(authService.changePassword(1, 'new', 'wrong')).rejects.toMatchObject({ status: ERROR_CODES.UNAUTHORIZED });
  });

  it('updates password and clears must_change_password', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 1, password_hash: 'hash', must_change_password: true });
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
