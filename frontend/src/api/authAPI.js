import apiClient from './axios';

const authAPI = {
  
  login: (credentials) => apiClient.post('/auth/login', credentials),

  logout: () => apiClient.post('/auth/logout'),

  refreshToken: () => apiClient.post('/auth/refresh-token'),
}

export default authAPI;
