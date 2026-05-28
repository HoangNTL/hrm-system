import { configureStore } from '@reduxjs/toolkit';

import { setAccessToken } from '@/shared/api/axiosClient';
import authReducer, { selectAccessToken } from '@/features/auth/store/authSlice';
import uiReducer from '../store/slices/uiSlice';
import userReducer from '../store/slices/userSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/loginAsync/fulfilled', 'auth/logoutAsync/fulfilled'],
        ignoredPaths: ['auth.accessToken', 'user.user'],
      },
    }),
});

let currentToken = null;
store.subscribe(() => {
  const state = store.getState();
  const newToken = selectAccessToken(state);
  if (newToken !== currentToken) {
    currentToken = newToken;
    setAccessToken(newToken);
  }
});

export default store;
