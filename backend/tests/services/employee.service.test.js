import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/config/db.js', () => ({
  prisma: {
    $transaction: vi.fn(async (fn) => fn(prisma)),
    employee: {
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    user: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock('../../src/services/user.service.js', () => ({
  userService: {
    create: vi.fn(async ({ email, employee_id, role }) => ({
      user: { id: 99, email, role },
      password: 'Temp#1234',
    })),
  },
}));

import { prisma } from '../../src/config/db.js';
import { userService } from '../../src/services/user.service.js';
import { employeeService } from '../../src/services/employee.service.js';

beforeEach(() => vi.clearAllMocks());

describe('employeeService.create', () => {
  it('validates required fields', async () => {
    await expect(employeeService.create({})).rejects.toMatchObject({ status: 400 });
  });

  it('creates employee and optionally creates login', async () => {
    prisma.employee.create.mockResolvedValue({
      id: 1,
      full_name: 'John',
      gender: 'MALE',
      dob: new Date(),
      identity_number: '0123456789',
      email: 'john@example.com',
      address: null,
      department_id: null,
      position_id: null,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const res = await employeeService.create({
      full_name: 'John',
      gender: 'MALE',
      dob: '1990-01-01',
      cccd: '0123456789',
      email: 'john@example.com',
      create_login: true,
    });

    expect(res.employee.id).toBe(1);
    expect(userService.create).toHaveBeenCalled();
    expect(res.user_account).toMatchObject({ id: 99 });
  });
});

describe('employeeService.update', () => {
  it('throws when dob invalid', async () => {
    prisma.employee.findUnique.mockResolvedValue({ id: 1, is_deleted: false });
    await expect(employeeService.update(1, { dob: 'not-a-date' })).rejects.toMatchObject({ status: 400 });
  });
});

describe('employeeService.delete', () => {
  it('soft deletes employee and linked user', async () => {
    prisma.employee.findUnique.mockResolvedValue({ id: 1, is_deleted: false });
    prisma.user.findFirst.mockResolvedValue({ id: 2 });
    prisma.employee.update.mockResolvedValue({});
    prisma.user.update.mockResolvedValue({});

    const res = await employeeService.delete(1);
    expect(res).toEqual({ id: 1, user_deleted: true });
    expect(prisma.employee.update).toHaveBeenCalled();
    expect(prisma.user.update).toHaveBeenCalled();
  });
});
