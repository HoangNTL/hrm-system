import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock payroll service
vi.mock('../../src/services/payroll.service.js', () => ({
    default: {
        getMonthlyPayroll: vi.fn(),
        getPayslip: vi.fn(),
        exportMonthlyPayroll: vi.fn(),
    },
}));

// Mock logger
vi.mock('../../src/utils/logger.js', () => ({
    default: {
        error: vi.fn(),
        info: vi.fn(),
    },
}));

import payrollService from '../../src/services/payroll.service.js';
import { getMonthly, getPayslip, exportMonthly } from '../../src/controllers/payroll.controller.js';
import { ErrorMessages } from '../../src/utils/errorMessages.js';

// Mock request, response
const mockRequest = (query = {}, user = null) => ({
    query,
    user,
});

const mockResponse = () => {
    const res = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    res.setHeader = vi.fn().mockReturnValue(res);
    res.send = vi.fn().mockReturnValue(res);
    return res;
};

beforeEach(() => {
    vi.clearAllMocks();
});

describe('Payroll Controller', () => {
    describe('getMonthly', () => {
        it('should get monthly payroll successfully with query params', async () => {
            const req = mockRequest({ year: '2026', month: '1', departmentId: '1' });
            const res = mockResponse();

            const payrollData = [
                { employee_id: 1, full_name: 'John Doe', base_salary: 15000000, total: 15000000 },
                { employee_id: 2, full_name: 'Jane Doe', base_salary: 12000000, total: 12000000 },
            ];

            payrollService.getMonthlyPayroll.mockResolvedValue(payrollData);

            await getMonthly(req, res);

            expect(payrollService.getMonthlyPayroll).toHaveBeenCalledWith(2026, 1, 1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true, data: payrollData });
        });

        it('should use current year and month when not provided', async () => {
            const req = mockRequest({});
            const res = mockResponse();

            const currentDate = new Date();
            const expectedYear = currentDate.getFullYear();
            const expectedMonth = currentDate.getMonth() + 1;

            payrollService.getMonthlyPayroll.mockResolvedValue([]);

            await getMonthly(req, res);

            expect(payrollService.getMonthlyPayroll).toHaveBeenCalledWith(expectedYear, expectedMonth, null);
        });

        it('should handle empty departmentId', async () => {
            const req = mockRequest({ year: '2026', month: '1', departmentId: '' });
            const res = mockResponse();

            payrollService.getMonthlyPayroll.mockResolvedValue([]);

            await getMonthly(req, res);

            expect(payrollService.getMonthlyPayroll).toHaveBeenCalledWith(2026, 1, null);
        });

        it('should return 500 on service error', async () => {
            const req = mockRequest({ year: '2026', month: '1' });
            const res = mockResponse();

            const error = new Error('Database error');
            payrollService.getMonthlyPayroll.mockRejectedValue(error);

            await getMonthly(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: ErrorMessages.PAYROLL.FETCH_FAILED,
            });
        });

        it('should return default error message when error has no message', async () => {
            const req = mockRequest({ year: '2026', month: '1' });
            const res = mockResponse();

            payrollService.getMonthlyPayroll.mockRejectedValue(new Error());

            await getMonthly(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: ErrorMessages.PAYROLL.FETCH_FAILED,
            });
        });
    });

    describe('getPayslip', () => {
        it('should get payslip for STAFF user using their own employee_id', async () => {
            const req = mockRequest(
                { year: '2026', month: '1' },
                { role: 'STAFF', employee_id: 5 }
            );
            const res = mockResponse();

            const payslipData = {
                employee_id: 5,
                full_name: 'Staff User',
                base_salary: 10000000,
                deductions: 500000,
                net_salary: 9500000,
            };

            payrollService.getPayslip.mockResolvedValue(payslipData);

            await getPayslip(req, res);

            expect(payrollService.getPayslip).toHaveBeenCalledWith(5, 2026, 1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true, data: payslipData });
        });

        it('should get payslip for ADMIN/HR using query employeeId', async () => {
            const req = mockRequest(
                { year: '2026', month: '1', employeeId: '10' },
                { role: 'ADMIN', employee_id: 1 }
            );
            const res = mockResponse();

            const payslipData = { employee_id: 10, full_name: 'Other Employee' };
            payrollService.getPayslip.mockResolvedValue(payslipData);

            await getPayslip(req, res);

            expect(payrollService.getPayslip).toHaveBeenCalledWith(10, 2026, 1);
        });

        it('should return 400 when employeeId is not provided for non-STAFF', async () => {
            const req = mockRequest(
                { year: '2026', month: '1' },
                { role: 'ADMIN' }
            );
            const res = mockResponse();

            await getPayslip(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'employeeId required',
            });
            expect(payrollService.getPayslip).not.toHaveBeenCalled();
        });

        it('should use current year and month when not provided', async () => {
            const req = mockRequest({}, { role: 'STAFF', employee_id: 5 });
            const res = mockResponse();

            const currentDate = new Date();
            const expectedYear = currentDate.getFullYear();
            const expectedMonth = currentDate.getMonth() + 1;

            payrollService.getPayslip.mockResolvedValue({});

            await getPayslip(req, res);

            expect(payrollService.getPayslip).toHaveBeenCalledWith(5, expectedYear, expectedMonth);
        });

        it('should return 500 on service error', async () => {
            const req = mockRequest(
                { year: '2026', month: '1' },
                { role: 'STAFF', employee_id: 5 }
            );
            const res = mockResponse();

            const error = new Error('Payslip not found');
            payrollService.getPayslip.mockRejectedValue(error);

            await getPayslip(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: ErrorMessages.PAYROLL.PAYSLIP_FAILED,
            });
        });

        it('should return default error message when error has no message', async () => {
            const req = mockRequest(
                { year: '2026', month: '1' },
                { role: 'STAFF', employee_id: 5 }
            );
            const res = mockResponse();

            payrollService.getPayslip.mockRejectedValue(new Error());

            await getPayslip(req, res);

            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: ErrorMessages.PAYROLL.PAYSLIP_FAILED,
            });
        });
    });

    describe('exportMonthly', () => {
        it('should export monthly payroll as Excel file', async () => {
            const req = mockRequest({ year: '2026', month: '1', departmentId: '1' });
            const res = mockResponse();

            const excelBuffer = Buffer.from('excel-content');
            payrollService.exportMonthlyPayroll.mockResolvedValue(excelBuffer);

            await exportMonthly(req, res);

            expect(payrollService.exportMonthlyPayroll).toHaveBeenCalledWith(2026, 1, 1);
            expect(res.setHeader).toHaveBeenCalledWith(
                'Content-Type',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            );
            expect(res.setHeader).toHaveBeenCalledWith(
                'Content-Disposition',
                'attachment; filename=Payroll_2026_01.xlsx'
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith(excelBuffer);
        });

        it('should use current year and month when not provided', async () => {
            const req = mockRequest({});
            const res = mockResponse();

            const currentDate = new Date();
            const expectedYear = currentDate.getFullYear();
            const expectedMonth = currentDate.getMonth() + 1;

            payrollService.exportMonthlyPayroll.mockResolvedValue(Buffer.from(''));

            await exportMonthly(req, res);

            expect(payrollService.exportMonthlyPayroll).toHaveBeenCalledWith(expectedYear, expectedMonth, null);
        });

        it('should handle null departmentId', async () => {
            const req = mockRequest({ year: '2026', month: '6', departmentId: '' });
            const res = mockResponse();

            payrollService.exportMonthlyPayroll.mockResolvedValue(Buffer.from(''));

            await exportMonthly(req, res);

            expect(payrollService.exportMonthlyPayroll).toHaveBeenCalledWith(2026, 6, null);
            expect(res.setHeader).toHaveBeenCalledWith(
                'Content-Disposition',
                'attachment; filename=Payroll_2026_06.xlsx'
            );
        });

        it('should return 500 on service error', async () => {
            const req = mockRequest({ year: '2026', month: '1' });
            const res = mockResponse();

            const error = new Error('Export failed');
            payrollService.exportMonthlyPayroll.mockRejectedValue(error);

            await exportMonthly(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: ErrorMessages.PAYROLL.EXPORT_FAILED,
            });
        });

        it('should return default error message when error has no message', async () => {
            const req = mockRequest({ year: '2026', month: '1' });
            const res = mockResponse();

            payrollService.exportMonthlyPayroll.mockRejectedValue(new Error());

            await exportMonthly(req, res);

            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: ErrorMessages.PAYROLL.EXPORT_FAILED,
            });
        });
    });
});
