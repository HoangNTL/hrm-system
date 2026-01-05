import uiReducer, {
    setGlobalLoading,
    toggleSidebar,
    setSidebarCollapsed,
    selectGlobalLoading,
    selectLoadingMessage,
    selectSidebarCollapsed,
} from '../uiSlice';

describe('uiSlice reducer and selectors', () => {
    const initialState = {
        globalLoading: false,
        loadingMessage: '',
        sidebarCollapsed: false,
    };

    it('should return initial state when passed an empty action', () => {
        const state = uiReducer(undefined, { type: '@@INIT' });
        expect(state).toEqual(initialState);
    });

    it('setGlobalLoading should set loading and message', () => {
        const state = uiReducer(initialState, setGlobalLoading({ loading: true, message: 'Loading...' }));
        expect(state.globalLoading).toBe(true);
        expect(state.loadingMessage).toBe('Loading...');
    });

    it('toggleSidebar should toggle sidebarCollapsed', () => {
        const state1 = uiReducer(initialState, toggleSidebar());
        expect(state1.sidebarCollapsed).toBe(true);
        const state2 = uiReducer(state1, toggleSidebar());
        expect(state2.sidebarCollapsed).toBe(false);
    });

    it('setSidebarCollapsed should set sidebarCollapsed explicitly', () => {
        const state = uiReducer(initialState, setSidebarCollapsed(true));
        expect(state.sidebarCollapsed).toBe(true);
    });

    it('selectors should read fields from root state', () => {
        const rootState = {
            ui: {
                globalLoading: true,
                loadingMessage: 'Loading data',
                sidebarCollapsed: true,
            },
        };

        expect(selectGlobalLoading(rootState)).toBe(true);
        expect(selectLoadingMessage(rootState)).toBe('Loading data');
        expect(selectSidebarCollapsed(rootState)).toBe(true);
    });
});
