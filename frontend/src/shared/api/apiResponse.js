export function unwrapResponseData(response) {
  return response?.data ?? response;
}

export function normalizeSingleResponse(response) {
  return unwrapResponseData(response);
}

export function unwrapPaginatedData(response) {
  const payload = unwrapResponseData(response) || {};

  return {
    items: payload.items || [],
    pagination: payload.pagination || {},
  };
}

export function normalizeApiError(error) {
  const payload = error?.response?.data || error || {};

  return {
    message: payload.message || error?.message || 'Request failed',
    status: payload.status || error?.response?.status || error?.status || 500,
    errors: payload.errors || null,
    raw: error,
  };
}
