export { normalizeFlexiblePaginatedPayload as normalizePaginatedPayload } from '@/shared/api/pagination';

import { normalizeFlexiblePaginatedPayload } from '@/shared/api/pagination';

export async function fetchAllPaginatedItems(fetchPage, { pageSize = 200 } = {}) {
  const firstPayload = await fetchPage(1, pageSize);
  const firstPage = normalizeFlexiblePaginatedPayload(firstPayload, 1, pageSize);
  const totalPages = Math.max(firstPage.pagination.totalPages || 1, 1);

  if (totalPages === 1) {
    return firstPage.items;
  }

  const remainingPages = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      fetchPage(index + 2, pageSize),
    ),
  );

  return [
    ...firstPage.items,
    ...remainingPages.flatMap((payload, index) => (
      normalizeFlexiblePaginatedPayload(payload, index + 2, pageSize).items
    )),
  ];
}
