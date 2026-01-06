import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/config/db.js', () => ({
    prisma: {
        contract: {
            findMany: vi.fn(),
            count: vi.fn(),
            findUnique: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
        },
        employee: {
            findUnique: vi.fn(),
        },
    },
}));

import { prisma } from '../../src/config/db.js';
import { contractService } from '../../src/services/contract.service.js';

beforeEach(() => vi.clearAllMocks());

describe('contractService.getAll', () => {
    it('applies filters and returns pagination/data', async () => {
        prisma.contract.findMany.mockResolvedValue([]);
        prisma.contract.count.mockResolvedValue(0);

        const res = await contractService.getAll({ search: 'C001', status: 'active', type: 'fulltime', employeeId: 5, page: 2, limit: 5 });
        expect(res.pagination).toMatchObject({ page: 2, limit: 5, total: 0, total_pages: 1 });

        const args = prisma.contract.findMany.mock.calls[0][0];
        expect(args.where.is_deleted).toBe(false);
        expect(args.where.status).toBe('active');
        expect(args.where.contract_type).toBe('fulltime');
        expect(args.where.employee_id).toBe(5);
        expect(args.where.OR).toBeTruthy();
    });
});

describe('contractService.getById', () => {
    it('throws NOT_FOUND when missing', async () => {
        prisma.contract.findUnique.mockResolvedValue(null);
        await expect(contractService.getById(1)).rejects.toMatchObject({ status: 404 });
    });

    it('maps contract fields correctly', async () => {
        const start = new Date('2025-12-01T00:00:00.000Z');
        const end = new Date('2025-12-31T00:00:00.000Z');
        prisma.contract.findUnique.mockResolvedValue({
            id: 1,
            code: 'C-001',
            contract_type: 'fulltime',
            status: 'active',
            start_date: start,
            end_date: end,
            salary: '1234.56',
            work_location: 'HN',
            notes: 'note',
            created_at: new Date(),
            updated_at: new Date(),
            employee: { id: 5, full_name: 'John', email: 'john@x.com', phone: '123', department: { name: 'IT' }, position: { name: 'Dev' } },
        });

        const res = await contractService.getById(1);
        expect(res.code).toBe('C-001');
        expect(res.salary).toBeCloseTo(1234.56, 2);
        expect(res.start_date).toBe('2025-12-01');
        expect(res.end_date).toBe('2025-12-31');
        expect(res.employee_id).toBe(5);
        expect(res.department_name).toBe('IT');
        expect(res.position_name).toBe('Dev');
    });
});

describe('contractService.create', () => {
    it('validates required fields', async () => {
        await expect(contractService.create({})).rejects.toMatchObject({ status: 400 });
        await expect(contractService.create({ code: 'A' })).rejects.toMatchObject({ status: 400 });
        await expect(contractService.create({ code: 'A', employee_id: 1 })).rejects.toMatchObject({ status: 400 });
        await expect(contractService.create({ code: 'A', employee_id: 1, contract_type: 'full' })).rejects.toMatchObject({ status: 400 });
    });

    it('throws NOT_FOUND if employee missing', async () => {
        prisma.employee.findUnique.mockResolvedValue(null);
        await expect(contractService.create({ code: 'A', employee_id: 1, contract_type: 'full', start_date: '2025-01-01' })).rejects.toMatchObject({ status: 404 });
    });

    it('throws when duplicate code exists', async () => {
        prisma.employee.findUnique.mockResolvedValue({ id: 1, is_deleted: false });
        prisma.contract.findUnique.mockResolvedValue({ id: 10, code: 'A' });
        await expect(contractService.create({ code: 'A', employee_id: 1, contract_type: 'full', start_date: '2025-01-01' })).rejects.toMatchObject({ status: 400 });
    });

    it('creates contract and maps result', async () => {
        prisma.employee.findUnique.mockResolvedValue({ id: 1, is_deleted: false });
        prisma.contract.findUnique.mockResolvedValue(null);
        prisma.contract.create.mockResolvedValue({
            id: 2,
            code: 'A',
            contract_type: 'full',
            status: 'draft',
            start_date: new Date('2025-01-01T00:00:00.000Z'),
            end_date: null,
            salary: 1000,
            work_location: null,
            notes: null,
            created_at: new Date(),
            updated_at: new Date(),
            employee: { id: 1, full_name: 'John' },
        });

        const res = await contractService.create({ code: 'A', employee_id: 1, contract_type: 'full', start_date: '2025-01-01', salary: 1000 });
        expect(res.id).toBe(2);
        expect(res.status).toBe('draft');
        expect(res.salary).toBe(1000);
    });
});

describe('contractService.update', () => {
    it('throws NOT_FOUND if contract missing', async () => {
        prisma.contract.findUnique.mockResolvedValue(null);
        await expect(contractService.update(1, { status: 'active' })).rejects.toMatchObject({ status: 404 });
    });

    it('throws when code empty', async () => {
        prisma.contract.findUnique.mockResolvedValueOnce({ id: 1, is_deleted: false, code: 'A' });
        await expect(contractService.update(1, { code: '' })).rejects.toMatchObject({ status: 400 });
    });

    it('throws when code duplicate', async () => {
        prisma.contract.findUnique
            .mockResolvedValueOnce({ id: 1, is_deleted: false, code: 'A' }) // existing
            .mockResolvedValueOnce({ id: 2, code: 'B' }); // duplicate for B

        await expect(contractService.update(1, { code: 'B' })).rejects.toMatchObject({ status: 400 });
    });

    it('throws when employee invalid or missing', async () => {
        prisma.contract.findUnique.mockResolvedValue({ id: 1, is_deleted: false, code: 'A' });
        await expect(contractService.update(1, { employee_id: 0 })).rejects.toMatchObject({ status: 400 });

        prisma.contract.findUnique.mockResolvedValue({ id: 1, is_deleted: false, code: 'A' });
        prisma.employee.findUnique.mockResolvedValue(null);
        await expect(contractService.update(1, { employee_id: 5 })).rejects.toMatchObject({ status: 404 });
    });

    it('throws when no fields to update', async () => {
        prisma.contract.findUnique.mockResolvedValue({ id: 1, is_deleted: false, code: 'A' });
        await expect(contractService.update(1, {})).rejects.toMatchObject({ status: 400 });
    });

    it('updates and maps response', async () => {
        prisma.contract.findUnique
            .mockResolvedValueOnce({ id: 1, is_deleted: false, code: 'A' }) // fetch existing
            .mockResolvedValueOnce(null); // duplicate code check -> no duplicate

        prisma.contract.update.mockResolvedValue({
            id: 1,
            code: 'A1',
            contract_type: 'full',
            status: 'active',
            start_date: new Date('2025-01-01T00:00:00.000Z'),
            end_date: new Date('2025-12-31T00:00:00.000Z'),
            salary: 1500,
            work_location: 'HN',
            notes: 'n',
            created_at: new Date(),
            updated_at: new Date(),
            employee: { id: 1, full_name: 'John' },
        });

        const res = await contractService.update(1, { status: 'active', code: 'A1' });
        expect(res.status).toBe('active');
        expect(res.code).toBe('A1');
        expect(res.start_date).toBe('2025-01-01');
    });
});

describe('contractService.delete', () => {
    it('throws when missing', async () => {
        prisma.contract.findUnique.mockResolvedValue(null);
        await expect(contractService.delete(1)).rejects.toMatchObject({ status: 404 });
    });

    it('soft deletes and returns id', async () => {
        prisma.contract.findUnique.mockResolvedValue({ id: 1, is_deleted: false });
        prisma.contract.update.mockResolvedValue({});
        const res = await contractService.delete(1);
        expect(res).toEqual({ id: 1 });
        expect(prisma.contract.update).toHaveBeenCalledWith({
            where: { id: 1 },
            data: { is_deleted: true, deleted_at: expect.any(Date) },
        });
    });
});
