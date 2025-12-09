import { createSlice } from '@reduxjs/toolkit';
import { loadAuthState } from '../auth/authUtils';

const initialState = {
  user: loadAuthState().user || null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => { state.user = action.payload; },
    clearUser: (state) => { state.user = null; },
    updateUser: (state, action) => { state.user = { ...state.user, ...action.payload }; },
  },
});

export const { setUser, clearUser, updateUser } = userSlice.actions;
export default userSlice.reducer;

// Selector
export const selectUser = (state) => state.user.user;
