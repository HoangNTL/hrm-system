import apiClient from '../config/axios';

export const authAPI = {
    // Login
    async login(credentials) {
        const response = await apiClient.post('/auth/login', credentials);
        return response.data;
    },

    // Logout
    async logout() {
        const response = await apiClient.post('/auth/logout');
        return response.data;
    },

    // Refresh token
    async refreshToken(refreshToken) {
        const response = await apiClient.post('/auth/refresh', {
            refresh_token: refreshToken,
        });
        return response.data;
    },

    // Get current user
    async getCurrentUser() {
        const response = await apiClient.get('/auth/me');
        return response.data;
    },
};