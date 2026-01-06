import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/config/db.js', () => ({
    prisma: {
        user: {
            findMany: vi.fn(),
            count: vi.fn(),
            findUnique: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            updateMany: vi.fn(),
        },
    },
}));

vi.mock('bcrypt', () => ({
    default: {
        hash: vi.fn(async () => 'hashed'),
        compare: vi.fn(async () => true),
    },
}));

vi.mock('crypto', () => ({
    default: {
        randomInt: vi.fn((min, max) => min),
    },
}));

import { prisma } from '../../src/config/db.js';
import { userService } from '../../src/services/user.service.js';

beforeEach(() => {
    vi.clearAllMocks();
});

describe('userService.create', () => {
    it('throws when email missing', async () => {
        await expect(userService.create({})).rejects.toMatchObject({ status: 400 });
    });

    it('throws when email exists', async () => {
        prisma.user.findUnique.mockResolvedValue({ id: 1 });
        await expect(userService.create({ email: 'a@b.com' })).rejects.toMatchObject({ status: 409 });
    });

    it('normalizes role HR->MANAGER and returns created user', async () => {
        prisma.user.findUnique.mockResolvedValue(null);
        prisma.user.create.mockResolvedValue({ id: 2, email: 'a@b.com', role: 'MANAGER' });

        const res = await userService.create({ email: 'a@b.com', role: 'HR', password: 'P@ssw0rd' });
        expect(res.user).toMatchObject({ id: 2, email: 'a@b.com' });
        expect(prisma.user.create.mock.calls[0][0].data.role).toBe('MANAGER');
    });
});

describe('userService.resetPassword', () => {
    it('throws NOT_FOUND if missing', async () => {
        prisma.user.findUnique.mockResolvedValue(null);
        await expect(userService.resetPassword(1)).rejects.toMatchObject({ status: 404 });
    });

    it('updates password and sets must_change_password', async () => {
        prisma.user.findUnique.mockResolvedValue({ id: 1, is_deleted: false });
        prisma.user.update.mockResolvedValue({});
        const res = await userService.resetPassword(1);
        expect(res).toHaveProperty('password');
        expect(prisma.user.update).toHaveBeenCalledWith({
            where: { id: 1 },
            data: { password_hash: 'hashed', must_change_password: true },
        });
    });
});

describe('userService.toggleLock', () => {
    it('toggles is_locked flag', async () => {
        prisma.user.findUnique.mockResolvedValue({ id: 1, is_deleted: false, is_locked: false });
        prisma.user.update.mockResolvedValue({ id: 1, is_locked: true });
        const res = await userService.toggleLock(1);
        expect(res).toMatchObject({ is_locked: true });
    });
});

describe('userService.getAll', () => {
    it('applies filters and returns pagination/data', async () => {
        prisma.user.findMany.mockResolvedValue([]);
        prisma.user.count.mockResolvedValue(0);

        const res = await userService.getAll({ search: 'john', role: 'staff', status: 'active', page: 2, limit: 5 });

        expect(res.pagination).toMatchObject({ page: 2, limit: 5, total: 0, total_pages: 1 });
        const args = prisma.user.findMany.mock.calls[0][0];
        expect(args.where.OR).toBeTruthy();
        expect(args.where.role).toBe('STAFF');
        expect(args.where.is_deleted).toBe(false); // from default
    });
});
