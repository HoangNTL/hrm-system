import { useMemo } from 'react';

export function usePagination({ page = 1, limit = 10, total = 0 } = {}) {
  return useMemo(() => {
    const totalPages = Math.max(Math.ceil(total / limit), 1);

    return {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }, [limit, page, total]);
}
