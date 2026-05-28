import { unwrapResponseData } from './apiResponse';

export function normalizePaginationMeta(pagination = {}, page = 1, limit = 10, totalFallback = 0) {
  return {
    page: pagination.page || page,
    limit: pagination.limit || limit,
    total: pagination.total || totalFallback,
    totalPages: pagination.total_pages || pagination.totalPages || 1,
  };
}

export function normalizePaginatedResponse(response, page = 1, limit = 10) {
  const payload = unwrapResponseData(response) || {};
  const items = payload.items || [];
  const pagination = payload.pagination || {};

  return {
    data: items,
    pagination: normalizePaginationMeta(pagination, page, limit),
  };
}

export function normalizeFlexiblePaginatedPayload(payload, page = 1, limit = 10) {
  const root = payload ?? {};
  const data = unwrapResponseData(root) || {};

  let items = [];
  if (Array.isArray(data?.data)) items = data.data;
  else if (Array.isArray(data?.items)) items = data.items;
  else if (Array.isArray(data?.records)) items = data.records;
  else if (Array.isArray(data?.requests)) items = data.requests;
  else if (Array.isArray(data)) items = data;

  const pagination = data?.pagination || root?.pagination || {};
  const normalizedPage =
    data?.page ||
    pagination?.page ||
    root?.page ||
    page;

  const normalizedLimit =
    data?.pageSize ||
    data?.limit ||
    pagination?.limit ||
    root?.pageSize ||
    root?.limit ||
    limit;

  const totalPages =
    data?.pages ||
    pagination?.total_pages ||
    pagination?.totalPages ||
    root?.pages ||
    root?.totalPages ||
    1;

  const total =
    data?.total ||
    pagination?.total ||
    root?.total ||
    items.length;

  return {
    items,
    pagination: {
      page: normalizedPage,
      limit: normalizedLimit,
      total,
      totalPages,
    },
  };
}
