import { AppRoutes } from '@/shared/constants/routes';
import { Roles } from '@/shared/constants/roles';

export const sidebarMenuItems = [
  { id: 'dashboard', label: 'Dashboard', path: AppRoutes.DASHBOARD, icon: 'house', roles: [Roles.ADMIN, Roles.HR, Roles.STAFF] },
  { id: 'employees', label: 'Employees', path: AppRoutes.EMPLOYEES, icon: 'users', roles: [Roles.ADMIN, Roles.HR] },
  { id: 'positions', label: 'Positions', path: AppRoutes.POSITIONS, icon: 'briefcase', roles: [Roles.ADMIN, Roles.HR] },
  { id: 'departments', label: 'Departments', path: AppRoutes.DEPARTMENTS, icon: 'building', roles: [Roles.ADMIN, Roles.HR] },
  { id: 'contracts', label: 'Contracts', path: AppRoutes.CONTRACTS, icon: 'clipboard', roles: [Roles.ADMIN, Roles.HR] },
  { id: 'shifts', label: 'Shifts', path: AppRoutes.SHIFTS, icon: 'clock', roles: [Roles.ADMIN, Roles.HR] },
  { id: 'users', label: 'Users', path: AppRoutes.USERS, icon: 'circle-user-round', roles: [Roles.ADMIN] },
  { id: 'attendance', label: 'Attendance', path: AppRoutes.ATTENDANCE, icon: 'calendar', roles: [Roles.ADMIN, Roles.HR, Roles.STAFF] },
  { id: 'attendance-history', label: 'Attendance History', path: AppRoutes.ATTENDANCE_HISTORY, icon: 'calendar', roles: [Roles.STAFF] },
  { id: 'attendance-requests', label: 'My Requests', path: AppRoutes.ATTENDANCE_REQUESTS, icon: 'file-text', roles: [Roles.STAFF] },
  { id: 'approve-attendance-requests', label: 'Approve Requests', path: AppRoutes.APPROVE_ATTENDANCE_REQUESTS, icon: 'check-circle', roles: [Roles.ADMIN, Roles.HR] },
  { id: 'payroll', label: 'Payroll', path: AppRoutes.PAYROLL, icon: 'circle-dollar-sign', roles: [Roles.ADMIN, Roles.HR, Roles.STAFF] },
  { id: 'reports', label: 'Reports', path: AppRoutes.REPORTS, icon: 'chart-column-big', roles: [Roles.ADMIN, Roles.HR] },
];
