import { verifyRole, verifyToken } from '../../shared/middlewares/auth.middleware.js';
import { HR_ADMIN_ROLES, USER_ROLES } from '../../shared/constants/roles.js';

export const payrollPolicy = {
  requireHrOrAdmin: [verifyToken, verifyRole(HR_ADMIN_ROLES)],
  requireUser: [verifyToken, verifyRole(USER_ROLES)],
};
