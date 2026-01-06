import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/config/db.js', () => ({
    prisma: {
        shift: {
            findMany: vi.fn(),
            count: vi.fn(),
            findUnique: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
        },
    },
}));

import { prisma } from '../../src/config/db.js';
import { shiftService } from '../../src/services/shift.service.js';

beforeEach(() => {
    vi.clearAllMocks();
});

describe('shiftService.create', () => {
    it('throws when name missing', async () => {
        await expect(shiftService.create({})).rejects.toMatchObject({ status: 400 });
    });

    it('parses HH:mm times and creates', async () => {
        prisma.shift.create.mockResolvedValue({ id: 1, shift_name: 'Morning' });
        const res = await shiftService.create({
            shift_name: 'Morning',
            start_time: '08:00',
            end_time: '17:00',
            early_check_in_minutes: 10,
            late_checkout_minutes: 20,
        });
        expect(res).toMatchObject({ id: 1 });
        const args = prisma.shift.create.mock.calls[0][0];
        expect(args.data.start_time).toBeInstanceOf(Date);
        expect(args.data.end_time).toBeInstanceOf(Date);
    });
});

describe('shiftService.getById', () => {
    it('throws NOT_FOUND when missing', async () => {
        prisma.shift.findUnique.mockResolvedValue(null);
        await expect(shiftService.getById(1)).rejects.toMatchObject({ status: 404 });
    });
});

describe('shiftService.update', () => {
    it('throws when no fields to update', async () => {
        prisma.shift.findUnique.mockResolvedValue({ id: 1, is_deleted: false });
        await expect(shiftService.update(1, {})).rejects.toMatchObject({ status: 400 });
    });
});

describe('shiftService.getAll', () => {
    it('applies search and returns pagination/data', async () => {
        prisma.shift.findMany.mockResolvedValue([]);
        prisma.shift.count.mockResolvedValue(0);

        const res = await shiftService.getAll({ search: 'morning', page: 1, limit: 10 });
        expect(res.pagination).toMatchObject({ page: 1, limit: 10, total: 0, total_pages: 1 });
        const args = prisma.shift.findMany.mock.calls[0][0];
        expect(args.where.shift_name.contains).toBe('morning');
    });
});
