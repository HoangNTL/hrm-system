export const sidebarMenuItems = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: 'house', roles: ['ADMIN', 'HR', 'STAFF'] },
  { id: 'employees', label: 'Employees', path: '/employees', icon: 'users', roles: ['ADMIN', 'HR'] },
  { id: 'positions', label: 'Positions', path: '/positions', icon: 'briefcase', roles: ['ADMIN', 'HR'] },
  { id: 'departments', label: 'Departments', path: '/departments', icon: 'building', roles: ['ADMIN', 'HR'] },
  { id: 'contracts', label: 'Contracts', path: '/contracts', icon: 'clipboard', roles: ['ADMIN', 'HR'] },
  { id: 'shifts', label: 'Shifts', path: '/shifts', icon: 'clock', roles: ['ADMIN', 'HR'] },
  { id: 'users', label: 'Users', path: '/users', icon: 'circle-user-round', roles: ['ADMIN'] },
  // Staff features (to be implemented on frontend later)
  { id: 'attendance', label: 'Attendance', path: '/attendance', icon: 'calendar', roles: ['ADMIN', 'HR', 'STAFF'] },
  { id: 'attendance-history', label: 'Attendance History', path: '/attendance-history', icon: 'calendar', roles: ['STAFF'] },
  { id: 'payroll', label: 'Payroll', path: '/payroll', icon: 'circle-dollar-sign', roles: ['ADMIN', 'HR', 'STAFF'] },
  { id: 'my-profile', label: 'My Profile', path: '/my-profile', icon: 'circle-user-round', roles: ['STAFF'] },
  { id: 'reports', label: 'Reports', path: '/reports', icon: 'chart-column-big', roles: ['ADMIN', 'HR'] },
  { id: 'settings', label: 'Settings', path: '/settings', icon: 'settings', roles: ['ADMIN'] },
];
