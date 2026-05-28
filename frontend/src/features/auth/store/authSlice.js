import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { authAPI } from '@/features/auth/api/auth.api';
import { clearUser, setUser } from '@/store/slices/userSlice';

export const loginAsync = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { dispatch, rejectWithValue }) => {
    try {
      const { accessToken, user } = await authAPI.loginSession(email, password);
      dispatch(setUser(user));
      return accessToken;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const logoutAsync = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await authAPI.logout();
      dispatch(clearUser());
      return true;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const refreshAccessTokenAsync = createAsyncThunk(
  'auth/refresh',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const { accessToken, user } = await authAPI.refreshSession();
      if (user) {
        dispatch(setUser(user));
      }
      return accessToken;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

const initialState = {
  isAuthenticated: false,
  accessToken: null,
  loading: false,
  initialized: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetAuthState: (state) => {
      state.isAuthenticated = false;
      state.accessToken = null;
      state.loading = false;
      state.initialized = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.accessToken = action.payload;
        state.error = null;
        state.initialized = true;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.accessToken = null;
        state.error = action.payload || { message: 'Login failed' };
        state.initialized = true;
      })
      .addCase(logoutAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutAsync.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.accessToken = null;
        state.error = null;
        state.initialized = true;
      })
      .addCase(logoutAsync.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.accessToken = null;
        state.initialized = true;
      })
      .addCase(refreshAccessTokenAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(refreshAccessTokenAsync.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.isAuthenticated = true;
          state.accessToken = action.payload;
        } else {
          state.isAuthenticated = false;
          state.accessToken = null;
        }
        state.initialized = true;
      })
      .addCase(refreshAccessTokenAsync.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.accessToken = null;
        state.initialized = true;
      });
  },
});

export const { clearError, resetAuthState } = authSlice.actions;
export default authSlice.reducer;

export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectAccessToken = (state) => state.auth.accessToken;
export const selectAuthInitialized = (state) => state.auth.initialized;
