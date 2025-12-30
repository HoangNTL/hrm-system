import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '@/services/authService';
import { setUser, clearUser } from './userSlice';

// LOGIN
export const loginAsync = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue, dispatch }) => {
    try {
      const { accessToken, user } = await authService.login(email, password);
      dispatch(setUser(user));
      return accessToken;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

// LOGOUT
export const logoutAsync = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      await authService.logout();
      dispatch(clearUser());
      return true;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

// REFRESH
export const refreshAccessTokenAsync = createAsyncThunk(
  'auth/refresh',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const { accessToken, user } = await authService.refreshToken();
      if (user) {
        dispatch(setUser(user));
      }
      return accessToken;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

// Initial state
const initialState = {
  isAuthenticated: false,
  accessToken: null,
  loading: false,
  initialized: false, // single bootstrap flag
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
      // LOGIN
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
      // LOGOUT
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
      // REFRESH
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

export const { clearError } = authSlice.actions;
export default authSlice.reducer;

export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectAccessToken = (state) => state.auth.accessToken;
export const selectAuthInitialized = (state) => state.auth.initialized;