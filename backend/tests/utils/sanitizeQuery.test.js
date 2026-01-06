import { describe, it, expect } from 'vitest';
import { parsePagination } from '../../src/utils/sanitizeQuery.js';

describe('sanitizeQuery - parsePagination', () => {
    describe('page parsing', () => {
        it('should parse valid page number', () => {
            const result = parsePagination({ page: '3' });
            expect(result.page).toBe(3);
        });

        it('should default to 1 when page is not provided', () => {
            const result = parsePagination({});
            expect(result.page).toBe(1);
        });

        it('should default to 1 when page is invalid string', () => {
            const result = parsePagination({ page: 'abc' });
            expect(result.page).toBe(1);
        });

        it('should default to 1 when page is 0', () => {
            const result = parsePagination({ page: '0' });
            expect(result.page).toBe(1);
        });

        it('should default to 1 when page is negative', () => {
            const result = parsePagination({ page: '-5' });
            expect(result.page).toBe(1);
        });

        it('should handle numeric page value', () => {
            const result = parsePagination({ page: 5 });
            expect(result.page).toBe(5);
        });
    });

    describe('limit parsing', () => {
        it('should parse valid limit number', () => {
            const result = parsePagination({ limit: '20' });
            expect(result.limit).toBe(20);
        });

        it('should default to 10 when limit is not provided', () => {
            const result = parsePagination({});
            expect(result.limit).toBe(10);
        });

        it('should default to 10 when limit is invalid string', () => {
            const result = parsePagination({ limit: 'xyz' });
            expect(result.limit).toBe(10);
        });

        it('should default to 10 when limit is 0', () => {
            const result = parsePagination({ limit: '0' });
            expect(result.limit).toBe(10);
        });

        it('should use Math.max of 1 when limit is negative', () => {
            const result = parsePagination({ limit: '-10' });
            // Based on implementation: Math.max(Number(-10) || 10, 1) = Math.max(-10, 1) = 1
            expect(result.limit).toBe(1);
        });

        it('should allow any positive limit (no cap)', () => {
            const result = parsePagination({ limit: '200' });
            expect(result.limit).toBe(200);
        });

        it('should handle limit of 100', () => {
            const result = parsePagination({ limit: '100' });
            expect(result.limit).toBe(100);
        });
    });

    describe('search parsing', () => {
        it('should return trimmed search string', () => {
            const result = parsePagination({ search: '  hello world  ' });
            expect(result.search).toBe('hello world');
        });

        it('should return empty string when search not provided', () => {
            const result = parsePagination({});
            expect(result.search).toBe('');
        });

        it('should return empty string when search is only whitespace', () => {
            const result = parsePagination({ search: '   ' });
            expect(result.search).toBe('');
        });

        it('should handle undefined search', () => {
            const result = parsePagination({ search: undefined });
            expect(result.search).toBe('');
        });
    });

    describe('combined parsing', () => {
        it('should parse all parameters correctly', () => {
            const result = parsePagination({
                page: '2',
                limit: '25',
                search: 'test query',
            });
            expect(result).toEqual({
                page: 2,
                limit: 25,
                search: 'test query',
            });
        });

        it('should handle all default values', () => {
            const result = parsePagination({});
            expect(result).toEqual({
                page: 1,
                limit: 10,
                search: '',
            });
        });

        it('should handle empty object', () => {
            const result = parsePagination({});
            expect(result.page).toBe(1);
            expect(result.limit).toBe(10);
            expect(result.search).toBe('');
        });
    });
});
