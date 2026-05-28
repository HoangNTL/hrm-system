import jwt from 'jsonwebtoken';

import ApiError from '../../utils/ApiError.js';
import { ERROR_CODES } from '../../utils/errorCodes.js';

export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next(new ApiError(ERROR_CODES.UNAUTHORIZED, 'No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    return next();
  } catch {
    return next(new ApiError(ERROR_CODES.UNAUTHORIZED, 'Invalid or expired token'));
  }
};

export const verifyRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(ERROR_CODES.UNAUTHORIZED, 'Unauthorized'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError(ERROR_CODES.FORBIDDEN, 'Insufficient permissions'));
    }

    return next();
  };
};
