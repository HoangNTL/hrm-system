import userReducer, { setUser, clearUser, updateUser, selectUser } from '../userSlice';

describe('userSlice reducer and selector', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('should return initial state when passed an empty action', () => {
        const state = userReducer(undefined, { type: '@@INIT' });
        expect(state.user === null || typeof state.user === 'object').toBe(true);
    });

    it('setUser should update state and localStorage', () => {
        const user = { id: 1, name: 'John' };
        const state = userReducer({ user: null }, setUser(user));

        expect(state.user).toEqual(user);
        expect(JSON.parse(localStorage.getItem('user'))).toEqual(user);
    });

    it('clearUser should clear state and localStorage', () => {
        const initial = { user: { id: 1, name: 'John' } };
        localStorage.setItem('user', JSON.stringify(initial.user));

        const state = userReducer(initial, clearUser());

        expect(state.user).toBeNull();
        expect(localStorage.getItem('user')).toBeNull();
    });

    it('updateUser should shallow-merge into existing user', () => {
        const initial = { user: { id: 1, name: 'John', email: 'old@example.com' } };
        const state = userReducer(initial, updateUser({ email: 'new@example.com' }));

        expect(state.user).toEqual({ id: 1, name: 'John', email: 'new@example.com' });
    });

    it('selectUser should return user from root state', () => {
        const rootState = { user: { user: { id: 1, name: 'John' } } };
        expect(selectUser(rootState)).toEqual({ id: 1, name: 'John' });
    });
});
