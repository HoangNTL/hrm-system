export function parsePagination(query) {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.max(Number(query.limit) || 10, 1);
  const search = (query.search || '').trim();
  return { page, limit, search };
}
