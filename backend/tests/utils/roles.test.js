import { describe, it, expect } from 'vitest';
import { UserRole, USER_ROLES, HR_ADMIN_ROLES, normalizeUserRole, isValidUserRole } from '../../src/shared/constants/roles.js';

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

    describe('role helpers', () => {
        it('should expose all valid roles', () => {
            expect(USER_ROLES).toEqual(['ADMIN', 'HR', 'STAFF']);
        });

        it('should expose HR/Admin role group', () => {
            expect(HR_ADMIN_ROLES).toEqual(['ADMIN', 'HR']);
        });

        it('should normalize role input to uppercase', () => {
            expect(normalizeUserRole('hr')).toBe('HR');
            expect(normalizeUserRole(' admin ')).toBe('ADMIN');
        });

        it('should default missing role to STAFF', () => {
            expect(normalizeUserRole(undefined)).toBe('STAFF');
            expect(normalizeUserRole('')).toBe('STAFF');
        });

        it('should validate only schema roles', () => {
            expect(isValidUserRole('ADMIN')).toBe(true);
            expect(isValidUserRole('HR')).toBe(true);
            expect(isValidUserRole('STAFF')).toBe(true);
            expect(isValidUserRole('MANAGER')).toBe(false);
        });
    });
});
