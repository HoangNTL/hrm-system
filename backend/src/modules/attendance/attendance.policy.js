import { verifyRole, verifyToken } from '../../shared/middlewares/auth.middleware.js';
import { HR_ADMIN_ROLES, UserRole } from '../../shared/constants/roles.js';

export const attendancePolicy = {
  requireAuthenticated: [verifyToken],
  requireStaff: [verifyToken, verifyRole([UserRole.STAFF])],
  requireHrOrAdmin: [verifyToken, verifyRole(HR_ADMIN_ROLES)],
};
