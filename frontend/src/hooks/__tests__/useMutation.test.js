import { renderHook, act } from '@testing-library/react';
import { useMutation } from '../useMutation';

describe('useMutation', () => {
    it('calls api function and sets data on success', async () => {
        const apiFn = vi.fn().mockResolvedValue({ ok: true });
        const { result } = renderHook(() => useMutation());

        await act(async () => {
            const data = await result.current.mutate(apiFn);
            expect(data).toEqual({ ok: true });
        });

        expect(apiFn).toHaveBeenCalledTimes(1);
        expect(result.current.data).toEqual({ ok: true });
        expect(result.current.error).toBeNull();
        expect(result.current.loading).toBe(false);
    });

    it('sets error and rethrows when api function fails', async () => {
        const error = new Error('Mutation failed');
        const apiFn = vi.fn().mockRejectedValue(error);
        const { result } = renderHook(() => useMutation());

        await act(async () => {
            await expect(result.current.mutate(apiFn)).rejects.toThrow('Mutation failed');
        });

        expect(apiFn).toHaveBeenCalledTimes(1);
        expect(result.current.error).toBe(error);
        expect(result.current.loading).toBe(false);
    });
});
