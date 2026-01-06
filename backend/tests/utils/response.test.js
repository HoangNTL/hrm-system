import { describe, it, expect, vi, beforeEach } from 'vitest';
import response from '../../src/utils/response.js';

describe('response utility', () => {
    let mockRes;

    beforeEach(() => {
        mockRes = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        };
    });

    describe('success', () => {
        it('should return success response with data and message', () => {
            const data = { id: 1, name: 'Test' };
            const message = 'Success message';

            response.success(mockRes, data, message);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                ok: true,
                status: 200,
                message: message,
                data: data,
            });
        });

        it('should use default message when not provided', () => {
            const data = { id: 1 };

            response.success(mockRes, data);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                ok: true,
                status: 200,
                message: 'Success',
                data: data,
            });
        });

        it('should handle null data', () => {
            response.success(mockRes, null, 'No data');

            expect(mockRes.json).toHaveBeenCalledWith({
                ok: true,
                status: 200,
                message: 'No data',
                data: null,
            });
        });

        it('should handle array data', () => {
            const data = [{ id: 1 }, { id: 2 }];

            response.success(mockRes, data, 'List fetched');

            expect(mockRes.json).toHaveBeenCalledWith({
                ok: true,
                status: 200,
                message: 'List fetched',
                data: data,
            });
        });

        it('should handle empty object data', () => {
            response.success(mockRes, {}, 'Empty');

            expect(mockRes.json).toHaveBeenCalledWith({
                ok: true,
                status: 200,
                message: 'Empty',
                data: {},
            });
        });

        it('should return the response object for chaining', () => {
            const result = response.success(mockRes, {});
            expect(result).toBe(mockRes);
        });

        it('should allow custom status code', () => {
            response.success(mockRes, { id: 1 }, 'Created', 201);

            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith({
                ok: true,
                status: 201,
                message: 'Created',
                data: { id: 1 },
            });
        });
    });

    describe('fail', () => {
        it('should return fail response with status and message', () => {
            const status = 400;
            const message = 'Bad request';

            response.fail(mockRes, status, message);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                ok: false,
                status: 400,
                message: message,
                errors: null,
                data: null,
            });
        });

        it('should handle 404 status', () => {
            response.fail(mockRes, 404, 'Not found');

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({
                ok: false,
                status: 404,
                message: 'Not found',
                errors: null,
                data: null,
            });
        });

        it('should handle 500 status', () => {
            response.fail(mockRes, 500, 'Internal server error');

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({
                ok: false,
                status: 500,
                message: 'Internal server error',
                errors: null,
                data: null,
            });
        });

        it('should handle 401 unauthorized', () => {
            response.fail(mockRes, 401, 'Unauthorized');

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({
                ok: false,
                status: 401,
                message: 'Unauthorized',
                errors: null,
                data: null,
            });
        });

        it('should handle 403 forbidden', () => {
            response.fail(mockRes, 403, 'Forbidden');

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith({
                ok: false,
                status: 403,
                message: 'Forbidden',
                errors: null,
                data: null,
            });
        });

        it('should return the response object for chaining', () => {
            const result = response.fail(mockRes, 400, 'Error');
            expect(result).toBe(mockRes);
        });

        it('should include errors when provided', () => {
            const errors = { field: 'email', message: 'Invalid format' };

            response.fail(mockRes, 400, 'Validation failed', errors);

            expect(mockRes.json).toHaveBeenCalledWith({
                ok: false,
                status: 400,
                message: 'Validation failed',
                errors: errors,
                data: null,
            });
        });
    });
});
