import axiosClient from '@/shared/api/axiosClient';

export function extractAuthPayload(response) {
  const payload = response?.data?.data || response?.data || {};
  const { user, accessToken } = payload;

  if (!user || !accessToken) {
    throw { message: 'Invalid login response', status: 500 };
  }

  return { user, accessToken };
}

export function extractRefreshPayload(response) {
  const payload = response?.data?.data || response?.data || {};

  return {
    accessToken: payload.accessToken || null,
    user: payload.user || null,
  };
}

export const authAPI = {
  login(credentials) {
    return axiosClient.post('/auth/login', credentials);
  },

  async loginSession(email, password) {
    const response = await this.login({ email, password });
    return extractAuthPayload(response);
  },

  logout() {
    return axiosClient.post('/auth/logout');
  },

  refreshToken() {
    return axiosClient.post('/auth/refresh-token');
  },

  async refreshSession() {
    const response = await this.refreshToken();
    return extractRefreshPayload(response);
  },

  changePassword(payload) {
    return axiosClient.post('/auth/change-password', payload);
  },
};

export default authAPI;
