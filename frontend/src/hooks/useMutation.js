import { useState, useCallback } from 'react';

/**
 * Custom hook for mutation operations (POST, PUT, DELETE)
 * @returns {Object} { mutate, loading, error, data }
 */
export function useMutation() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const mutate = useCallback(async (apiFunc) => {
        try {
            setLoading(true);
            setError(null);
            const result = await apiFunc();
            setData(result);
            return result;
        } catch (err) {
            setError(err);
            console.error('Mutation Error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { mutate, loading, error, data };
}