import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock department service
vi.mock('../../src/services/department.service.js', () => ({
    departmentService: {
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

import { departmentService } from '../../src/services/department.service.js';
import response from '../../src/utils/response.js';
import {
    getDepartments,
    getDepartmentById,
    createDepartment,
    updateDepartment,
    deleteDepartment,
} from '../../src/controllers/department.controller.js';
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

describe('Department Controller', () => {
    describe('getDepartments', () => {
        it('should get all departments with pagination', async () => {
            const req = mockRequest({ search: 'IT', page: '1', limit: '10' });
            const res = mockResponse();

            const serviceResult = {
                data: [
                    { id: 1, name: 'IT Department', code: 'IT' },
                    { id: 2, name: 'HR Department', code: 'HR' },
                ],
                pagination: { total: 2, page: 1, limit: 10 },
            };

            departmentService.getAll.mockResolvedValue(serviceResult);

            await getDepartments(req, res, mockNext);

            expect(departmentService.getAll).toHaveBeenCalledWith({
                search: 'IT',
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
            departmentService.getAll.mockResolvedValue(serviceResult);

            await getDepartments(req, res, mockNext);

            expect(departmentService.getAll).toHaveBeenCalled();
            expect(response.success).toHaveBeenCalled();
        });

        it('should call next with error when service fails', async () => {
            const req = mockRequest({});
            const res = mockResponse();

            const error = new Error('Database error');
            departmentService.getAll.mockRejectedValue(error);

            await getDepartments(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('getDepartmentById', () => {
        it('should get department by id successfully', async () => {
            const req = mockRequest({}, {}, { id: '1' });
            const res = mockResponse();

            const department = { id: 1, name: 'IT Department', code: 'IT', status: 'active' };
            departmentService.getById.mockResolvedValue(department);

            await getDepartmentById(req, res, mockNext);

            expect(departmentService.getById).toHaveBeenCalledWith(1);
            expect(response.success).toHaveBeenCalledWith(res, { department }, 'Success', 200);
        });

        it('should return fail response for invalid department id', async () => {
            const req = mockRequest({}, {}, { id: 'invalid' });
            const res = mockResponse();

            await getDepartmentById(req, res, mockNext);

            expect(response.fail).toHaveBeenCalledWith(res, 400, 'Invalid department id');
            expect(departmentService.getById).not.toHaveBeenCalled();
        });

        it('should return fail response for negative id', async () => {
            const req = mockRequest({}, {}, { id: '-1' });
            const res = mockResponse();

            await getDepartmentById(req, res, mockNext);

            expect(response.fail).toHaveBeenCalledWith(res, 400, 'Invalid department id');
        });

        it('should return fail response for zero id', async () => {
            const req = mockRequest({}, {}, { id: '0' });
            const res = mockResponse();

            await getDepartmentById(req, res, mockNext);

            expect(response.fail).toHaveBeenCalledWith(res, 400, 'Invalid department id');
        });

        it('should call next with error when department not found', async () => {
            const req = mockRequest({}, {}, { id: '999' });
            const res = mockResponse();

            const error = new ApiError(ERROR_CODES.NOT_FOUND, 'Department not found');
            departmentService.getById.mockRejectedValue(error);

            await getDepartmentById(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('createDepartment', () => {
        it('should create department successfully', async () => {
            const req = mockRequest({}, {
                name: 'New Department',
                code: 'NEW',
                description: 'A new department',
                status: 'active',
            });
            const res = mockResponse();

            const createdDept = {
                id: 1,
                name: 'New Department',
                code: 'NEW',
                description: 'A new department',
                status: 'active',
            };

            departmentService.create.mockResolvedValue(createdDept);

            await createDepartment(req, res, mockNext);

            expect(departmentService.create).toHaveBeenCalledWith({
                name: 'New Department',
                code: 'NEW',
                description: 'A new department',
                status: 'active',
            });
            expect(response.success).toHaveBeenCalledWith(res, { department: createdDept }, 'Created', 201);
        });

        it('should call next with error when department code already exists', async () => {
            const req = mockRequest({}, { name: 'Test', code: 'EXISTING' });
            const res = mockResponse();

            const error = new ApiError(ERROR_CODES.CONFLICT, 'Department code already exists');
            departmentService.create.mockRejectedValue(error);

            await createDepartment(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });

        it('should call next with error when required fields are missing', async () => {
            const req = mockRequest({}, {});
            const res = mockResponse();

            const error = new ApiError(ERROR_CODES.BAD_REQUEST, 'Name is required');
            departmentService.create.mockRejectedValue(error);

            await createDepartment(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('updateDepartment', () => {
        it('should update department successfully', async () => {
            const req = mockRequest({}, {
                name: 'Updated Department',
                code: 'UPD',
                description: 'Updated description',
                status: 'inactive',
            }, { id: '1' });
            const res = mockResponse();

            const updatedDept = {
                id: 1,
                name: 'Updated Department',
                code: 'UPD',
                description: 'Updated description',
                status: 'inactive',
            };

            departmentService.update.mockResolvedValue(updatedDept);

            await updateDepartment(req, res, mockNext);

            expect(departmentService.update).toHaveBeenCalledWith(1, {
                name: 'Updated Department',
                code: 'UPD',
                description: 'Updated description',
                status: 'inactive',
            });
            expect(response.success).toHaveBeenCalledWith(res, { department: updatedDept }, 'Updated', 200);
        });

        it('should return fail response for invalid department id', async () => {
            const req = mockRequest({}, { name: 'Test' }, { id: 'invalid' });
            const res = mockResponse();

            await updateDepartment(req, res, mockNext);

            expect(response.fail).toHaveBeenCalledWith(res, 400, 'Invalid department id');
            expect(departmentService.update).not.toHaveBeenCalled();
        });

        it('should return fail response for negative id', async () => {
            const req = mockRequest({}, { name: 'Test' }, { id: '-5' });
            const res = mockResponse();

            await updateDepartment(req, res, mockNext);

            expect(response.fail).toHaveBeenCalledWith(res, 400, 'Invalid department id');
        });

        it('should call next with error when department not found', async () => {
            const req = mockRequest({}, { name: 'Test' }, { id: '999' });
            const res = mockResponse();

            const error = new ApiError(ERROR_CODES.NOT_FOUND, 'Department not found');
            departmentService.update.mockRejectedValue(error);

            await updateDepartment(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('deleteDepartment', () => {
        it('should delete department successfully', async () => {
            const req = mockRequest({}, {}, { id: '1' });
            const res = mockResponse();

            const deletedDept = { id: 1, name: 'Deleted Department' };
            departmentService.delete.mockResolvedValue(deletedDept);

            await deleteDepartment(req, res, mockNext);

            expect(departmentService.delete).toHaveBeenCalledWith(1);
            expect(response.success).toHaveBeenCalledWith(res, { department: deletedDept }, 'Deleted', 200);
        });

        it('should return fail response for invalid department id', async () => {
            const req = mockRequest({}, {}, { id: 'abc' });
            const res = mockResponse();

            await deleteDepartment(req, res, mockNext);

            expect(response.fail).toHaveBeenCalledWith(res, 400, 'Invalid department id');
            expect(departmentService.delete).not.toHaveBeenCalled();
        });

        it('should return fail response for zero id', async () => {
            const req = mockRequest({}, {}, { id: '0' });
            const res = mockResponse();

            await deleteDepartment(req, res, mockNext);

            expect(response.fail).toHaveBeenCalledWith(res, 400, 'Invalid department id');
        });

        it('should call next with error when department not found', async () => {
            const req = mockRequest({}, {}, { id: '999' });
            const res = mockResponse();

            const error = new ApiError(ERROR_CODES.NOT_FOUND, 'Department not found');
            departmentService.delete.mockRejectedValue(error);

            await deleteDepartment(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });

        it('should call next with error when department has employees', async () => {
            const req = mockRequest({}, {}, { id: '1' });
            const res = mockResponse();

            const error = new ApiError(ERROR_CODES.CONFLICT, 'Cannot delete department with employees');
            departmentService.delete.mockRejectedValue(error);

            await deleteDepartment(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });
});
