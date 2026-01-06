import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '@/components/MainLayout/index';
import LoginPage from '@/pages/auth/LoginPage';
import DashboardPage from '@/pages/dashboard/index';
import EmployeesPage from '@/pages/employees/index';
import DepartmentsPage from '@/pages/departments/index';
import ContractsPage from '@/pages/contracts/index';
import UsersPage from '@/pages/users/index';
import AttendancePage from '@/pages/attendance/index';
import AttendanceHistoryPage from '@/pages/attendanceHistory/index';
import PayrollPage from '@/pages/payroll/index';
import ProtectedRoute from './ProtectedRoute';
import NotFoundPage from '@/pages/notFound/index';
import PositionsPage from '@/pages/positions/index';
import ShiftsPage from '@/pages/shifts/index';
import ReportsPage from '@/pages/reports/index';
import UserProfilePage from '@/pages/userProfile/index';
import AccessDeniedPage from '@/pages/accessDenied/index';
import AppErrorBoundary from './AppErrorBoundary';
import AttendanceRequestsPage from '@/pages/attendanceRequests/index';
import ApproveAttendanceRequestsPage from '@/pages/approveAttendanceRequests/index';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
    errorElement: <AppErrorBoundary />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    errorElement: <AppErrorBoundary />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'attendance',
        element: (
          <ProtectedRoute allowedRoles={['STAFF', 'ADMIN', 'HR']}>
            <AttendancePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'attendance-history',
        element: (
          <ProtectedRoute allowedRoles={['STAFF']}>
            <AttendanceHistoryPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'payroll',
        element: (
          <ProtectedRoute allowedRoles={['STAFF', 'ADMIN', 'HR']}>
            <PayrollPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'employees',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN', 'HR']}>
            <EmployeesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'positions',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN', 'HR']}>
            <PositionsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'departments',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN', 'HR']}>
            <DepartmentsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'contracts',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN', 'HR']}>
            <ContractsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'users',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <UsersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'reports',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN', 'HR']}>
            <ReportsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'my-profile',
        element: (
          <ProtectedRoute>
            <UserProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'shifts',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN', 'HR']}>
            <ShiftsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'attendance-requests',
        element: (
          <ProtectedRoute allowedRoles={['STAFF']}>
            <AttendanceRequestsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'approve-attendance-requests',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN', 'HR']}>
            <ApproveAttendanceRequestsPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '/access-denied',
    element: <AccessDeniedPage />,
    errorElement: <AppErrorBoundary />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
