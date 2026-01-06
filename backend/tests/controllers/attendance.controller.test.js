import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock attendance service
vi.mock('../../src/services/attendance.service.js', () => ({
    default: {
        checkIn: vi.fn(),
        checkOut: vi.fn(),
        getTodayAttendance: vi.fn(),
        getEmployeeShift: vi.fn(),
        validateCheckIn: vi.fn(),
        validateCheckOut: vi.fn(),
        getMonthlyWorkHours: vi.fn(),
        getAttendanceHistory: vi.fn(),
        getAllAttendances: vi.fn(),
        updateAttendance: vi.fn(),
        deleteAttendance: vi.fn(),
    },
}));

// Mock prisma
vi.mock('../../src/config/db.js', () => ({
    prisma: {
        shift: {
            findMany: vi.fn(),
        },
    },
}));

// Mock logger
vi.mock('../../src/utils/logger.js', () => ({
    default: {
        error: vi.fn(),
        info: vi.fn(),
    },
}));

import attendanceService from '../../src/services/attendance.service.js';
import { prisma } from '../../src/config/db.js';
import {
    getShifts,
    checkIn,
    checkOut,
    getTodayStatus,
    getMonthlyHours,
    getHistory,
    getAll,
    update,
    remove,
} from '../../src/controllers/attendance.controller.js';

// Mock request, response
const mockRequest = (body = {}, query = {}, params = {}, user = {}) => ({
    body,
    query,
    params,
    user,
});

const mockResponse = () => {
    const res = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
};

beforeEach(() => {
    vi.clearAllMocks();
});

describe('Attendance Controller', () => {
    describe('getShifts', () => {
        it('should get all shifts successfully', async () => {
            const req = mockRequest();
            const res = mockResponse();

            const shifts = [
                { id: 1, shift_name: 'Morning', start_time: '08:00', end_time: '17:00' },
                { id: 2, shift_name: 'Night', start_time: '22:00', end_time: '06:00' },
            ];

            prisma.shift.findMany.mockResolvedValue(shifts);

            await getShifts(req, res);

            expect(prisma.shift.findMany).toHaveBeenCalledWith({
                where: { is_deleted: false },
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: shifts,
            });
        });

        it('should return 500 on error', async () => {
            const req = mockRequest();
            const res = mockResponse();

            prisma.shift.findMany.mockRejectedValue(new Error('Database error'));

            await getShifts(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Lỗi khi lấy danh sách ca làm việc',
                error: 'Database error',
            });
        });
    });

    describe('checkIn', () => {
        it('should check in successfully', async () => {
            const req = mockRequest(
                { employeeId: 1, shiftId: 1 },
                {},
                {},
                { employee_id: 1, role: 'STAFF' }
            );
            const res = mockResponse();

            attendanceService.checkIn.mockResolvedValue({
                valid: true,
                message: 'Check-in thành công',
                status: 'on_time',
                attendance: { check_in: new Date() },
            });

            await checkIn(req, res);

            expect(attendanceService.checkIn).toHaveBeenCalledWith(1, 1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    message: 'Check-in thành công',
                })
            );
        });

        it('should return 400 when employeeId or shiftId is missing', async () => {
            const req = mockRequest({}, {}, {}, { role: 'STAFF' });
            const res = mockResponse();

            await checkIn(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Vui lòng cung cấp employeeId và shiftId',
            });
        });

        it('should return 403 when STAFF tries to check in for another employee', async () => {
            const req = mockRequest(
                { employeeId: 2, shiftId: 1 },
                {},
                {},
                { employee_id: 1, role: 'STAFF' }
            );
            const res = mockResponse();

            await checkIn(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Bạn không có quyền check-in cho nhân viên khác',
            });
        });

        it('should allow ADMIN to check in for another employee', async () => {
            const req = mockRequest(
                { employeeId: 2, shiftId: 1 },
                {},
                {},
                { employee_id: 1, role: 'ADMIN' }
            );
            const res = mockResponse();

            attendanceService.checkIn.mockResolvedValue({
                valid: true,
                message: 'Check-in thành công',
                status: 'on_time',
                attendance: { check_in: new Date() },
            });

            await checkIn(req, res);

            expect(attendanceService.checkIn).toHaveBeenCalledWith(2, 1);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should return 400 when check in validation fails', async () => {
            const req = mockRequest(
                { employeeId: 1, shiftId: 1 },
                {},
                {},
                { employee_id: 1, role: 'STAFF' }
            );
            const res = mockResponse();

            attendanceService.checkIn.mockResolvedValue({
                valid: false,
                message: 'Chưa đến giờ check-in',
                status: 'too_early',
            });

            await checkIn(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Chưa đến giờ check-in',
                status: 'too_early',
            });
        });

        it('should return 500 on service error', async () => {
            const req = mockRequest(
                { employeeId: 1, shiftId: 1 },
                {},
                {},
                { employee_id: 1, role: 'STAFF' }
            );
            const res = mockResponse();

            attendanceService.checkIn.mockRejectedValue(new Error('Service error'));

            await checkIn(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Lỗi khi check-in',
                error: 'Service error',
            });
        });

        it('should use employee_id from user when employeeId not in body', async () => {
            const req = mockRequest(
                { shiftId: 1 },
                {},
                {},
                { employee_id: 5, role: 'STAFF' }
            );
            const res = mockResponse();

            attendanceService.checkIn.mockResolvedValue({
                valid: true,
                message: 'Check-in thành công',
                status: 'on_time',
                attendance: { check_in: new Date() },
            });

            await checkIn(req, res);

            expect(attendanceService.checkIn).toHaveBeenCalledWith(5, 1);
        });
    });

    describe('checkOut', () => {
        it('should check out successfully', async () => {
            const req = mockRequest(
                { employeeId: 1, shiftId: 1 },
                {},
                {},
                { employee_id: 1, role: 'STAFF' }
            );
            const res = mockResponse();

            attendanceService.checkOut.mockResolvedValue({
                valid: true,
                message: 'Check-out thành công',
                attendance: { check_out: new Date() },
                workHours: 8,
            });

            await checkOut(req, res);

            expect(attendanceService.checkOut).toHaveBeenCalledWith(1, 1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    message: 'Check-out thành công',
                })
            );
        });

        it('should return 400 when employeeId or shiftId is missing', async () => {
            const req = mockRequest({}, {}, {}, { role: 'STAFF' });
            const res = mockResponse();

            await checkOut(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Vui lòng cung cấp employeeId và shiftId',
            });
        });

        it('should return 403 when STAFF tries to check out for another employee', async () => {
            const req = mockRequest(
                { employeeId: 2, shiftId: 1 },
                {},
                {},
                { employee_id: 1, role: 'STAFF' }
            );
            const res = mockResponse();

            await checkOut(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Bạn không có quyền check-out cho nhân viên khác',
            });
        });

        it('should return 400 when check out validation fails', async () => {
            const req = mockRequest(
                { employeeId: 1, shiftId: 1 },
                {},
                {},
                { employee_id: 1, role: 'STAFF' }
            );
            const res = mockResponse();

            attendanceService.checkOut.mockResolvedValue({
                valid: false,
                message: 'Chưa check-in',
            });

            await checkOut(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Chưa check-in',
            });
        });

        it('should return 500 on service error', async () => {
            const req = mockRequest(
                { employeeId: 1, shiftId: 1 },
                {},
                {},
                { employee_id: 1, role: 'STAFF' }
            );
            const res = mockResponse();

            attendanceService.checkOut.mockRejectedValue(new Error('Service error'));

            await checkOut(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Lỗi khi check-out',
                error: 'Service error',
            });
        });
    });

    describe('getTodayStatus', () => {
        it('should get today status successfully', async () => {
            const req = mockRequest(
                {},
                { shiftId: '1' },
                { employeeId: '1' },
                { employee_id: 1, role: 'STAFF' }
            );
            const res = mockResponse();

            const attendance = { id: 1, check_in: new Date(), check_out: null };
            const shift = { id: 1, shift_name: 'Morning', start_time: '08:00', end_time: '17:00' };

            attendanceService.getTodayAttendance.mockResolvedValue({ ...attendance, shift });
            attendanceService.validateCheckOut.mockReturnValue({ valid: true });

            await getTodayStatus(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.objectContaining({
                        attendance: expect.any(Object),
                    }),
                })
            );
        });

        it('should return 403 when STAFF tries to view another employee status', async () => {
            const req = mockRequest(
                {},
                {},
                { employeeId: '2' },
                { employee_id: 1, role: 'STAFF' }
            );
            const res = mockResponse();

            await getTodayStatus(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Bạn không có quyền xem thông tin này',
            });
        });

        it('should return 500 on service error', async () => {
            const req = mockRequest(
                {},
                {},
                { employeeId: '1' },
                { employee_id: 1, role: 'STAFF' }
            );
            const res = mockResponse();

            attendanceService.getTodayAttendance.mockRejectedValue(new Error('Service error'));

            await getTodayStatus(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('getMonthlyHours', () => {
        it('should get monthly hours successfully', async () => {
            const req = mockRequest(
                {},
                { year: '2026', month: '1' },
                {},
                { employee_id: 1 }
            );
            const res = mockResponse();

            const result = { totalHours: 160, workDays: 20 };
            attendanceService.getMonthlyWorkHours.mockResolvedValue(result);

            await getMonthlyHours(req, res);

            expect(attendanceService.getMonthlyWorkHours).toHaveBeenCalledWith(1, 2026, 1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: result,
            });
        });

        it('should return 400 when user has no employee_id', async () => {
            const req = mockRequest({}, {}, {}, {});
            const res = mockResponse();

            await getMonthlyHours(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'User không có employee_id',
            });
        });

        it('should use current year and month when not provided', async () => {
            const req = mockRequest({}, {}, {}, { employee_id: 1 });
            const res = mockResponse();

            const now = new Date();
            attendanceService.getMonthlyWorkHours.mockResolvedValue({});

            await getMonthlyHours(req, res);

            expect(attendanceService.getMonthlyWorkHours).toHaveBeenCalledWith(
                1,
                now.getFullYear(),
                now.getMonth() + 1
            );
        });
    });

    describe('getHistory', () => {
        it('should get history successfully', async () => {
            const req = mockRequest(
                {},
                { fromDate: '2026-01-01', toDate: '2026-01-31' },
                {},
                { employee_id: 1 }
            );
            const res = mockResponse();

            const attendances = [
                { id: 1, date: new Date('2026-01-01') },
                { id: 2, date: new Date('2026-01-02') },
            ];
            attendanceService.getAttendanceHistory.mockResolvedValue(attendances);

            await getHistory(req, res);

            expect(attendanceService.getAttendanceHistory).toHaveBeenCalledWith(
                1,
                expect.any(Date),
                expect.any(Date)
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: attendances,
            });
        });

        it('should return 400 when user has no employee_id', async () => {
            const req = mockRequest({}, {}, {}, {});
            const res = mockResponse();

            await getHistory(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'User không có employee_id',
            });
        });
    });

    describe('getAll', () => {
        it('should get all attendances with filters', async () => {
            const req = mockRequest(
                {},
                { employeeId: '1', status: 'present', page: '1', limit: '10' },
                {},
                {}
            );
            const res = mockResponse();

            const result = { data: [], total: 0 };
            attendanceService.getAllAttendances.mockResolvedValue(result);

            await getAll(req, res);

            expect(attendanceService.getAllAttendances).toHaveBeenCalledWith(
                expect.objectContaining({
                    employeeId: 1,
                    status: 'present',
                    skip: 0,
                    take: 10,
                })
            );
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should return 500 on service error', async () => {
            const req = mockRequest({}, {}, {}, {});
            const res = mockResponse();

            attendanceService.getAllAttendances.mockRejectedValue(new Error('Service error'));

            await getAll(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('update', () => {
        it('should update attendance successfully', async () => {
            const req = mockRequest(
                { check_in: new Date() },
                {},
                { id: '1' },
                { id: 1 }
            );
            const res = mockResponse();

            const updated = { id: 1, check_in: new Date() };
            attendanceService.updateAttendance.mockResolvedValue(updated);

            await update(req, res);

            expect(attendanceService.updateAttendance).toHaveBeenCalledWith(1, req.body);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Cập nhật chấm công thành công',
                data: updated,
            });
        });

        it('should return 400 when id is invalid', async () => {
            const req = mockRequest({}, {}, { id: 'invalid' }, { id: 1 });
            const res = mockResponse();

            await update(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'ID chấm công không hợp lệ',
            });
        });

        it('should return 500 on service error', async () => {
            const req = mockRequest({}, {}, { id: '1' }, { id: 1 });
            const res = mockResponse();

            attendanceService.updateAttendance.mockRejectedValue(new Error('Update failed'));

            await update(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('remove', () => {
        it('should remove attendance successfully', async () => {
            const req = mockRequest({}, {}, { id: '1' }, { id: 1 });
            const res = mockResponse();

            attendanceService.deleteAttendance.mockResolvedValue(true);

            await remove(req, res);

            expect(attendanceService.deleteAttendance).toHaveBeenCalledWith(1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Xóa bản ghi chấm công thành công',
            });
        });

        it('should return 400 when id is invalid', async () => {
            const req = mockRequest({}, {}, { id: 'invalid' }, { id: 1 });
            const res = mockResponse();

            await remove(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'ID chấm công không hợp lệ',
            });
        });

        it('should return 500 on service error', async () => {
            const req = mockRequest({}, {}, { id: '1' }, { id: 1 });
            const res = mockResponse();

            attendanceService.deleteAttendance.mockRejectedValue(new Error('Delete failed'));

            await remove(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });
});
