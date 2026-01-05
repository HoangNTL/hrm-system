import { renderHook, act } from '@testing-library/react';
import { useTableSelection } from '../useTableSelection';

const items = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
    { id: 3, name: 'Item 3' },
];

describe('useTableSelection', () => {
    it('toggles single row selection', () => {
        const { result } = renderHook(() => useTableSelection(items, (item) => item.id));

        act(() => {
            result.current.toggleRow(items[0]);
        });

        expect(result.current.isSelected(items[0])).toBe(true);
        expect(result.current.selectedItems).toHaveLength(1);

        act(() => {
            result.current.toggleRow(items[0]);
        });

        expect(result.current.isSelected(items[0])).toBe(false);
        expect(result.current.selectedItems).toHaveLength(0);
    });

    it('selects and clears all items', () => {
        const { result } = renderHook(() => useTableSelection(items, (item) => item.id));

        act(() => {
            result.current.toggleAll(true);
        });

        expect(result.current.selectedItems).toHaveLength(items.length);
        expect(result.current.allSelected).toBe(true);
        expect(result.current.someSelected).toBe(false);

        act(() => {
            result.current.clearSelection();
        });

        expect(result.current.selectedItems).toHaveLength(0);
        expect(result.current.allSelected).toBe(false);
        expect(result.current.someSelected).toBe(false);
    });

    it('someSelected is true when partially selected', () => {
        const { result } = renderHook(() => useTableSelection(items, (item) => item.id));

        act(() => {
            result.current.toggleRow(items[0]);
        });

        expect(result.current.allSelected).toBe(false);
        expect(result.current.someSelected).toBe(true);
    });
});
