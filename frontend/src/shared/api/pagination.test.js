import {
  normalizeFlexiblePaginatedPayload,
  normalizePaginatedResponse,
} from './pagination';
import {
  normalizeApiError,
  normalizeSingleResponse,
  unwrapPaginatedData,
} from './apiResponse';

describe('shared api normalization helpers', () => {
  it('normalizePaginatedResponse maps standard paginated payloads', () => {
    const response = {
      data: {
        items: [{ id: 1 }],
        pagination: { page: 2, limit: 5, total: 20, total_pages: 4 },
      },
    };

    expect(normalizePaginatedResponse(response, 2, 5)).toEqual({
      data: [{ id: 1 }],
      pagination: { page: 2, limit: 5, total: 20, totalPages: 4 },
    });
  });

  it('normalizeFlexiblePaginatedPayload handles non-standard collection keys', () => {
    const payload = {
      data: {
        requests: [{ id: 1 }, { id: 2 }],
        pagination: { total: 2, total_pages: 1, page: 1, limit: 10 },
      },
    };

    expect(normalizeFlexiblePaginatedPayload(payload, 1, 10)).toEqual({
      items: [{ id: 1 }, { id: 2 }],
      pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
    });
  });

  it('normalizeSingleResponse unwraps axios response data', () => {
    expect(normalizeSingleResponse({ data: { ok: true } })).toEqual({ ok: true });
  });

  it('unwrapPaginatedData returns items and pagination', () => {
    expect(unwrapPaginatedData({
      data: {
        items: [{ id: 1 }],
        pagination: { total: 1 },
      },
    })).toEqual({
      items: [{ id: 1 }],
      pagination: { total: 1 },
    });
  });

  it('normalizeApiError extracts message, status, and errors', () => {
    const error = {
      response: {
        status: 422,
        data: {
          message: 'Validation failed',
          errors: { email: ['Invalid'] },
        },
      },
    };

    expect(normalizeApiError(error)).toEqual({
      message: 'Validation failed',
      status: 422,
      errors: { email: ['Invalid'] },
      raw: error,
    });
  });
});
