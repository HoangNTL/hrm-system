export const loadAuthState = () => {
    try {
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        const accessToken = localStorage.getItem('accessToken');
        return { user, isAuthenticated, accessToken };
    } catch {
        return { user: null, isAuthenticated: false, accessToken: null };
    }
};

export const saveAuthState = ({ user, accessToken }) => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    if (accessToken) localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('isAuthenticated', 'true');
};

export const clearAuthState = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('isAuthenticated');
};