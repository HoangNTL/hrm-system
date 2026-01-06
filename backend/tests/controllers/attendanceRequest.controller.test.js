import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock prisma
vi.mock('../../src/config/db.js', () => ({
    prisma: {
        user: {
            findUnique: vi.fn(),
        },
        attendanceRequest: {
            create: vi.fn(),
            findMany: vi.fn(),
            findUnique: vi.fn(),
            update: vi.fn(),
            count: vi.fn(),
        },
        attendance: {
            findUnique: vi.fn(),
            findFirst: vi.fn(),
            update: vi.fn(),
            upsert: vi.fn(),
        },
        shift: {
            findMany: vi.fn(),
        },
    },
}));

// Mock attendance service
vi.mock('../../src/services/attendance.service.js', () => ({
    default: {
        calculateLateEarlyMinutes: vi.fn(),
    },
}));

// Mock response utility
vi.mock('../../src/utils/response.js', () => ({
    default: {
        success: vi.fn((res, data, message) => {
            res.status(200).json({ ok: true, message, data });
            return res;
        }),
        fail: vi.fn((res, status, message) => {
            res.status(status).json({ ok: false, message, data: null });
            return res;
        }),
    },
}));

import { prisma } from '../../src/config/db.js';
import response from '../../src/utils/response.js';
import {
    createRequest,
    getMyRequests,
    getAllRequests,
    approveRequest,
    rejectRequest,
    getRequest,
} from '../../src/controllers/attendanceRequest.controller.js';
import ApiError from '../../src/utils/ApiError.js';

// Mock request, response, next
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

const mockNext = vi.fn();

beforeEach(() => {
    vi.clearAllMocks();
});

describe('AttendanceRequest Controller', () => {
    describe('createRequest', () => {
        it('should create request successfully', async () => {
            const req = mockRequest(
                {
                    attendanceId: 1,
                    requestType: 'correction',
                    reason: 'Forgot to check out',
                    newCheckOut: '2026-01-07T17:00:00Z',
                },
                {},
                {},
                { id: 1, employee_id: 5 }
            );
            const res = mockResponse();

            const createdRequest = {
                id: 1,
                employee_id: 5,
                request_type: 'correction',
                status: 'pending',
                employee: { id: 5, full_name: 'John Doe', email: 'john@test.com' },
            };

            prisma.attendanceRequest.create.mockResolvedValue(createdRequest);

            await createRequest(req, res, mockNext);

            expect(prisma.attendanceRequest.create).toHaveBeenCalled();
            expect(response.success).toHaveBeenCalledWith(
                res,
                createdRequest,
                'Tạo đơn xin sửa chấm công thành công'
            );
        });

        it('should fetch employee_id from user table if not in token', async () => {
            const req = mockRequest(
                {
                    requestType: 'correction',
                    reason: 'Test reason',
                },
                {},
                {},
                { id: 1 } // no employee_id in token
            );
            const res = mockResponse();

            prisma.user.findUnique.mockResolvedValue({ employee_id: 10 });
            prisma.attendanceRequest.create.mockResolvedValue({ id: 1 });

            await createRequest(req, res, mockNext);

            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
                select: { employee_id: true },
            });
        });

        it('should call next with error when employee_id not found', async () => {
            const req = mockRequest(
                { requestType: 'correction', reason: 'Test' },
                {},
                {},
                { id: 1 }
            );
            const res = mockResponse();

            prisma.user.findUnique.mockResolvedValue({ employee_id: null });

            await createRequest(req, res, mockNext);

            expect(mockNext).toHaveBeenCalled();
            const error = mockNext.mock.calls[0][0];
            expect(error).toBeInstanceOf(ApiError);
            expect(error.status).toBe(400);
        });

        it('should call next with error when requestType or reason is missing', async () => {
            const req = mockRequest(
                { requestType: 'correction' }, // missing reason
                {},
                {},
                { id: 1, employee_id: 5 }
            );
            const res = mockResponse();

            await createRequest(req, res, mockNext);

            expect(mockNext).toHaveBeenCalled();
            const error = mockNext.mock.calls[0][0];
            expect(error.message).toContain('bắt buộc');
        });

        it('should call next with error when forgot_checkout without required fields', async () => {
            const req = mockRequest(
                {
                    requestType: 'forgot_checkout',
                    reason: 'Forgot',
                    // missing attendanceId and newCheckOut
                },
                {},
                {},
                { id: 1, employee_id: 5 }
            );
            const res = mockResponse();

            await createRequest(req, res, mockNext);

            expect(mockNext).toHaveBeenCalled();
        });
    });

    describe('getMyRequests', () => {
        it('should get my requests successfully', async () => {
            const req = mockRequest(
                {},
                { status: 'pending', page: '1', limit: '10' },
                {},
                { id: 1, employee_id: 5 }
            );
            const res = mockResponse();

            const requests = [
                { id: 1, request_type: 'correction', status: 'pending' },
                { id: 2, request_type: 'forgot_checkout', status: 'pending' },
            ];

            prisma.attendanceRequest.findMany.mockResolvedValue(requests);
            prisma.attendanceRequest.count.mockResolvedValue(2);

            await getMyRequests(req, res, mockNext);

            expect(prisma.attendanceRequest.findMany).toHaveBeenCalled();
            expect(response.success).toHaveBeenCalledWith(
                res,
                { requests, total: 2, page: 1, limit: 10 },
                'Lấy danh sách đơn thành công'
            );
        });

        it('should fetch employee_id from user table if not in token', async () => {
            const req = mockRequest({}, {}, {}, { id: 1 });
            const res = mockResponse();

            prisma.user.findUnique.mockResolvedValue({ employee_id: 10 });
            prisma.attendanceRequest.findMany.mockResolvedValue([]);
            prisma.attendanceRequest.count.mockResolvedValue(0);

            await getMyRequests(req, res, mockNext);

            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
                select: { employee_id: true },
            });
        });

        it('should call next with error when employee_id not found', async () => {
            const req = mockRequest({}, {}, {}, { id: 1 });
            const res = mockResponse();

            prisma.user.findUnique.mockResolvedValue({ employee_id: null });

            await getMyRequests(req, res, mockNext);

            expect(mockNext).toHaveBeenCalled();
            const error = mockNext.mock.calls[0][0];
            expect(error).toBeInstanceOf(ApiError);
        });
    });

    describe('getAllRequests', () => {
        it('should get all requests successfully', async () => {
            const req = mockRequest(
                {},
                { status: 'pending', page: '1', limit: '10' },
                {},
                { id: 1, role: 'HR' }
            );
            const res = mockResponse();

            const requests = [
                { id: 1, request_type: 'correction', status: 'pending', employee: { full_name: 'John' } },
            ];

            prisma.attendanceRequest.findMany.mockResolvedValue(requests);
            prisma.attendanceRequest.count.mockResolvedValue(1);

            await getAllRequests(req, res, mockNext);

            expect(prisma.attendanceRequest.findMany).toHaveBeenCalled();
            expect(response.success).toHaveBeenCalledWith(
                res,
                { requests, total: 1, page: 1, limit: 10 },
                'Lấy tất cả đơn thành công'
            );
        });

        it('should filter by employee name', async () => {
            const req = mockRequest(
                {},
                { employeeName: 'John' },
                {},
                { id: 1, role: 'ADMIN' }
            );
            const res = mockResponse();

            prisma.attendanceRequest.findMany.mockResolvedValue([]);
            prisma.attendanceRequest.count.mockResolvedValue(0);

            await getAllRequests(req, res, mockNext);

            expect(prisma.attendanceRequest.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        employee: { full_name: { contains: 'John', mode: 'insensitive' } },
                    }),
                })
            );
        });
    });

    describe('approveRequest', () => {
        it('should approve request successfully', async () => {
            const req = mockRequest(
                { notes: 'Approved' },
                {},
                { id: '1' },
                { id: 1, role: 'HR' }
            );
            const res = mockResponse();

            const pendingRequest = {
                id: 1,
                status: 'pending',
                employee_id: 5,
                new_check_in: null,
                new_check_out: null,
                attendance_id: null,
                employee: { full_name: 'John' },
            };

            const approvedRequest = {
                ...pendingRequest,
                status: 'approved',
                reviewed_by: 1,
            };

            prisma.attendanceRequest.findUnique.mockResolvedValue(pendingRequest);
            prisma.attendanceRequest.update.mockResolvedValue(approvedRequest);

            await approveRequest(req, res, mockNext);

            expect(prisma.attendanceRequest.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: 1 },
                    data: expect.objectContaining({
                        status: 'approved',
                        reviewed_by: 1,
                    }),
                })
            );
            expect(response.success).toHaveBeenCalledWith(res, approvedRequest, 'Duyệt đơn thành công');
        });

        it('should call next with error when request not found', async () => {
            const req = mockRequest({}, {}, { id: '999' }, { id: 1 });
            const res = mockResponse();

            prisma.attendanceRequest.findUnique.mockResolvedValue(null);

            await approveRequest(req, res, mockNext);

            expect(mockNext).toHaveBeenCalled();
            const error = mockNext.mock.calls[0][0];
            expect(error).toBeInstanceOf(ApiError);
            expect(error.status).toBe(404);
        });

        it('should call next with error when request is not pending', async () => {
            const req = mockRequest({}, {}, { id: '1' }, { id: 1 });
            const res = mockResponse();

            prisma.attendanceRequest.findUnique.mockResolvedValue({
                id: 1,
                status: 'approved', // not pending
            });

            await approveRequest(req, res, mockNext);

            expect(mockNext).toHaveBeenCalled();
            const error = mockNext.mock.calls[0][0];
            expect(error.status).toBe(400);
        });
    });

    describe('rejectRequest', () => {
        it('should reject request successfully', async () => {
            const req = mockRequest(
                { notes: 'Invalid request' },
                {},
                { id: '1' },
                { id: 1, role: 'HR' }
            );
            const res = mockResponse();

            const pendingRequest = { id: 1, status: 'pending' };
            const rejectedRequest = {
                ...pendingRequest,
                status: 'rejected',
                reviewed_by: 1,
                notes: 'Invalid request',
            };

            prisma.attendanceRequest.findUnique.mockResolvedValue(pendingRequest);
            prisma.attendanceRequest.update.mockResolvedValue(rejectedRequest);

            await rejectRequest(req, res, mockNext);

            expect(prisma.attendanceRequest.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: 1 },
                    data: expect.objectContaining({
                        status: 'rejected',
                        reviewed_by: 1,
                    }),
                })
            );
            expect(response.success).toHaveBeenCalledWith(res, rejectedRequest, 'Từ chối đơn thành công');
        });

        it('should call next with error when request not found', async () => {
            const req = mockRequest({}, {}, { id: '999' }, { id: 1 });
            const res = mockResponse();

            prisma.attendanceRequest.findUnique.mockResolvedValue(null);

            await rejectRequest(req, res, mockNext);

            expect(mockNext).toHaveBeenCalled();
            const error = mockNext.mock.calls[0][0];
            expect(error.status).toBe(404);
        });

        it('should call next with error when request is not pending', async () => {
            const req = mockRequest({}, {}, { id: '1' }, { id: 1 });
            const res = mockResponse();

            prisma.attendanceRequest.findUnique.mockResolvedValue({
                id: 1,
                status: 'rejected', // not pending
            });

            await rejectRequest(req, res, mockNext);

            expect(mockNext).toHaveBeenCalled();
            const error = mockNext.mock.calls[0][0];
            expect(error.status).toBe(400);
        });
    });

    describe('getRequest', () => {
        it('should get request by id successfully', async () => {
            const req = mockRequest({}, {}, { id: '1' }, { id: 1 });
            const res = mockResponse();

            const request = {
                id: 1,
                request_type: 'correction',
                status: 'pending',
                employee: { full_name: 'John', email: 'john@test.com' },
            };

            prisma.attendanceRequest.findUnique.mockResolvedValue(request);

            await getRequest(req, res, mockNext);

            expect(prisma.attendanceRequest.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
                include: expect.any(Object),
            });
            expect(response.success).toHaveBeenCalledWith(res, request, 'Lấy chi tiết đơn thành công');
        });

        it('should call next with error when request not found', async () => {
            const req = mockRequest({}, {}, { id: '999' }, { id: 1 });
            const res = mockResponse();

            prisma.attendanceRequest.findUnique.mockResolvedValue(null);

            await getRequest(req, res, mockNext);

            expect(mockNext).toHaveBeenCalled();
            const error = mockNext.mock.calls[0][0];
            expect(error).toBeInstanceOf(ApiError);
            expect(error.status).toBe(404);
        });
    });
});
