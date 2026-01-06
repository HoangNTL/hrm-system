import { describe, it, expect } from 'vitest';
import ApiError from '../../src/utils/ApiError.js';

describe('ApiError utility', () => {
    describe('constructor', () => {
        it('should create error with status and message', () => {
            const error = new ApiError(400, 'Bad request');

            expect(error).toBeInstanceOf(Error);
            expect(error).toBeInstanceOf(ApiError);
            expect(error.status).toBe(400);
            expect(error.message).toBe('Bad request');
        });

        it('should create 404 error', () => {
            const error = new ApiError(404, 'Not found');

            expect(error.status).toBe(404);
            expect(error.message).toBe('Not found');
        });

        it('should create 401 error', () => {
            const error = new ApiError(401, 'Unauthorized');

            expect(error.status).toBe(401);
            expect(error.message).toBe('Unauthorized');
        });

        it('should create 403 error', () => {
            const error = new ApiError(403, 'Forbidden');

            expect(error.status).toBe(403);
            expect(error.message).toBe('Forbidden');
        });

        it('should create 500 error', () => {
            const error = new ApiError(500, 'Internal server error');

            expect(error.status).toBe(500);
            expect(error.message).toBe('Internal server error');
        });
    });

    describe('error properties', () => {
        it('should have name property as Error (default from Error class)', () => {
            const error = new ApiError(400, 'Test');
            expect(error.name).toBe('Error');
        });

        it('should have isOperational property set to true', () => {
            const error = new ApiError(400, 'Test');
            expect(error.isOperational).toBe(true);
        });

        it('should be throwable', () => {
            expect(() => {
                throw new ApiError(400, 'Test error');
            }).toThrow(ApiError);
        });

        it('should be catchable and have correct properties', () => {
            try {
                throw new ApiError(422, 'Validation failed');
            } catch (error) {
                expect(error.status).toBe(422);
                expect(error.message).toBe('Validation failed');
            }
        });

        it('should have stack trace', () => {
            const error = new ApiError(400, 'Test');
            expect(error.stack).toBeDefined();
        });
    });

    describe('errors property', () => {
        it('should create error with errors object if provided', () => {
            const errors = { field: 'email', message: 'Invalid email' };
            const error = new ApiError(400, 'Bad request', errors);

            expect(error.errors).toEqual(errors);
        });

        it('should have null errors if not provided', () => {
            const error = new ApiError(400, 'Bad request');

            expect(error.errors).toBeNull();
        });

        it('should handle array of errors', () => {
            const errors = [
                { field: 'email', message: 'Invalid' },
                { field: 'password', message: 'Too short' },
            ];
            const error = new ApiError(400, 'Validation failed', errors);

            expect(error.errors).toEqual(errors);
        });
    });

    describe('instanceof checks', () => {
        it('should pass instanceof Error check', () => {
            const error = new ApiError(400, 'Test');
            expect(error instanceof Error).toBe(true);
        });

        it('should pass instanceof ApiError check', () => {
            const error = new ApiError(400, 'Test');
            expect(error instanceof ApiError).toBe(true);
        });

        it('should not pass instanceof other error types', () => {
            const error = new ApiError(400, 'Test');
            expect(error instanceof TypeError).toBe(false);
            expect(error instanceof RangeError).toBe(false);
        });
    });
});
