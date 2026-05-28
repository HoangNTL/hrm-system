import { verifyRole, verifyToken } from '../../shared/middlewares/auth.middleware.js';
import { UserRole } from '../../shared/constants/roles.js';

export const userPolicy = {
  requireAuthenticated: [verifyToken],
  requireAdmin: [verifyToken, verifyRole([UserRole.ADMIN])],
};
