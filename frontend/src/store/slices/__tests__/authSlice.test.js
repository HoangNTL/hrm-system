import authReducer, {
    clearError,
    selectIsAuthenticated,
    selectAuthLoading,
    selectAuthError,
    selectAccessToken,
    selectAuthInitialized,
} from '../authSlice';

describe('authSlice reducer and selectors', () => {
    const initialState = {
        isAuthenticated: false,
        accessToken: null,
        loading: false,
        initialized: false,
        error: null,
    };

    it('should return initial state when passed an empty action', () => {
        const state = authReducer(undefined, { type: '@@INIT' });
        expect(state).toEqual(initialState);
    });

    it('clearError should reset error to null', () => {
        const stateWithError = { ...initialState, error: { message: 'Login failed' } };
        const state = authReducer(stateWithError, clearError());
        expect(state.error).toBeNull();
    });

    it('selectors should read corresponding fields from state', () => {
        const state = {
            auth: {
                isAuthenticated: true,
                accessToken: 'token123',
                loading: true,
                initialized: true,
                error: { message: 'error' },
            },
        };

        expect(selectIsAuthenticated(state)).toBe(true);
        expect(selectAccessToken(state)).toBe('token123');
        expect(selectAuthLoading(state)).toBe(true);
        expect(selectAuthInitialized(state)).toBe(true);
        expect(selectAuthError(state)).toEqual({ message: 'error' });
    });
});
