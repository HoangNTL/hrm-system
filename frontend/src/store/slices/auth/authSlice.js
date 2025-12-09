import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '@api';
import { saveAuthState, clearAuthState, loadAuthState } from './authUtils';
import { setUser, clearUser } from '../user/userSlice';

// Async thunk login
export const loginAsync = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue, dispatch }) => {
    try {
      const response = await authAPI.login(credentials);
      saveAuthState({
        user: response.data.user,
        accessToken: response.data.accessToken
      });

      // Update user slice
      dispatch(setUser(response.data.user));

      return response.data.accessToken;
    } catch (error) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

// Async thunk logout
export const logoutAsync = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    try {
      // Call logout API if needed
      // await authAPI.logout();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Always clear auth state
      clearAuthState();

      // Clear user slice
      dispatch(clearUser());
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: { ...loadAuthState(), loading: false, error: null },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.accessToken = action.payload;
        state.error = null;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.accessToken = null;
        state.error = action.payload;
      })
      // Logout
      .addCase(logoutAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutAsync.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.accessToken = null;
        state.error = null;
      })
      .addCase(logoutAsync.rejected, (state) => {
        // Even if logout fails, clear the state
        state.loading = false;
        state.isAuthenticated = false;
        state.accessToken = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;

// Selectors
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectAccessToken = (state) => state.auth.accessToken;