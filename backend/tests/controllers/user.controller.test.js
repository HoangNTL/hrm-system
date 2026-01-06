import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock user service
vi.mock('../../src/services/user.service.js', () => ({
    userService: {
        getAll: vi.fn(),
        create: vi.fn(),
        resetPassword: vi.fn(),
        toggleLock: vi.fn(),
        getStats: vi.fn(),
        bulkDelete: vi.fn(),
        getCurrentProfile: vi.fn(),
        updateCurrentProfile: vi.fn(),
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

import { userService } from '../../src/services/user.service.js';
import response from '../../src/utils/response.js';
import {
    getUsers,
    createUser,
    resetPassword,
    toggleLock,
    getUserStats,
    bulkDeleteUsers,
    getCurrentUser,
    updateCurrentUser,
} from '../../src/controllers/user.controller.js';
import ApiError from '../../src/utils/ApiError.js';
import { ERROR_CODES } from '../../src/utils/errorCodes.js';

// Mock request, response, next
const mockRequest = (query = {}, body = {}, params = {}, user = null) => ({
    query,
    body,
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

describe('User Controller', () => {
    describe('getUsers', () => {
        it('should get all users with pagination', async () => {
            const req = mockRequest({ search: 'test', page: '1', limit: '10', role: 'ADMIN', status: 'active' });
            const res = mockResponse();

            const serviceResult = {
                data: [
                    { id: 1, email: 'admin@test.com', role: 'ADMIN' },
                    { id: 2, email: 'user@test.com', role: 'STAFF' },
                ],
                pagination: { total: 2, page: 1, limit: 10 },
            };

            userService.getAll.mockResolvedValue(serviceResult);

            await getUsers(req, res, mockNext);

            expect(userService.getAll).toHaveBeenCalledWith({
                search: 'test',
                role: 'ADMIN',
                status: 'active',
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
            userService.getAll.mockResolvedValue(serviceResult);

            await getUsers(req, res, mockNext);

            expect(userService.getAll).toHaveBeenCalled();
            expect(response.success).toHaveBeenCalled();
        });

        it('should call next with error when service fails', async () => {
            const req = mockRequest({});
            const res = mockResponse();

            const error = new Error('Database error');
            userService.getAll.mockRejectedValue(error);

            await getUsers(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('createUser', () => {
        it('should create user successfully', async () => {
            const req = mockRequest({}, {
                email: 'newuser@test.com',
                role: 'STAFF',
                employee_id: 1,
                password: 'password123',
            });
            const res = mockResponse();

            const createdUser = {
                id: 1,
                email: 'newuser@test.com',
                role: 'STAFF',
                employee_id: 1,
            };

            userService.create.mockResolvedValue(createdUser);

            await createUser(req, res, mockNext);

            expect(userService.create).toHaveBeenCalledWith({
                email: 'newuser@test.com',
                role: 'STAFF',
                employee_id: 1,
                password: 'password123',
            });
            expect(response.success).toHaveBeenCalledWith(res, createdUser, 'Created', 201);
        });

        it('should call next with error when email already exists', async () => {
            const req = mockRequest({}, { email: 'existing@test.com', role: 'STAFF' });
            const res = mockResponse();

            const error = new ApiError(ERROR_CODES.CONFLICT, 'Email already exists');
            userService.create.mockRejectedValue(error);

            await createUser(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('resetPassword', () => {
        it('should reset password successfully', async () => {
            const req = mockRequest({}, {}, { id: '1' });
            const res = mockResponse();

            const result = { message: 'Password reset', newPassword: 'tempPassword123' };
            userService.resetPassword.mockResolvedValue(result);

            await resetPassword(req, res, mockNext);

            expect(userService.resetPassword).toHaveBeenCalledWith(1);
            expect(response.success).toHaveBeenCalledWith(res, result, 'Password reset successfully', 200);
        });

        it('should return fail response for invalid user id', async () => {
            const req = mockRequest({}, {}, { id: 'invalid' });
            const res = mockResponse();

            await resetPassword(req, res, mockNext);

            expect(response.fail).toHaveBeenCalledWith(res, 400, 'Invalid user id');
            expect(userService.resetPassword).not.toHaveBeenCalled();
        });

        it('should return fail response for negative user id', async () => {
            const req = mockRequest({}, {}, { id: '-1' });
            const res = mockResponse();

            await resetPassword(req, res, mockNext);

            expect(response.fail).toHaveBeenCalledWith(res, 400, 'Invalid user id');
        });

        it('should return fail response for zero user id', async () => {
            const req = mockRequest({}, {}, { id: '0' });
            const res = mockResponse();

            await resetPassword(req, res, mockNext);

            expect(response.fail).toHaveBeenCalledWith(res, 400, 'Invalid user id');
        });

        it('should call next with error when user not found', async () => {
            const req = mockRequest({}, {}, { id: '999' });
            const res = mockResponse();

            const error = new ApiError(ERROR_CODES.NOT_FOUND, 'User not found');
            userService.resetPassword.mockRejectedValue(error);

            await resetPassword(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('toggleLock', () => {
        it('should toggle lock status successfully', async () => {
            const req = mockRequest({}, {}, { id: '1' });
            const res = mockResponse();

            const user = { id: 1, email: 'test@test.com', is_locked: true };
            userService.toggleLock.mockResolvedValue(user);

            await toggleLock(req, res, mockNext);

            expect(userService.toggleLock).toHaveBeenCalledWith(1);
            expect(response.success).toHaveBeenCalledWith(res, { user }, 'User lock status updated', 200);
        });

        it('should return fail response for invalid user id', async () => {
            const req = mockRequest({}, {}, { id: 'abc' });
            const res = mockResponse();

            await toggleLock(req, res, mockNext);

            expect(response.fail).toHaveBeenCalledWith(res, 400, 'Invalid user id');
        });

        it('should call next with error when user not found', async () => {
            const req = mockRequest({}, {}, { id: '999' });
            const res = mockResponse();

            const error = new ApiError(ERROR_CODES.NOT_FOUND, 'User not found');
            userService.toggleLock.mockRejectedValue(error);

            await toggleLock(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('getUserStats', () => {
        it('should get user statistics successfully', async () => {
            const req = mockRequest();
            const res = mockResponse();

            const stats = {
                total: 100,
                active: 80,
                locked: 20,
                byRole: { ADMIN: 5, HR: 10, STAFF: 85 },
            };

            userService.getStats.mockResolvedValue(stats);

            await getUserStats(req, res, mockNext);

            expect(userService.getStats).toHaveBeenCalled();
            expect(response.success).toHaveBeenCalledWith(res, stats, 'Success', 200);
        });

        it('should call next with error when service fails', async () => {
            const req = mockRequest();
            const res = mockResponse();

            const error = new Error('Database error');
            userService.getStats.mockRejectedValue(error);

            await getUserStats(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('bulkDeleteUsers', () => {
        it('should bulk delete users successfully', async () => {
            const req = mockRequest({}, { ids: [1, 2, 3] });
            const res = mockResponse();

            const result = { deletedCount: 3 };
            userService.bulkDelete.mockResolvedValue(result);

            await bulkDeleteUsers(req, res, mockNext);

            expect(userService.bulkDelete).toHaveBeenCalledWith([1, 2, 3]);
            expect(response.success).toHaveBeenCalledWith(res, result, 'Users deleted successfully', 200);
        });

        it('should call next with error when ids are invalid', async () => {
            const req = mockRequest({}, { ids: [] });
            const res = mockResponse();

            const error = new ApiError(ERROR_CODES.BAD_REQUEST, 'No ids provided');
            userService.bulkDelete.mockRejectedValue(error);

            await bulkDeleteUsers(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('getCurrentUser', () => {
        it('should get current user profile successfully', async () => {
            const req = mockRequest({}, {}, {}, { id: 1 });
            const res = mockResponse();

            const profile = {
                id: 1,
                email: 'test@test.com',
                employee: { full_name: 'Test User', phone: '0123456789' },
            };

            userService.getCurrentProfile.mockResolvedValue(profile);

            await getCurrentUser(req, res, mockNext);

            expect(userService.getCurrentProfile).toHaveBeenCalledWith(1);
            expect(response.success).toHaveBeenCalledWith(res, profile, 'Success', 200);
        });

        it('should throw error when user is not authenticated', async () => {
            const req = mockRequest({}, {}, {}, null);
            const res = mockResponse();

            await getCurrentUser(req, res, mockNext);

            expect(mockNext).toHaveBeenCalled();
            const error = mockNext.mock.calls[0][0];
            expect(error).toBeInstanceOf(ApiError);
            expect(error.status).toBe(ERROR_CODES.UNAUTHORIZED);
        });

        it('should throw error when user id is undefined', async () => {
            const req = mockRequest({}, {}, {}, {});
            const res = mockResponse();

            await getCurrentUser(req, res, mockNext);

            expect(mockNext).toHaveBeenCalled();
            const error = mockNext.mock.calls[0][0];
            expect(error).toBeInstanceOf(ApiError);
        });
    });

    describe('updateCurrentUser', () => {
        it('should update current user profile successfully', async () => {
            const req = mockRequest(
                {},
                {
                    full_name: 'Updated Name',
                    phone: '0987654321',
                    address: 'New Address',
                    gender: 'Male',
                    dob: '1990-01-01',
                },
                {},
                { id: 1 }
            );
            const res = mockResponse();

            const updatedProfile = {
                id: 1,
                email: 'test@test.com',
                employee: {
                    full_name: 'Updated Name',
                    phone: '0987654321',
                    address: 'New Address',
                },
            };

            userService.updateCurrentProfile.mockResolvedValue(updatedProfile);

            await updateCurrentUser(req, res, mockNext);

            expect(userService.updateCurrentProfile).toHaveBeenCalledWith(1, {
                full_name: 'Updated Name',
                phone: '0987654321',
                address: 'New Address',
                gender: 'Male',
                dob: '1990-01-01',
            });
            expect(response.success).toHaveBeenCalledWith(res, updatedProfile, 'Profile updated', 200);
        });

        it('should throw error when user is not authenticated', async () => {
            const req = mockRequest({}, { full_name: 'Test' }, {}, null);
            const res = mockResponse();

            await updateCurrentUser(req, res, mockNext);

            expect(mockNext).toHaveBeenCalled();
            const error = mockNext.mock.calls[0][0];
            expect(error).toBeInstanceOf(ApiError);
            expect(error.status).toBe(ERROR_CODES.UNAUTHORIZED);
        });

        it('should call next with error when update fails', async () => {
            const req = mockRequest({}, { full_name: 'Test' }, {}, { id: 1 });
            const res = mockResponse();

            const error = new Error('Update failed');
            userService.updateCurrentProfile.mockRejectedValue(error);

            await updateCurrentUser(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });
});
