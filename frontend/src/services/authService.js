import authAPI from '@/api/authAPI';

const authService = {
  async login(email, password) {
    try {
      const response = await authAPI.login({ email, password });
      const { data } = response.data;
      const { user, accessToken } = data || {};

      if (!user || !accessToken) {
        throw new Error('Invalid login response');
      }

      // Store user data and token in localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('isAuthenticated', 'true');

      return { user, accessToken };
    } catch (error) {
      console.error('Login Service error:', error);

      throw {
        message: error.message || 'Login failed',
        status: error.response?.status,
        errors: error.response?.data?.errors || {},
      };
    }
  },

  async logout() {
    try {
      await authAPI.logout();

      // Clear user data and token from localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
    } catch (error) {
      console.error('Logout Service error:', error);
      throw {
        message: error.message || 'Logout failed',
        status: error.response?.status,
      };
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

export default authService;
