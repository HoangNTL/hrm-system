import { handleAPIError, handleMutationError } from '../api';

describe('handleAPIError', () => {
    describe('handles HTTP status codes', () => {
        it('returns session expired message for 401 status', () => {
            const error = { status: 401 };

            expect(handleAPIError(error)).toBe('Session expired. Please login again.');
        });

        it('returns permission message for 403 status', () => {
            const error = { status: 403 };

            expect(handleAPIError(error)).toBe('You do not have permission to perform this action.');
        });

        it('returns not found message for 404 status', () => {
            const error = { status: 404 };

            expect(handleAPIError(error)).toBe('Resource not found.');
        });

        it('returns custom message for 404 with message', () => {
            const error = { status: 404, message: 'Employee not found' };

            expect(handleAPIError(error)).toBe('Employee not found');
        });

        it('returns validation message for 422 status', () => {
            const error = { status: 422 };

            expect(handleAPIError(error)).toBe('Validation error. Please check your input.');
        });

        it('returns server error message for 500 status', () => {
            const error = { status: 500 };

            expect(handleAPIError(error)).toBe('Server error. Please try again later.');
        });

        it('returns bad request message for 400 status', () => {
            const error = { status: 400 };

            expect(handleAPIError(error)).toBe('Bad request. Please check your input.');
        });

        it('returns conflict message for 409 status', () => {
            const error = { status: 409 };

            expect(handleAPIError(error)).toBe('Conflict. Resource already exists.');
        });

        it('returns rate limit message for 429 status', () => {
            const error = { status: 429 };

            expect(handleAPIError(error)).toBe('Too many requests. Please wait a moment.');
        });

        it('returns unavailable message for 502 status', () => {
            const error = { status: 502 };

            expect(handleAPIError(error)).toBe('Server is temporarily unavailable. Please try again.');
        });

        it('returns service unavailable message for 503 status', () => {
            const error = { status: 503 };

            expect(handleAPIError(error)).toBe('Service unavailable. Please try again later.');
        });

        it('returns timeout message for 504 status', () => {
            const error = { status: 504 };

            expect(handleAPIError(error)).toBe('Server timeout. Please try again.');
        });
    });

    describe('handles network errors', () => {
        it('returns timeout message for ECONNABORTED', () => {
            const error = { code: 'ECONNABORTED' };

            expect(handleAPIError(error)).toBe('Request timeout. Please try again.');
        });

        it('returns timeout message for timeout in message', () => {
            const error = { message: 'timeout of 30000ms exceeded' };

            expect(handleAPIError(error)).toBe('Request timeout. Please try again.');
        });

        it('returns network error message for network errors', () => {
            const error = { message: 'Network Error' };

            expect(handleAPIError(error)).toBe('Network error. Please check your connection.');
        });
    });

    describe('handles nested response status', () => {
        it('returns session expired message for nested 401 status', () => {
            const error = { response: { status: 401 } };

            expect(handleAPIError(error)).toBe('Session expired. Please login again.');
        });

        it('returns permission message for nested 403 status', () => {
            const error = { response: { status: 403 } };

            expect(handleAPIError(error)).toBe('You do not have permission to perform this action.');
        });

        it('returns not found message for nested 404 status', () => {
            const error = { response: { status: 404 } };

            expect(handleAPIError(error)).toBe('Resource not found.');
        });

        it('returns validation message for nested 422 status', () => {
            const error = { response: { status: 422 } };

            expect(handleAPIError(error)).toBe('Validation error. Please check your input.');
        });

        it('returns server error message for nested 500 status', () => {
            const error = { response: { status: 500 } };

            expect(handleAPIError(error)).toBe('Server error. Please try again later.');
        });
    });

    describe('handles unknown status codes', () => {
        it('returns error message when available', () => {
            const error = { status: 418, message: 'I am a teapot' };

            expect(handleAPIError(error)).toBe('I am a teapot');
        });

        it('returns default message when no message available', () => {
            const error = { status: 418 };

            expect(handleAPIError(error)).toBe('An unexpected error occurred.');
        });

        it('returns default message for unknown status without message', () => {
            const error = { status: 999 };

            expect(handleAPIError(error)).toBe('An unexpected error occurred.');
        });
    });

    describe('handles edge cases', () => {
        it('returns default message for null error', () => {
            expect(handleAPIError(null)).toBe('An unexpected error occurred.');
        });

        it('returns default message for undefined error', () => {
            expect(handleAPIError(undefined)).toBe('An unexpected error occurred.');
        });

        it('returns default message for empty object', () => {
            const error = {};

            expect(handleAPIError(error)).toBe('An unexpected error occurred.');
        });

        it('prioritizes status over message for fixed status codes', () => {
            const error = { status: 401, message: 'Custom message' };

            expect(handleAPIError(error)).toBe('Session expired. Please login again.');
        });
    });
});

describe('handleMutationError', () => {
    it('sets field errors when errors object is present', () => {
        const error = { message: 'Validation failed', errors: { email: ['Invalid email'] } };
        const setFieldErrors = vi.fn();
        const setGlobalError = vi.fn();

        handleMutationError(error, { setFieldErrors, setGlobalError });

        expect(setFieldErrors).toHaveBeenCalledWith({ email: ['Invalid email'] });
        expect(setGlobalError).toHaveBeenCalledWith('Validation failed');
    });

    it('does not set field errors when errors object is empty', () => {
        const error = { message: 'Server error', errors: {} };
        const setFieldErrors = vi.fn();
        const setGlobalError = vi.fn();

        handleMutationError(error, { setFieldErrors, setGlobalError });

        expect(setFieldErrors).not.toHaveBeenCalled();
        expect(setGlobalError).toHaveBeenCalledWith('Server error');
    });

    it('uses fallback message when error.message is empty', () => {
        const error = { status: 500 };
        const setGlobalError = vi.fn();

        handleMutationError(error, { setGlobalError, fallbackMessage: 'Failed to save' });

        expect(setGlobalError).toHaveBeenCalledWith('Failed to save');
    });

    it('uses default fallback message when none provided', () => {
        const error = {};
        const setGlobalError = vi.fn();

        handleMutationError(error, { setGlobalError });

        expect(setGlobalError).toHaveBeenCalledWith('An error occurred');
    });

    it('handles null error gracefully', () => {
        const setFieldErrors = vi.fn();
        const setGlobalError = vi.fn();

        handleMutationError(null, { setFieldErrors, setGlobalError, fallbackMessage: 'Error' });

        expect(setFieldErrors).not.toHaveBeenCalled();
        expect(setGlobalError).toHaveBeenCalledWith('Error');
    });

    it('works without setFieldErrors', () => {
        const error = { message: 'Error', errors: { name: ['Required'] } };
        const setGlobalError = vi.fn();

        handleMutationError(error, { setGlobalError });

        expect(setGlobalError).toHaveBeenCalledWith('Error');
    });

    it('works without setGlobalError', () => {
        const error = { errors: { name: ['Required'] } };
        const setFieldErrors = vi.fn();

        handleMutationError(error, { setFieldErrors });

        expect(setFieldErrors).toHaveBeenCalledWith({ name: ['Required'] });
    });

    it('returns the original error', () => {
        const error = { message: 'Test error' };

        const result = handleMutationError(error, {});

        expect(result).toBe(error);
    });
});
