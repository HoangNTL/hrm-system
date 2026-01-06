import { describe, it, expect } from 'vitest';
import { UserRole } from '../../src/utils/roles.js';

describe('roles utility - UserRole', () => {
    describe('UserRole enum values', () => {
        it('should have ADMIN role', () => {
            expect(UserRole.ADMIN).toBe('ADMIN');
        });

        it('should have HR role', () => {
            expect(UserRole.HR).toBe('HR');
        });

        it('should have STAFF role', () => {
            expect(UserRole.STAFF).toBe('STAFF');
        });
    });

    describe('UserRole enum completeness', () => {
        it('should have exactly 3 roles', () => {
            const roles = Object.keys(UserRole);
            expect(roles).toHaveLength(3);
        });

        it('should contain all expected roles', () => {
            const roles = Object.values(UserRole);
            expect(roles).toContain('ADMIN');
            expect(roles).toContain('HR');
            expect(roles).toContain('STAFF');
        });

        it('should be a plain object', () => {
            expect(typeof UserRole).toBe('object');
            expect(UserRole).not.toBeNull();
        });
    });

    describe('UserRole usage patterns', () => {
        it('should allow role comparison', () => {
            const userRole = 'ADMIN';
            expect(userRole === UserRole.ADMIN).toBe(true);
        });

        it('should allow role inclusion check', () => {
            const allowedRoles = [UserRole.ADMIN, UserRole.HR];
            expect(allowedRoles.includes(UserRole.ADMIN)).toBe(true);
            expect(allowedRoles.includes(UserRole.STAFF)).toBe(false);
        });

        it('should work with Object.values', () => {
            const allRoles = Object.values(UserRole);
            expect(allRoles.includes('ADMIN')).toBe(true);
            expect(allRoles.includes('INVALID')).toBe(false);
        });
    });
});
