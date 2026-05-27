import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(() => 'signed-token'),
  },
}));

import jwt from 'jsonwebtoken';
import { tokenService } from '../../src/services/token.service.js';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('tokenService.generateAccessToken', () => {
  it('signs token with a valid Prisma role', () => {
    const token = tokenService.generateAccessToken({
      id: 1,
      role: 'HR',
      employee_id: 10,
    });

    expect(token).toBe('signed-token');
    expect(jwt.sign).toHaveBeenCalledWith(
      { id: 1, role: 'HR', employee_id: 10 },
      process.env.JWT_SECRET,
      { expiresIn: '15m' },
    );
  });

  it('throws when role is not part of the Prisma enum', () => {
    expect(() =>
      tokenService.generateAccessToken({
        id: 1,
        role: 'MANAGER',
        employee_id: 10,
      }),
    ).toThrow('User has invalid role');
  });
});
