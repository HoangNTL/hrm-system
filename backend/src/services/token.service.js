import jwt from 'jsonwebtoken';

export const tokenService = {
  generateAccessToken(user) {
    return jwt.sign(
      { 
        id: user.id, 
        role: user.role,
        employee_id: user.employee_id
      }, 
      process.env.JWT_SECRET, 
      {
        expiresIn: '15m',
      }
    );
  },

  generateRefreshToken(user) {
    return jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, {
      expiresIn: '7d',
    });
  },
};
