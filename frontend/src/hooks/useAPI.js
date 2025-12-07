import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for fetching data from API
 * @param {Function} apiFunc - API function to call
 * @param {Array} dependencies - Dependencies array for useEffect
 * @returns {Object} { data, loading, error, refetch }
 */
export function useAPI(apiFunc, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunc();
      setData(result);
    } catch (err) {
      setError(err);
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  }, [apiFunc]);

  useEffect(() => {
    fetchData();
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
}