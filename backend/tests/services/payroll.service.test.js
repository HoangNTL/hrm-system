import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock prisma used by payroll service
vi.mock('../../src/config/db.js', () => ({
    prisma: {
        contract: {
            findFirst: vi.fn(),
        },
        attendance: {
            findMany: vi.fn(),
        },
        employee: {
            findUnique: vi.fn(),
            findMany: vi.fn(),
        },
    },
}));

// Mock exceljs to avoid dealing with real workbook buffers
vi.mock('exceljs', () => ({
    default: class Workbook {
        constructor() {
            this._sheets = [];
            this.xlsx = {
                writeBuffer: async () => new Uint8Array([1, 2, 3]),
            };
        }
        addWorksheet(name) {
            const sheet = {
                name,
                columns: [],
                _rows: [],
                addRow: (row) => sheet._rows.push(row),
                getRow: () => ({ font: {} }),
            };
            this._sheets.push(sheet);
            return sheet;
        }
    },
}));

import { prisma } from '../../src/config/db.js';
import payrollService from '../../src/services/payroll.service.js';

beforeEach(() => {
    vi.clearAllMocks();
});

describe('payrollService.getMonthlyTotals', () => {
    it('sums hours and counts late/absent correctly', async () => {
        prisma.attendance.findMany.mockResolvedValue([
            { work_hours: '8', late_minutes: 0, status: 'present' },
            { work_hours: '7.5', late_minutes: 10, status: 'late' },
            { work_hours: null, late_minutes: 0, status: 'absent' },
        ]);

        const res = await payrollService.getMonthlyTotals(1, 2025, 12);
        expect(res.totalHours).toBeCloseTo(15.5, 2);
        expect(res.lateMinutes).toBe(10);
        expect(res.lateCount).toBe(1);
        expect(res.absentCount).toBe(1);
    });
});

describe('payrollService.getPayslip', () => {
    it('returns null when employee not found', async () => {
        prisma.employee.findUnique.mockResolvedValue(null);
        const res = await payrollService.getPayslip(1, 2025, 12);
        expect(res).toBeNull();
    });

    it('formats payslip with contract data and totals', async () => {
        prisma.employee.findUnique.mockResolvedValue({
            id: 1,
            full_name: 'John Doe',
            email: 'john@doe.com',
            department: { name: 'IT' },
            position: { name: 'Dev' },
        });

        prisma.contract.findFirst.mockResolvedValue({ id: 10, code: 'C-001', salary: '1600' });

        // 20 hours total -> hourly rate = 1600/160 = 10 => gross 200, net 200
        vi.spyOn(payrollService, 'getMonthlyTotals').mockResolvedValue({
            totalHours: 20,
            lateMinutes: 0,
            absentCount: 0,
            lateCount: 0,
        });

        const res = await payrollService.getPayslip(1, 2025, 12);
        expect(res.employee.full_name).toBe('John Doe');
        expect(res.contract.salary).toBe(1600);
        expect(res.hourlyRate).toBe(10);
        expect(res.gross).toBe(200);
        expect(res.net).toBe(200);
    });
});

describe('payrollService.getMonthlyPayroll', () => {
    it('returns rows for all employees (basic smoke)', async () => {
        prisma.employee.findMany.mockResolvedValue([
            { id: 1, department: { name: 'IT' } },
            { id: 2, department: { name: 'HR' } },
        ]);

        vi.spyOn(payrollService, 'getPayslip').mockImplementation(async (id) => ({
            employee: { id, full_name: 'E' + id, email: 'e@x.com' },
            totals: { totalHours: 0, lateMinutes: 0, lateCount: 0, absentCount: 0 },
            hourlyRate: 0,
            gross: 0,
            net: 0,
        }));

        const rows = await payrollService.getMonthlyPayroll(2025, 12, null);
        expect(rows).toHaveLength(2);
    });
});
