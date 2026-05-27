export function normalizePaginatedPayload(payload) {
  const root = payload ?? {};
  const data = root?.data ?? root;

  let items = [];
  if (Array.isArray(data?.data)) items = data.data;
  else if (Array.isArray(data?.items)) items = data.items;
  else if (Array.isArray(data?.records)) items = data.records;
  else if (Array.isArray(data?.requests)) items = data.requests;
  else if (Array.isArray(data)) items = data;

  const pagination = data?.pagination || root?.pagination || {};
  const totalPages =
    data?.pages ||
    pagination?.total_pages ||
    root?.pages ||
    root?.totalPages ||
    1;

  const page =
    data?.page ||
    pagination?.page ||
    root?.page ||
    1;

  const total =
    data?.total ||
    pagination?.total ||
    root?.total ||
    items.length;

  const limit =
    data?.pageSize ||
    data?.limit ||
    pagination?.limit ||
    root?.pageSize ||
    root?.limit ||
    items.length;

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

export async function fetchAllPaginatedItems(fetchPage, { pageSize = 200 } = {}) {
  const firstPayload = await fetchPage(1, pageSize);
  const firstPage = normalizePaginatedPayload(firstPayload);
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
    ...remainingPages.flatMap((payload) => normalizePaginatedPayload(payload).items),
  ];
}
