import authAPI from '@/api/authAPI';

const authService = {
  async login(email, password) {
    const response = await authAPI.login({ email, password });
    const { data } = response.data;
    const { user, accessToken } = data || {};

    if (!user || !accessToken) {
      throw { message: 'Invalid login response', status: 500 };
    }

    localStorage.setItem('user', JSON.stringify(user));
    return { user, accessToken };
  },

  async logout() {
    await authAPI.logout();
    localStorage.removeItem('user');
  },

  // Called when app boots or when token expired to get a new accessToken
  async refreshToken() {
    const response = await authAPI.refreshToken();
    const payload = response.data?.data || response.data || {};
    const { accessToken, user } = payload;
    return { accessToken, user };
  },

  async changePassword(newPassword, currentPassword = null) {
    const response = await authAPI.changePassword({
      newPassword,
      ...(currentPassword && { currentPassword }),
    });
    return response.data || response;
  },

  // Get current user
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },

  // Check if user is authenticated
  isAuthenticated() {
    return false;
  },
};

export default authService;
