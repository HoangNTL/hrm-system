import { authAPI } from '@api';

export const authService = {
    // Login
    async login(email, password) {
        try {
            const response = await authAPI.login({ email, password });

            // Store tokens and user data
            if (response.data.accessToken) {
                localStorage.setItem('accessToken', response.data.accessToken);
            }
            if (response.data.user) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
            localStorage.setItem('isAuthenticated', 'true');

            return response;
        } catch (error) {
            console.error('Login Service error:', error);
            throw error;
        }
    },

    // Logout
    async logout() {
        try {
            await authAPI.logout();

            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            localStorage.removeItem('isAuthenticated');
        } catch (error) {
            console.error('Logout Service error:', error);
            throw error;
        }
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
        const token = localStorage.getItem('accessToken');
        const isAuth = localStorage.getItem('isAuthenticated') === 'true';
        return !!(token && isAuth);
    },
};