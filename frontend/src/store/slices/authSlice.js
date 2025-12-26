import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import authService from '@/services/authService';
import { setUser, clearUser } from './userSlice';

// Async thunk login
export const loginAsync = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue, dispatch }) => {
    try {
      const { user, accessToken } = await authService.login(email, password);

      // Update user slice
      dispatch(setUser(user));

      return accessToken;
    } catch (error) {
      // error có thể là object { message, status, errors }
      return rejectWithValue(error);
    }
  }
);

// Async thunk logout
export const logoutAsync = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout Service error:', error);
    } finally {
      dispatch(clearUser());
    }
  }
);

// Initial state
const initialState = {
  isAuthenticated: authService.isAuthenticated(),
  accessToken: localStorage.getItem('accessToken') || null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
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
        // payload is the accessToken returned from service
        state.accessToken = action.payload;
        state.error = null;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.accessToken = null;
        state.error = action.payload || { message: 'Login failed' };
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
        state.loading = false;
        state.isAuthenticated = false;
        state.accessToken = null;
      });
  },
});

// actions
export const { clearError } = authSlice.actions;

// reducer
export default authSlice.reducer;

// Selectors
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectAccessToken = (state) => state.auth.accessToken;
