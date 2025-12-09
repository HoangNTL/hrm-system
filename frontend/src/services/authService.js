import { authAPI } from '@api';

export const authService = {
    // Login
    async login(email, password) {
        try {
            const response = await authAPI.login({ email, password });
            console.log(response)

            // Store tokens and user data
            if (response.data.access_token) {
                localStorage.setItem('access_token', response.data.access_token);
            }
            if (response.data.user) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
            localStorage.setItem('isAuthenticated', 'true');

            return response;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    },

    // Logout
    async logout() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
    },

    // Get current user
    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch (error) {
                console.error('Error parsing user data:', error);
                return null;
            }
        }
        return null;
    },

    // Check if user is authenticated
    isAuthenticated() {
        const token = localStorage.getItem('access_token');
        const isAuth = localStorage.getItem('isAuthenticated') === 'true';
        return !!(token && isAuth);
    },
};