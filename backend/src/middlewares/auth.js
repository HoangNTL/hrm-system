import jwt from 'jsonwebtoken';

import ApiError from '../utils/ApiError.js';
import { ERROR_CODES } from '../utils/errorCodes.js';

/**
 * Middleware: Verify JWT Access Token
 * Attaches decoded payload to req.user
 */
export const verifyToken = (req, res, next) => {
  try {
    // 1. get token from headers
    const authHeader = req.headers['authorization']; // Bearer <token>
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next(new ApiError(ERROR_CODES.UNAUTHORIZED, 'No token provided'));
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Attach payload to req.user
    req.user = decoded; // { id, role }

    return next(); // proceed to controller
  } catch (err) {
    return next(new ApiError(ERROR_CODES.UNAUTHORIZED, 'Invalid or expired token'));
  }
};

// Role-based access control middleware
// roles: ADMIN, HR, STAFF
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
