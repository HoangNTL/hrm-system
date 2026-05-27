export const UserRole = {
  ADMIN: 'ADMIN',
  HR: 'HR',
  STAFF: 'STAFF',
};

export const USER_ROLES = Object.values(UserRole);
export const HR_ADMIN_ROLES = [UserRole.ADMIN, UserRole.HR];

export function normalizeUserRole(role, fallback = UserRole.STAFF) {
  if (role === undefined || role === null || role === '') {
    return fallback;
  }

  return String(role).trim().toUpperCase();
}

export function isValidUserRole(role) {
  return USER_ROLES.includes(role);
}
