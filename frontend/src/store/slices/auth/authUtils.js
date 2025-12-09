export const loadAuthState = () => {
    try {
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        const accessToken = localStorage.getItem('access_token');
        return { user, isAuthenticated, accessToken };
    } catch {
        return { user: null, isAuthenticated: false, accessToken: null };
    }
};

export const saveAuthState = ({ user, accessToken }) => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    if (accessToken) localStorage.setItem('access_token', accessToken);
    localStorage.setItem('isAuthenticated', 'true');
};

export const clearAuthState = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('isAuthenticated');
};