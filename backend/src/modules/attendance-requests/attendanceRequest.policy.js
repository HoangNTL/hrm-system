import { verifyRole, verifyToken } from '../../shared/middlewares/auth.middleware.js';
import { HR_ADMIN_ROLES } from '../../shared/constants/roles.js';

export const attendanceRequestPolicy = {
  requireAuthenticated: [verifyToken],
  requireHrOrAdmin: [verifyToken, verifyRole(HR_ADMIN_ROLES)],
  requireHrOrAdminRole: [verifyRole(HR_ADMIN_ROLES)],
};
