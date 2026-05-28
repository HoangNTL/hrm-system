import { verifyRole, verifyToken } from '../../shared/middlewares/auth.middleware.js';
import { HR_ADMIN_ROLES } from '../../shared/constants/roles.js';

export const departmentPolicy = {
  requireHrOrAdmin: [verifyToken, verifyRole(HR_ADMIN_ROLES)],
};
