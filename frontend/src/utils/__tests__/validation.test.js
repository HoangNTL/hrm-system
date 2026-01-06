import { validateLoginForm } from '../validation';

describe('validateLoginForm', () => {
    describe('email validation', () => {
        it('returns error when email is empty', () => {
            const errors = validateLoginForm({ email: '', password: 'password123' });

            expect(errors.email).toBe('Email is required');
        });

        it('returns error when email is invalid format', () => {
            const errors = validateLoginForm({ email: 'invalid-email', password: 'password123' });

            expect(errors.email).toBe('Email is invalid');
        });

        it('returns error when email has no domain', () => {
            const errors = validateLoginForm({ email: 'test@', password: 'password123' });

            expect(errors.email).toBe('Email is invalid');
        });

        it('returns error when email has no username', () => {
            const errors = validateLoginForm({ email: '@example.com', password: 'password123' });

            expect(errors.email).toBe('Email is invalid');
        });

        it('does not return error when email is valid', () => {
            const errors = validateLoginForm({ email: 'test@example.com', password: 'password123' });

            expect(errors.email).toBeUndefined();
        });

        it('accepts valid email with subdomain', () => {
            const errors = validateLoginForm({ email: 'user@mail.example.com', password: 'password123' });

            expect(errors.email).toBeUndefined();
        });
    });

    describe('password validation', () => {
        it('returns error when password is empty', () => {
            const errors = validateLoginForm({ email: 'test@example.com', password: '' });

            expect(errors.password).toBe('Password is required');
        });

        it('returns error when password is less than 6 characters', () => {
            const errors = validateLoginForm({ email: 'test@example.com', password: '12345' });

            expect(errors.password).toBe('Password must be at least 6 characters');
        });

        it('does not return error when password is exactly 6 characters', () => {
            const errors = validateLoginForm({ email: 'test@example.com', password: '123456' });

            expect(errors.password).toBeUndefined();
        });

        it('does not return error when password is more than 6 characters', () => {
            const errors = validateLoginForm({ email: 'test@example.com', password: 'password123' });

            expect(errors.password).toBeUndefined();
        });
    });

    describe('multiple validations', () => {
        it('returns both errors when email and password are empty', () => {
            const errors = validateLoginForm({ email: '', password: '' });

            expect(errors.email).toBe('Email is required');
            expect(errors.password).toBe('Password is required');
        });

        it('returns both errors when email is invalid and password is too short', () => {
            const errors = validateLoginForm({ email: 'invalid', password: '123' });

            expect(errors.email).toBe('Email is invalid');
            expect(errors.password).toBe('Password must be at least 6 characters');
        });

        it('returns empty object when all fields are valid', () => {
            const errors = validateLoginForm({ email: 'test@example.com', password: 'password123' });

            expect(errors).toEqual({});
        });

        it('handles undefined values', () => {
            const errors = validateLoginForm({ email: undefined, password: undefined });

            expect(errors.email).toBe('Email is required');
            expect(errors.password).toBe('Password is required');
        });

        it('handles null values', () => {
            const errors = validateLoginForm({ email: null, password: null });

            expect(errors.email).toBe('Email is required');
            expect(errors.password).toBe('Password is required');
        });
    });
});
