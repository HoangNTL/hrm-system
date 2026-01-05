import { renderHook, act, waitFor } from '@testing-library/react';
import { useAPI } from '../useAPI';

describe('useAPI', () => {
    it('calls api function on mount and sets data on success', async () => {
        const apiFn = vi.fn().mockResolvedValue({ foo: 'bar' });

        const { result } = renderHook(() => useAPI(apiFn, []));

        // initial state
        expect(result.current.loading).toBe(true);
        expect(result.current.error).toBeNull();

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(apiFn).toHaveBeenCalledTimes(1);
        expect(result.current.data).toEqual({ foo: 'bar' });
        expect(result.current.error).toBeNull();
    });

    it('sets error when api function throws', async () => {
        const error = new Error('API failed');
        const apiFn = vi.fn().mockRejectedValue(error);

        const { result } = renderHook(() => useAPI(apiFn, []));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(apiFn).toHaveBeenCalledTimes(1);
        expect(result.current.error).toBe(error);
        expect(result.current.data).toBeNull();
    });

    it('allows manual refetch via refetch function', async () => {
        const apiFn = vi.fn().mockResolvedValueOnce({ foo: 'bar' }).mockResolvedValueOnce({ foo: 'baz' });

        const { result } = renderHook(() => useAPI(apiFn, []));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.data).toEqual({ foo: 'bar' });

        await act(async () => {
            await result.current.refetch();
        });

        expect(apiFn).toHaveBeenCalledTimes(2);
        expect(result.current.data).toEqual({ foo: 'baz' });
    });
});
