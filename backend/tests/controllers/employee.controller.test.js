import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock employee service
vi.mock('../../src/services/employee.service.js', () => ({
    employeeService: {
        getAll: vi.fn(),
        getById: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        getListForSelect: vi.fn(),
        getListForSelectWithoutUser: vi.fn(),
        getListForSelectWithUser: vi.fn(),
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

import { employeeService } from '../../src/services/employee.service.js';
import response from '../../src/utils/response.js';
import {
    getEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployeesForSelect,
    getEmployeesForSelectWithoutUser,
    getEmployeesForSelectWithUser,
} from '../../src/controllers/employee.controller.js';
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

describe('Employee Controller', () => {
    describe('getEmployees', () => {
        it('should get all employees with pagination and filters', async () => {
            const req = mockRequest({
                search: 'John',
                page: '1',
                limit: '10',
                department_id: '1',
                gender: 'Male',
                work_status: 'active',
            });
            const res = mockResponse();

            const serviceResult = {
                data: [
                    { id: 1, full_name: 'John Doe', email: 'john@test.com' },
                    { id: 2, full_name: 'John Smith', email: 'johnsmith@test.com' },
                ],
                pagination: { total: 2, page: 1, limit: 10 },
            };

            employeeService.getAll.mockResolvedValue(serviceResult);

            await getEmployees(req, res, mockNext);

            expect(employeeService.getAll).toHaveBeenCalledWith({
                search: 'John',
                page: 1,
                limit: 10,
                department_id: '1',
                gender: 'Male',
                work_status: 'active',
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
            employeeService.getAll.mockResolvedValue(serviceResult);

            await getEmployees(req, res, mockNext);

            expect(employeeService.getAll).toHaveBeenCalled();
            expect(response.success).toHaveBeenCalled();
        });

        it('should call next with error when service fails', async () => {
            const req = mockRequest({});
            const res = mockResponse();

            const error = new Error('Database error');
            employeeService.getAll.mockRejectedValue(error);

            await getEmployees(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('getEmployeeById', () => {
        it('should get employee by id successfully', async () => {
            const req = mockRequest({}, {}, { id: '1' });
            const res = mockResponse();

            const employee = {
                id: 1,
                full_name: 'John Doe',
                email: 'john@test.com',
                department: { name: 'IT' },
            };
            employeeService.getById.mockResolvedValue(employee);

            await getEmployeeById(req, res, mockNext);

            expect(employeeService.getById).toHaveBeenCalledWith(1);
            expect(response.success).toHaveBeenCalledWith(res, { employee }, 'Success', 200);
        });

        it('should return fail response for invalid employee id', async () => {
            const req = mockRequest({}, {}, { id: 'invalid' });
            const res = mockResponse();

            await getEmployeeById(req, res, mockNext);

            expect(response.fail).toHaveBeenCalledWith(res, 400, 'Invalid employee id');
            expect(employeeService.getById).not.toHaveBeenCalled();
        });

        it('should return fail response for negative id', async () => {
            const req = mockRequest({}, {}, { id: '-1' });
            const res = mockResponse();

            await getEmployeeById(req, res, mockNext);

            expect(response.fail).toHaveBeenCalledWith(res, 400, 'Invalid employee id');
        });

        it('should return fail response for zero id', async () => {
            const req = mockRequest({}, {}, { id: '0' });
            const res = mockResponse();

            await getEmployeeById(req, res, mockNext);

            expect(response.fail).toHaveBeenCalledWith(res, 400, 'Invalid employee id');
        });

        it('should call next with error when employee not found', async () => {
            const req = mockRequest({}, {}, { id: '999' });
            const res = mockResponse();

            const error = new ApiError(ERROR_CODES.NOT_FOUND, 'Employee not found');
            employeeService.getById.mockRejectedValue(error);

            await getEmployeeById(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('createEmployee', () => {
        it('should create employee successfully without login account', async () => {
            const req = mockRequest({}, {
                full_name: 'New Employee',
                gender: 'Male',
                dob: '1990-01-01',
                cccd: '123456789012',
                phone: '0123456789',
                email: 'newemployee@test.com',
                address: '123 Test Street',
                department_id: 1,
                position_id: 1,
                create_login: false,
            });
            const res = mockResponse();

            const createdEmployee = {
                employee: {
                    id: 1,
                    full_name: 'New Employee',
                    email: 'newemployee@test.com',
                },
                user_account: null,
                generated_password: null,
            };

            employeeService.create.mockResolvedValue(createdEmployee);

            await createEmployee(req, res, mockNext);

            expect(employeeService.create).toHaveBeenCalledWith({
                full_name: 'New Employee',
                gender: 'Male',
                dob: '1990-01-01',
                cccd: '123456789012',
                phone: '0123456789',
                email: 'newemployee@test.com',
                address: '123 Test Street',
                department_id: 1,
                position_id: 1,
                create_login: false,
            });
            expect(response.success).toHaveBeenCalledWith(res, createdEmployee, 'Created', 201);
        });

        it('should create employee with login account', async () => {
            const req = mockRequest({}, {
                full_name: 'New Employee',
                email: 'newemployee@test.com',
                department_id: 1,
                position_id: 1,
                create_login: true,
            });
            const res = mockResponse();

            const createdEmployee = {
                employee: { id: 1, full_name: 'New Employee' },
                user_account: { id: 1, email: 'newemployee@test.com', role: 'STAFF' },
                generated_password: 'tempPassword123',
            };

            employeeService.create.mockResolvedValue(createdEmployee);

            await createEmployee(req, res, mockNext);

            expect(response.success).toHaveBeenCalledWith(res, createdEmployee, 'Created', 201);
        });

        it('should call next with error when email already exists', async () => {
            const req = mockRequest({}, { full_name: 'Test', email: 'existing@test.com' });
            const res = mockResponse();

            const error = new ApiError(ERROR_CODES.CONFLICT, 'Email already exists');
            employeeService.create.mockRejectedValue(error);

            await createEmployee(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });

        it('should call next with error when required fields are missing', async () => {
            const req = mockRequest({}, {});
            const res = mockResponse();

            const error = new ApiError(ERROR_CODES.BAD_REQUEST, 'Full name is required');
            employeeService.create.mockRejectedValue(error);

            await createEmployee(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('updateEmployee', () => {
        it('should update employee successfully', async () => {
            const req = mockRequest({}, {
                full_name: 'Updated Name',
                gender: 'Female',
                dob: '1992-05-15',
                cccd: '987654321012',
                phone: '0987654321',
                email: 'updated@test.com',
                address: 'New Address',
                department_id: 2,
                position_id: 2,
            }, { id: '1' });
            const res = mockResponse();

            const updatedEmployee = {
                id: 1,
                full_name: 'Updated Name',
                email: 'updated@test.com',
            };

            employeeService.update.mockResolvedValue(updatedEmployee);

            await updateEmployee(req, res, mockNext);

            expect(employeeService.update).toHaveBeenCalledWith(1, {
                full_name: 'Updated Name',
                gender: 'Female',
                dob: '1992-05-15',
                cccd: '987654321012',
                phone: '0987654321',
                email: 'updated@test.com',
                address: 'New Address',
                department_id: 2,
                position_id: 2,
            });
            expect(response.success).toHaveBeenCalledWith(res, { employee: updatedEmployee }, 'Updated', 200);
        });

        it('should return fail response for invalid employee id', async () => {
            const req = mockRequest({}, { full_name: 'Test' }, { id: 'invalid' });
            const res = mockResponse();

            await updateEmployee(req, res, mockNext);

            expect(response.fail).toHaveBeenCalledWith(res, 400, 'Invalid employee id');
            expect(employeeService.update).not.toHaveBeenCalled();
        });

        it('should return fail response for negative id', async () => {
            const req = mockRequest({}, { full_name: 'Test' }, { id: '-1' });
            const res = mockResponse();

            await updateEmployee(req, res, mockNext);

            expect(response.fail).toHaveBeenCalledWith(res, 400, 'Invalid employee id');
        });

        it('should call next with error when employee not found', async () => {
            const req = mockRequest({}, { full_name: 'Test' }, { id: '999' });
            const res = mockResponse();

            const error = new ApiError(ERROR_CODES.NOT_FOUND, 'Employee not found');
            employeeService.update.mockRejectedValue(error);

            await updateEmployee(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('deleteEmployee', () => {
        it('should delete employee successfully', async () => {
            const req = mockRequest({}, {}, { id: '1' });
            const res = mockResponse();

            const deletedEmployee = { id: 1, full_name: 'Deleted Employee' };
            employeeService.delete.mockResolvedValue(deletedEmployee);

            await deleteEmployee(req, res, mockNext);

            expect(employeeService.delete).toHaveBeenCalledWith(1);
            expect(response.success).toHaveBeenCalledWith(res, { employee: deletedEmployee }, 'Deleted', 200);
        });

        it('should return fail response for invalid employee id', async () => {
            const req = mockRequest({}, {}, { id: 'abc' });
            const res = mockResponse();

            await deleteEmployee(req, res, mockNext);

            expect(response.fail).toHaveBeenCalledWith(res, 400, 'Invalid employee id');
            expect(employeeService.delete).not.toHaveBeenCalled();
        });

        it('should return fail response for zero id', async () => {
            const req = mockRequest({}, {}, { id: '0' });
            const res = mockResponse();

            await deleteEmployee(req, res, mockNext);

            expect(response.fail).toHaveBeenCalledWith(res, 400, 'Invalid employee id');
        });

        it('should call next with error when employee not found', async () => {
            const req = mockRequest({}, {}, { id: '999' });
            const res = mockResponse();

            const error = new ApiError(ERROR_CODES.NOT_FOUND, 'Employee not found');
            employeeService.delete.mockRejectedValue(error);

            await deleteEmployee(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('getEmployeesForSelect', () => {
        it('should get employees list for select successfully', async () => {
            const req = mockRequest();
            const res = mockResponse();

            const employees = [
                { id: 1, full_name: 'John Doe', email: 'john@test.com' },
                { id: 2, full_name: 'Jane Doe', email: 'jane@test.com' },
            ];

            employeeService.getListForSelect.mockResolvedValue(employees);

            await getEmployeesForSelect(req, res, mockNext);

            expect(employeeService.getListForSelect).toHaveBeenCalled();
            expect(response.success).toHaveBeenCalledWith(res, { items: employees }, 'Success', 200);
        });

        it('should call next with error when service fails', async () => {
            const req = mockRequest();
            const res = mockResponse();

            const error = new Error('Database error');
            employeeService.getListForSelect.mockRejectedValue(error);

            await getEmployeesForSelect(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('getEmployeesForSelectWithoutUser', () => {
        it('should get employees without user accounts successfully', async () => {
            const req = mockRequest();
            const res = mockResponse();

            const employees = [
                { id: 3, full_name: 'No Account User', email: 'noaccount@test.com' },
            ];

            employeeService.getListForSelectWithoutUser.mockResolvedValue(employees);

            await getEmployeesForSelectWithoutUser(req, res, mockNext);

            expect(employeeService.getListForSelectWithoutUser).toHaveBeenCalled();
            expect(response.success).toHaveBeenCalledWith(res, { items: employees }, 'Success', 200);
        });

        it('should call next with error when service fails', async () => {
            const req = mockRequest();
            const res = mockResponse();

            const error = new Error('Database error');
            employeeService.getListForSelectWithoutUser.mockRejectedValue(error);

            await getEmployeesForSelectWithoutUser(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('getEmployeesForSelectWithUser', () => {
        it('should get employees with user accounts successfully', async () => {
            const req = mockRequest();
            const res = mockResponse();

            const employees = [
                { id: 1, full_name: 'With Account User', email: 'withaccount@test.com' },
            ];

            employeeService.getListForSelectWithUser.mockResolvedValue(employees);

            await getEmployeesForSelectWithUser(req, res, mockNext);

            expect(employeeService.getListForSelectWithUser).toHaveBeenCalled();
            expect(response.success).toHaveBeenCalledWith(res, { items: employees }, 'Success', 200);
        });

        it('should call next with error when service fails', async () => {
            const req = mockRequest();
            const res = mockResponse();

            const error = new Error('Database error');
            employeeService.getListForSelectWithUser.mockRejectedValue(error);

            await getEmployeesForSelectWithUser(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });
});
