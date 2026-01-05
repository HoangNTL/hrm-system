import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../src/config/db.js', () => ({
    prisma: {
        position: {
            findMany: vi.fn(),
            count: vi.fn(),
            findUnique: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
        },
    },
}));

import { prisma } from '../src/config/db.js';
import { positionService } from '../src/services/position.service.js';

beforeEach(() => vi.clearAllMocks());

describe('positionService.create', () => {
    it('throws when name missing', async () => {
        await expect(positionService.create({})).rejects.toMatchObject({ status: 400 });
    });

    it('creates a position', async () => {
        prisma.position.create.mockResolvedValue({ id: 1, name: 'Dev' });
        const res = await positionService.create({ name: 'Dev', description: 'Developer', status: true });
        expect(res).toMatchObject({ id: 1 });
    });
});

describe('positionService.getById', () => {
    it('throws when not found', async () => {
        prisma.position.findUnique.mockResolvedValue(null);
        await expect(positionService.getById(1)).rejects.toMatchObject({ status: 404 });
    });
});

describe('positionService.update', () => {
    it('throws when no fields to update', async () => {
        prisma.position.findUnique.mockResolvedValue({ id: 1, is_deleted: false });
        await expect(positionService.update(1, {})).rejects.toMatchObject({ status: 400 });
    });
});
