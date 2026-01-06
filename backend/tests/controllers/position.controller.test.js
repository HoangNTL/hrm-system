import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock position service
vi.mock('../../src/services/position.service.js', () => ({
    positionService: {
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

import { positionService } from '../../src/services/position.service.js';
import response from '../../src/utils/response.js';
import {
    getPositions,
    getPositionById,
    createPosition,
    updatePosition,
    deletePosition,
} from '../../src/controllers/position.controller.js';
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

describe('Position Controller', () => {
    describe('getPositions', () => {
        it('should get all positions with pagination', async () => {
            const req = mockRequest({ search: 'Manager', page: '1', limit: '10' });
            const res = mockResponse();

            const serviceResult = {
                data: [
                    { id: 1, name: 'Manager', status: 'active' },
                    { id: 2, name: 'Senior Manager', status: 'active' },
                ],
                pagination: { total: 2, page: 1, limit: 10 },
            };

            positionService.getAll.mockResolvedValue(serviceResult);

            await getPositions(req, res, mockNext);

            expect(positionService.getAll).toHaveBeenCalledWith({
                search: 'Manager',
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
            positionService.getAll.mockResolvedValue(serviceResult);

            await getPositions(req, res, mockNext);

            expect(positionService.getAll).toHaveBeenCalled();
            expect(response.success).toHaveBeenCalled();
        });

        it('should call next with error when service fails', async () => {
            const req = mockRequest({});
            const res = mockResponse();

            const error = new Error('Database error');
            positionService.getAll.mockRejectedValue(error);

            await getPositions(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('getPositionById', () => {
        it('should get position by id successfully', async () => {
            const req = mockRequest({}, {}, { id: '1' });
            const res = mockResponse();

            const position = { id: 1, name: 'Manager', description: 'Manager role', status: 'active' };
            positionService.getById.mockResolvedValue(position);

            await getPositionById(req, res, mockNext);

            expect(positionService.getById).toHaveBeenCalledWith(1);
            expect(response.success).toHaveBeenCalledWith(res, { position }, 'Success', 200);
        });

        it('should return fail response for invalid position id', async () => {
            const req = mockRequest({}, {}, { id: 'invalid' });
            const res = mockResponse();

            await getPositionById(req, res, mockNext);

            expect(response.fail).toHaveBeenCalledWith(res, 400, 'Invalid position id');
            expect(positionService.getById).not.toHaveBeenCalled();
        });

        it('should return fail response for negative id', async () => {
            const req = mockRequest({}, {}, { id: '-1' });
            const res = mockResponse();

            await getPositionById(req, res, mockNext);

            expect(response.fail).toHaveBeenCalledWith(res, 400, 'Invalid position id');
        });

        it('should return fail response for zero id', async () => {
            const req = mockRequest({}, {}, { id: '0' });
            const res = mockResponse();

            await getPositionById(req, res, mockNext);

            expect(response.fail).toHaveBeenCalledWith(res, 400, 'Invalid position id');
        });

        it('should call next with error when position not found', async () => {
            const req = mockRequest({}, {}, { id: '999' });
            const res = mockResponse();

            const error = new ApiError(ERROR_CODES.NOT_FOUND, 'Position not found');
            positionService.getById.mockRejectedValue(error);

            await getPositionById(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('createPosition', () => {
        it('should create position successfully', async () => {
            const req = mockRequest({}, {
                name: 'New Position',
                description: 'A new position',
                status: 'active',
            });
            const res = mockResponse();

            const createdPosition = {
                id: 1,
                name: 'New Position',
                description: 'A new position',
                status: 'active',
            };

            positionService.create.mockResolvedValue(createdPosition);

            await createPosition(req, res, mockNext);

            expect(positionService.create).toHaveBeenCalledWith({
                name: 'New Position',
                description: 'A new position',
                status: 'active',
            });
            expect(response.success).toHaveBeenCalledWith(res, { position: createdPosition }, 'Created', 201);
        });

        it('should call next with error when name already exists', async () => {
            const req = mockRequest({}, { name: 'Existing Position' });
            const res = mockResponse();

            const error = new ApiError(ERROR_CODES.CONFLICT, 'Position name already exists');
            positionService.create.mockRejectedValue(error);

            await createPosition(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });

        it('should call next with error when required fields are missing', async () => {
            const req = mockRequest({}, {});
            const res = mockResponse();

            const error = new ApiError(ERROR_CODES.BAD_REQUEST, 'Name is required');
            positionService.create.mockRejectedValue(error);

            await createPosition(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('updatePosition', () => {
        it('should update position successfully', async () => {
            const req = mockRequest({}, {
                name: 'Updated Position',
                description: 'Updated description',
                status: 'inactive',
            }, { id: '1' });
            const res = mockResponse();

            const updatedPosition = {
                id: 1,
                name: 'Updated Position',
                description: 'Updated description',
                status: 'inactive',
            };

            positionService.update.mockResolvedValue(updatedPosition);

            await updatePosition(req, res, mockNext);

            expect(positionService.update).toHaveBeenCalledWith(1, {
                name: 'Updated Position',
                description: 'Updated description',
                status: 'inactive',
            });
            expect(response.success).toHaveBeenCalledWith(res, { position: updatedPosition }, 'Updated', 200);
        });

        it('should return fail response for invalid position id', async () => {
            const req = mockRequest({}, { name: 'Test' }, { id: 'invalid' });
            const res = mockResponse();

            await updatePosition(req, res, mockNext);

            expect(response.fail).toHaveBeenCalledWith(res, 400, 'Invalid position id');
            expect(positionService.update).not.toHaveBeenCalled();
        });

        it('should return fail response for negative id', async () => {
            const req = mockRequest({}, { name: 'Test' }, { id: '-5' });
            const res = mockResponse();

            await updatePosition(req, res, mockNext);

            expect(response.fail).toHaveBeenCalledWith(res, 400, 'Invalid position id');
        });

        it('should call next with error when position not found', async () => {
            const req = mockRequest({}, { name: 'Test' }, { id: '999' });
            const res = mockResponse();

            const error = new ApiError(ERROR_CODES.NOT_FOUND, 'Position not found');
            positionService.update.mockRejectedValue(error);

            await updatePosition(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('deletePosition', () => {
        it('should delete position successfully', async () => {
            const req = mockRequest({}, {}, { id: '1' });
            const res = mockResponse();

            const deletedPosition = { id: 1, name: 'Deleted Position' };
            positionService.delete.mockResolvedValue(deletedPosition);

            await deletePosition(req, res, mockNext);

            expect(positionService.delete).toHaveBeenCalledWith(1);
            expect(response.success).toHaveBeenCalledWith(res, { position: deletedPosition }, 'Deleted', 200);
        });

        it('should return fail response for invalid position id', async () => {
            const req = mockRequest({}, {}, { id: 'abc' });
            const res = mockResponse();

            await deletePosition(req, res, mockNext);

            expect(response.fail).toHaveBeenCalledWith(res, 400, 'Invalid position id');
            expect(positionService.delete).not.toHaveBeenCalled();
        });

        it('should return fail response for zero id', async () => {
            const req = mockRequest({}, {}, { id: '0' });
            const res = mockResponse();

            await deletePosition(req, res, mockNext);

            expect(response.fail).toHaveBeenCalledWith(res, 400, 'Invalid position id');
        });

        it('should call next with error when position not found', async () => {
            const req = mockRequest({}, {}, { id: '999' });
            const res = mockResponse();

            const error = new ApiError(ERROR_CODES.NOT_FOUND, 'Position not found');
            positionService.delete.mockRejectedValue(error);

            await deletePosition(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });

        it('should call next with error when position has employees', async () => {
            const req = mockRequest({}, {}, { id: '1' });
            const res = mockResponse();

            const error = new ApiError(ERROR_CODES.CONFLICT, 'Cannot delete position with employees');
            positionService.delete.mockRejectedValue(error);

            await deletePosition(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });
});
