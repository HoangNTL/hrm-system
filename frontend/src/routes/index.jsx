import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '@/components/MainLayout';
import LoginPage from '@/pages/auth/LoginPage';
import DashboardPage from '@/pages/dashboard';
import EmployeesPage from '@/pages/employees';
import DepartmentsPage from '@/pages/departments';
import ContractsPage from '@/pages/Contracts';
import UsersPage from '@/pages/users';
import AttendancePage from '@/pages/attendance';
import AttendanceHistoryPage from '@/pages/attendanceHistory';
import PayrollPage from '@/pages/payroll';
import ProtectedRoute from './ProtectedRoute';
import NotFoundPage from '@/pages/notFound';
import PositionsPage from '@/pages/positions';
import ShiftsPage from '@/pages/shifts';
import ReportsPage from '@/pages/reports';
import UserProfilePage from '@/pages/userProfile';
import AccessDeniedPage from '@/pages/accessDenied';
import AppErrorBoundary from './AppErrorBoundary';
import AttendanceRequestsPage from '@/pages/attendanceRequests';
import ApproveAttendanceRequestsPage from '@/pages/approveAttendanceRequests';

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
          <ProtectedRoute allowedRoles={["STAFF", "ADMIN", "HR"]}>
            <AttendancePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'attendance-history',
        element: (
          <ProtectedRoute allowedRoles={["STAFF"]}>
            <AttendanceHistoryPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'payroll',
        element: (
          <ProtectedRoute allowedRoles={["STAFF", "ADMIN", "HR"]}>
            <PayrollPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'employees',
        element: (
          <ProtectedRoute allowedRoles={["ADMIN", "HR"]}>
            <EmployeesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'positions',
        element: (
          <ProtectedRoute allowedRoles={["ADMIN", "HR"]}>
            <PositionsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'departments',
        element: (
          <ProtectedRoute allowedRoles={["ADMIN", "HR"]}>
            <DepartmentsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'contracts',
        element: (
          <ProtectedRoute allowedRoles={["ADMIN", "HR"]}>
            <ContractsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'users',
        element: (
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <UsersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'reports',
        element: (
          <ProtectedRoute allowedRoles={["ADMIN", "HR"]}>
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
          <ProtectedRoute allowedRoles={["ADMIN", "HR"]}>
            <ShiftsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'attendance-requests',
        element: (
          <ProtectedRoute allowedRoles={["STAFF"]}>
            <AttendanceRequestsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'approve-attendance-requests',
        element: (
          <ProtectedRoute allowedRoles={["ADMIN", "HR"]}>
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
