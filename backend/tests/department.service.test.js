import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../src/config/db.js', () => ({
    prisma: {
        department: {
            findMany: vi.fn(),
            count: vi.fn(),
            findUnique: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
        },
    },
}));

import { prisma } from '../src/config/db.js';
import { departmentService } from '../src/services/department.service.js';

beforeEach(() => vi.clearAllMocks());

describe('departmentService.create', () => {
    it('throws when name missing', async () => {
        await expect(departmentService.create({})).rejects.toMatchObject({ status: 400 });
    });

    it('generates code from name when missing', async () => {
        prisma.department.create.mockResolvedValue({ id: 1, name: 'R&D', code: 'R_D' });
        const res = await departmentService.create({ name: 'R&D' });
        expect(res).toMatchObject({ id: 1 });
        // Ensure code was created in prisma call
        const args = prisma.department.create.mock.calls[0][0];
        expect(args.data.code).toBeTruthy();
    });
});

describe('departmentService.getById', () => {
    it('throws when not found', async () => {
        prisma.department.findUnique.mockResolvedValue(null);
        await expect(departmentService.getById(1)).rejects.toMatchObject({ status: 404 });
    });
});

describe('departmentService.update', () => {
    it('throws when no fields to update', async () => {
        prisma.department.findUnique.mockResolvedValue({ id: 1, is_deleted: false });
        await expect(departmentService.update(1, {})).rejects.toMatchObject({ status: 400 });
    });
});
