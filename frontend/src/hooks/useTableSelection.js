import { useCallback, useMemo, useState } from 'react';

/**
 * Generic hook quản lý chọn dòng trong bảng (multi-select).
 * @param {Array} items - danh sách hiện tại trong bảng
 * @param {(item: any) => string|number} getKey - hàm lấy khóa duy nhất từ item
 */
export function useTableSelection(items, getKey) {
  const [selectedIds, setSelectedIds] = useState(() => new Set());

  // danh sách item đã chọn (sync với items mới nhất)
  const selectedItems = useMemo(
    () => items.filter((item) => selectedIds.has(getKey(item))),
    [items, selectedIds, getKey],
  );

  const isSelected = useCallback(
    (item) => selectedIds.has(getKey(item)),
    [selectedIds, getKey],
  );

  const toggleRow = useCallback(
    (item) => {
      const id = getKey(item);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
    },
    [getKey],
  );

  const toggleAll = useCallback(
    (checked) => {
      if (!checked) {
        setSelectedIds(new Set());
        return;
      }
      const next = new Set(items.map((item) => getKey(item)));
      setSelectedIds(next);
    },
    [items, getKey],
  );

  const allSelected = useMemo(
    () => items.length > 0 && items.every((item) => selectedIds.has(getKey(item))),
    [items, selectedIds, getKey],
  );

  const someSelected = useMemo(
    () => items.some((item) => selectedIds.has(getKey(item))) && !allSelected,
    [items, selectedIds, getKey, allSelected],
  );

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  return {
    selectedItems,
    isSelected,
    toggleRow,
    toggleAll,
    allSelected,
    someSelected,
    clearSelection,
  };
}
