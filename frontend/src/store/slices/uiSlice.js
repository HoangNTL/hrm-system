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
    // set state loading and message
    setGlobalLoading: (state, { payload: { loading, message = '' } }) => {
      state.globalLoading = loading;
      state.loadingMessage = message;
    },

    // switch state sidebar
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },

    // set state sidebar
    setSidebarCollapsed: (state, { payload }) => {
      state.sidebarCollapsed = !!payload;
    },
  },
});

// actions
export const { setGlobalLoading, toggleSidebar, setSidebarCollapsed } = uiSlice.actions;

// reducer
export default uiSlice.reducer;

// Selectors
export const selectGlobalLoading = (state) => state.ui.globalLoading;
export const selectLoadingMessage = (state) => state.ui.loadingMessage;
export const selectSidebarCollapsed = (state) => state.ui.sidebarCollapsed;