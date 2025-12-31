import apiClient from './axios';

const authAPI = {
  
  login: (credentials) => apiClient.post('/auth/login', credentials),

  logout: () => apiClient.post('/auth/logout'),

  refreshToken: () => apiClient.post('/auth/refresh-token'),

  changePassword: (payload) => apiClient.post('/auth/change-password', payload),
}

export default authAPI;
