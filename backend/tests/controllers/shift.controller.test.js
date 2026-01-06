import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock shift service
vi.mock('../../src/services/shift.service.js', () => ({
    shiftService: {
        getAll: vi.fn(),
        getById: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    },
}));

// Mock response utility
vi.mock('../../src/utils/response.js', () => ({
    default: {
        success: vi.fn((res, data, message, status) => {
            res.status(status).json({ ok: true, status, message, data });
            return res;
        }),
        fail: vi.fn((res, status, message, errors) => {
            res.status(status).json({ ok: false, status, message, errors, data: null });
            return res;
        }),
    },
}));

// Mock sanitizeQuery
vi.mock('../../src/utils/sanitizeQuery.js', () => ({
    parsePagination: vi.fn((query) => ({
        search: query.search || '',
        page: parseInt(query.page) || 1,
        limit: parseInt(query.limit) || 10,
    })),
}));

import { shiftService } from '../../src/services/shift.service.js';
import response from '../../src/utils/response.js';
import {
    getShifts,
    getShiftById,
    createShift,
    updateShift,
    deleteShift,
} from '../../src/controllers/shift.controller.js';
import ApiError from '../../src/utils/ApiError.js';
import { ERROR_CODES } from '../../src/utils/errorCodes.js';

// Mock request, response, next
const mockRequest = (query = {}, body = {}, params = {}) => ({
    query,
    body,
    params,
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

describe('Shift Controller', () => {
    describe('getShifts', () => {
        it('should get all shifts with pagination', async () => {
            const req = mockRequest({ search: 'Morning', page: '1', limit: '10' });
            const res = mockResponse();

            const serviceResult = {
                data: [
                    { id: 1, shift_name: 'Morning Shift', start_time: '08:00', end_time: '17:00' },
                    { id: 2, shift_name: 'Night Shift', start_time: '22:00', end_time: '06:00' },
                ],
                pagination: { total: 2, page: 1, limit: 10 },
            };

            shiftService.getAll.mockResolvedValue(serviceResult);

            await getShifts(req, res, mockNext);

            expect(shiftService.getAll).toHaveBeenCalledWith({
                search: 'Morning',
                page: 1,
                limit: 10,
            });
            expect(response.success).toHaveBeenCalledWith(
                res,
                { items: serviceResult.data, pagination: serviceResult.pagination },
                'Success',
                200
            );
        });

        it('should handle empty query parameters', async () => {
            const req = mockRequest({});
            const res = mockResponse();

            const serviceResult = { data: [], pagination: { total: 0, page: 1, limit: 10 } };
            shiftService.getAll.mockResolvedValue(serviceResult);

            await getShifts(req, res, mockNext);

            expect(shiftService.getAll).toHaveBeenCalled();
            expect(response.success).toHaveBeenCalled();
        });

        it('should call next with error when service fails', async () => {
            const req = mockRequest({});
            const res = mockResponse();

            const error = new Error('Database error');
            shiftService.getAll.mockRejectedValue(error);

            await getShifts(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('getShiftById', () => {
        it('should get shift by id successfully', async () => {
            const req = mockRequest({}, {}, { id: '1' });
            const res = mockResponse();

            const shift = {
                id: 1,
                shift_name: 'Morning Shift',
                start_time: '08:00',
                end_time: '17:00',
                early_check_in_minutes: 30,
                late_checkout_minutes: 30,
            };
            shiftService.getById.mockResolvedValue(shift);

            await getShiftById(req, res, mockNext);

            expect(shiftService.getById).toHaveBeenCalledWith(1);
            expect(response.success).toHaveBeenCalledWith(res, { shift }, 'Success', 200);
        });

        it('should return fail response for invalid shift id', async () => {
            const req = mockRequest({}, {}, { id: 'invalid' });
            const res = mockResponse();

            await getShiftById(req, res, mockNext);

            expect(response.fail).toHaveBeenCalledWith(res, 400, 'Invalid shift id');
            expect(shiftService.getById).not.toHaveBeenCalled();
        });

        it('should return fail response for negative id', async () => {
            const req = mockRequest({}, {}, { id: '-1' });
            const res = mockResponse();

            await getShiftById(req, res, mockNext);

            expect(response.fail).toHaveBeenCalledWith(res, 400, 'Invalid shift id');
        });

        it('should return fail response for zero id', async () => {
            const req = mockRequest({}, {}, { id: '0' });
            const res = mockResponse();

            await getShiftById(req, res, mockNext);

            expect(response.fail).toHaveBeenCalledWith(res, 400, 'Invalid shift id');
        });

        it('should call next with error when shift not found', async () => {
            const req = mockRequest({}, {}, { id: '999' });
            const res = mockResponse();

            const error = new ApiError(ERROR_CODES.NOT_FOUND, 'Shift not found');
            shiftService.getById.mockRejectedValue(error);

            await getShiftById(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('createShift', () => {
        it('should create shift successfully', async () => {
            const req = mockRequest({}, {
                shift_name: 'New Shift',
                start_time: '09:00',
                end_time: '18:00',
                early_check_in_minutes: 30,
                late_checkout_minutes: 30,
            });
            const res = mockResponse();

            const createdShift = {
                id: 1,
                shift_name: 'New Shift',
                start_time: '09:00',
                end_time: '18:00',
                early_check_in_minutes: 30,
                late_checkout_minutes: 30,
            };

            shiftService.create.mockResolvedValue(createdShift);

            await createShift(req, res, mockNext);

            expect(shiftService.create).toHaveBeenCalledWith({
                shift_name: 'New Shift',
                start_time: '09:00',
                end_time: '18:00',
                early_check_in_minutes: 30,
                late_checkout_minutes: 30,
            });
            expect(response.success).toHaveBeenCalledWith(res, { shift: createdShift }, 'Created', 201);
        });

        it('should call next with error when shift name already exists', async () => {
            const req = mockRequest({}, { shift_name: 'Existing Shift' });
            const res = mockResponse();

            const error = new ApiError(ERROR_CODES.CONFLICT, 'Shift name already exists');
            shiftService.create.mockRejectedValue(error);

            await createShift(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });

        it('should call next with error when required fields are missing', async () => {
            const req = mockRequest({}, {});
            const res = mockResponse();

            const error = new ApiError(ERROR_CODES.BAD_REQUEST, 'Shift name is required');
            shiftService.create.mockRejectedValue(error);

            await createShift(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('updateShift', () => {
        it('should update shift successfully', async () => {
            const req = mockRequest({}, {
                shift_name: 'Updated Shift',
                start_time: '10:00',
                end_time: '19:00',
                early_check_in_minutes: 15,
                late_checkout_minutes: 15,
            }, { id: '1' });
            const res = mockResponse();

            const updatedShift = {
                id: 1,
                shift_name: 'Updated Shift',
                start_time: '10:00',
                end_time: '19:00',
                early_check_in_minutes: 15,
                late_checkout_minutes: 15,
            };

            shiftService.update.mockResolvedValue(updatedShift);

            await updateShift(req, res, mockNext);

            expect(shiftService.update).toHaveBeenCalledWith(1, {
                shift_name: 'Updated Shift',
                start_time: '10:00',
                end_time: '19:00',
                early_check_in_minutes: 15,
                late_checkout_minutes: 15,
            });
            expect(response.success).toHaveBeenCalledWith(res, { shift: updatedShift }, 'Updated', 200);
        });

        it('should return fail response for invalid shift id', async () => {
            const req = mockRequest({}, { shift_name: 'Test' }, { id: 'invalid' });
            const res = mockResponse();

            await updateShift(req, res, mockNext);

            expect(response.fail).toHaveBeenCalledWith(res, 400, 'Invalid shift id');
            expect(shiftService.update).not.toHaveBeenCalled();
        });

        it('should return fail response for negative id', async () => {
            const req = mockRequest({}, { shift_name: 'Test' }, { id: '-5' });
            const res = mockResponse();

            await updateShift(req, res, mockNext);

            expect(response.fail).toHaveBeenCalledWith(res, 400, 'Invalid shift id');
        });

        it('should call next with error when shift not found', async () => {
            const req = mockRequest({}, { shift_name: 'Test' }, { id: '999' });
            const res = mockResponse();

            const error = new ApiError(ERROR_CODES.NOT_FOUND, 'Shift not found');
            shiftService.update.mockRejectedValue(error);

            await updateShift(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('deleteShift', () => {
        it('should delete shift successfully', async () => {
            const req = mockRequest({}, {}, { id: '1' });
            const res = mockResponse();

            const deletedShift = { id: 1, shift_name: 'Deleted Shift' };
            shiftService.delete.mockResolvedValue(deletedShift);

            await deleteShift(req, res, mockNext);

            expect(shiftService.delete).toHaveBeenCalledWith(1);
            expect(response.success).toHaveBeenCalledWith(res, { shift: deletedShift }, 'Deleted', 200);
        });

        it('should return fail response for invalid shift id', async () => {
            const req = mockRequest({}, {}, { id: 'abc' });
            const res = mockResponse();

            await deleteShift(req, res, mockNext);

            expect(response.fail).toHaveBeenCalledWith(res, 400, 'Invalid shift id');
            expect(shiftService.delete).not.toHaveBeenCalled();
        });

        it('should return fail response for zero id', async () => {
            const req = mockRequest({}, {}, { id: '0' });
            const res = mockResponse();

            await deleteShift(req, res, mockNext);

            expect(response.fail).toHaveBeenCalledWith(res, 400, 'Invalid shift id');
        });

        it('should call next with error when shift not found', async () => {
            const req = mockRequest({}, {}, { id: '999' });
            const res = mockResponse();

            const error = new ApiError(ERROR_CODES.NOT_FOUND, 'Shift not found');
            shiftService.delete.mockRejectedValue(error);

            await deleteShift(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });

        it('should call next with error when shift is in use', async () => {
            const req = mockRequest({}, {}, { id: '1' });
            const res = mockResponse();

            const error = new ApiError(ERROR_CODES.CONFLICT, 'Cannot delete shift in use');
            shiftService.delete.mockRejectedValue(error);

            await deleteShift(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });
});
