import jwt from 'jsonwebtoken';

import ApiError from '../utils/ApiError.js';
import { ERROR_CODES } from '../utils/errorCodes.js';
import { isValidUserRole, normalizeUserRole } from '../utils/roles.js';

function getValidatedRole(user) {
  const normalizedRole = normalizeUserRole(user?.role, null);
  if (!isValidUserRole(normalizedRole)) {
    throw new ApiError(ERROR_CODES.SERVER_ERROR, 'User has invalid role');
  }

  return normalizedRole;
}

export const tokenService = {
  generateAccessToken(user) {
    const role = getValidatedRole(user);

    return jwt.sign(
      {
        id: user.id,
        role,
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
