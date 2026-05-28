import MainLayout from '@/layouts/MainLayout.jsx';
import DashboardPage from '@/features/dashboard/pages/DashboardPage.jsx';
import EmployeesPage from '@/features/employees/pages/EmployeesPage.jsx';
import DepartmentsPage from '@/features/departments/pages/DepartmentsPage.jsx';
import ContractsPage from '@/features/contracts/pages/ContractsPage.jsx';
import UsersPage from '@/features/users/pages/UsersPage.jsx';
import AttendancePage from '@/features/attendance/pages/AttendancePage.jsx';
import AttendanceHistoryPage from '@/features/attendance/pages/AttendanceHistoryPage.jsx';
import PayrollPage from '@/features/payroll/pages/PayrollPage.jsx';
import PositionsPage from '@/features/positions/pages/PositionsPage.jsx';
import ShiftsPage from '@/features/shifts/pages/ShiftsPage.jsx';
import ReportsPage from '@/features/reports/pages/ReportsPage.jsx';
import AttendanceRequestsPage from '@/features/attendance-requests/pages/AttendanceRequestsPage.jsx';
import ApproveAttendanceRequestsPage from '@/features/attendance-requests/pages/ApproveAttendanceRequestsPage.jsx';
import UserProfilePage from '@/features/users/pages/UserProfilePage.jsx';
import { AppRoutes } from '@/shared/constants/routes';
import { Roles } from '@/shared/constants/roles';

import AppErrorBoundary from './AppErrorBoundary.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';

function withProtection(element, allowedRoles) {
  if (!allowedRoles?.length) {
    return <ProtectedRoute>{element}</ProtectedRoute>;
  }

  return <ProtectedRoute allowedRoles={allowedRoles}>{element}</ProtectedRoute>;
}

export const protectedRoutes = [
  {
    path: '/',
    element: withProtection(<MainLayout />),
    errorElement: <AppErrorBoundary />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: AppRoutes.DASHBOARD.slice(1), element: <DashboardPage /> },
      { path: AppRoutes.ATTENDANCE.slice(1), element: withProtection(<AttendancePage />, [Roles.STAFF, Roles.ADMIN, Roles.HR]) },
      { path: AppRoutes.ATTENDANCE_HISTORY.slice(1), element: withProtection(<AttendanceHistoryPage />, [Roles.STAFF]) },
      { path: AppRoutes.PAYROLL.slice(1), element: withProtection(<PayrollPage />, [Roles.STAFF, Roles.ADMIN, Roles.HR]) },
      { path: AppRoutes.EMPLOYEES.slice(1), element: withProtection(<EmployeesPage />, [Roles.ADMIN, Roles.HR]) },
      { path: AppRoutes.POSITIONS.slice(1), element: withProtection(<PositionsPage />, [Roles.ADMIN, Roles.HR]) },
      { path: AppRoutes.DEPARTMENTS.slice(1), element: withProtection(<DepartmentsPage />, [Roles.ADMIN, Roles.HR]) },
      { path: AppRoutes.CONTRACTS.slice(1), element: withProtection(<ContractsPage />, [Roles.ADMIN, Roles.HR]) },
      { path: AppRoutes.USERS.slice(1), element: withProtection(<UsersPage />, [Roles.ADMIN]) },
      { path: AppRoutes.REPORTS.slice(1), element: withProtection(<ReportsPage />, [Roles.ADMIN, Roles.HR]) },
      { path: AppRoutes.MY_PROFILE.slice(1), element: withProtection(<UserProfilePage />) },
      { path: AppRoutes.SHIFTS.slice(1), element: withProtection(<ShiftsPage />, [Roles.ADMIN, Roles.HR]) },
      { path: AppRoutes.ATTENDANCE_REQUESTS.slice(1), element: withProtection(<AttendanceRequestsPage />, [Roles.STAFF]) },
      { path: AppRoutes.APPROVE_ATTENDANCE_REQUESTS.slice(1), element: withProtection(<ApproveAttendanceRequestsPage />, [Roles.ADMIN, Roles.HR]) },
    ],
  },
];
