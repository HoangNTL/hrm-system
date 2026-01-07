export const sidebarMenuItems = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: 'house', roles: ['ADMIN', 'HR', 'STAFF'] },
  { id: 'employees', label: 'Employees', path: '/employees', icon: 'users', roles: ['ADMIN', 'HR'] },
  { id: 'positions', label: 'Positions', path: '/positions', icon: 'briefcase', roles: ['ADMIN', 'HR'] },
  { id: 'departments', label: 'Departments', path: '/departments', icon: 'building', roles: ['ADMIN', 'HR'] },
  { id: 'contracts', label: 'Contracts', path: '/contracts', icon: 'clipboard', roles: ['ADMIN', 'HR'] },
  { id: 'shifts', label: 'Shifts', path: '/shifts', icon: 'clock', roles: ['ADMIN', 'HR'] },
  { id: 'users', label: 'Users', path: '/users', icon: 'circle-user-round', roles: ['ADMIN'] },
  // Staff features
  { id: 'attendance', label: 'Attendance', path: '/attendance', icon: 'calendar', roles: ['ADMIN', 'HR', 'STAFF'] },
  { id: 'attendance-history', label: 'Attendance History', path: '/attendance-history', icon: 'calendar', roles: ['STAFF'] },
  { id: 'attendance-requests', label: 'My Requests', path: '/attendance-requests', icon: 'file-text', roles: ['STAFF'] },
  { id: 'approve-attendance-requests', label: 'Approve Requests', path: '/approve-attendance-requests', icon: 'check-circle', roles: ['ADMIN', 'HR'] },
  { id: 'payroll', label: 'Payroll', path: '/payroll', icon: 'circle-dollar-sign', roles: ['ADMIN', 'HR', 'STAFF'] },
  { id: 'reports', label: 'Reports', path: '/reports', icon: 'chart-column-big', roles: ['ADMIN', 'HR'] },
];
