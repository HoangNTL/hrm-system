import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  globalLoading: false,
  loadingMessage: '',
  sidebarCollapsed: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setGlobalLoading: (state, action) => {
      const { loading = false, message = '' } = action.payload || {};
      state.globalLoading = !!loading;
      state.loadingMessage = message;
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action) => {
      state.sidebarCollapsed = !!action.payload;
    },
  },
});

// actions
export const { setGlobalLoading, toggleSidebar, setSidebarCollapsed } = uiSlice.actions;

// reducer
export default uiSlice.reducer;

// selectors
export const selectGlobalLoading = (state) => state.ui.globalLoading;
export const selectLoadingMessage = (state) => state.ui.loadingMessage;
export const selectSidebarCollapsed = (state) => state.ui.sidebarCollapsed;
