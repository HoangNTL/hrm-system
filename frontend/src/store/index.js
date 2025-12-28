import { configureStore } from '@reduxjs/toolkit';
import authReducer, { selectAccessToken } from './slices/authSlice';
import userReducer from './slices/userSlice';
import uiReducer from './slices/uiSlice';
import { setAccessToken } from '@api/axios';

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
        ignoredPaths: ['auth.accessToken', 'user.user']
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
