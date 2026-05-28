import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  clearError,
  loginAsync,
  logoutAsync,
  refreshAccessTokenAsync,
  selectAccessToken,
  selectAuthError,
  selectAuthInitialized,
  selectAuthLoading,
  selectIsAuthenticated,
} from '../store/authSlice';

export function useAuth() {
  const dispatch = useDispatch();

  const login = useCallback(
    (payload) => dispatch(loginAsync(payload)).unwrap(),
    [dispatch],
  );
  const logout = useCallback(
    () => dispatch(logoutAsync()).unwrap(),
    [dispatch],
  );
  const refresh = useCallback(
    () => dispatch(refreshAccessTokenAsync()).unwrap(),
    [dispatch],
  );
  const clearAuthError = useCallback(
    () => dispatch(clearError()),
    [dispatch],
  );

  return {
    isAuthenticated: useSelector(selectIsAuthenticated),
    loading: useSelector(selectAuthLoading),
    error: useSelector(selectAuthError),
    initialized: useSelector(selectAuthInitialized),
    accessToken: useSelector(selectAccessToken),
    login,
    logout,
    refresh,
    clearError: clearAuthError,
  };
}

export default useAuth;
