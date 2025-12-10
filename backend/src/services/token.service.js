import jwt from 'jsonwebtoken';

export const tokenService = {
  /**
   * Generate a new access token for user
   * @param {Object} user - user object
   * @returns {String} JWT token (15m)
   */
  generateAccessToken(user) {
    return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '15m',
    });
  },
  /**
   * Generate a new refresh token for user
   * @param {Object} user - user object
   * @returns {String} JWT token (7d)
   */
  generateRefreshToken(user) {
    return jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, {
      expiresIn: '7d',
    });
  },
};
