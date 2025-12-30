import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '@/components/MainLayout';
import LoginPage from '@/pages/Auth/LoginPage';
import DashboardPage from '@/pages/Dashboard';
import EmployeesPage from '@/pages/employees';
import DepartmentsPage from '@/pages/departments';
import ContractsPage from '@/pages/Contracts';
import UsersPage from '@/pages/users';
import AttendancePage from '@/pages/Attendance';
import AttendanceHistoryPage from '@/pages/AttendanceHistory';
import PayrollPage from '@/pages/Payroll';
import ProtectedRoute from './ProtectedRoute';
import NotFoundPage from '@/pages/notFound';
import PositionsPage from '@/pages/positions';
import ShiftsPage from '@/pages/shifts';
import ReportsPage from '@/pages/reports';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
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
        path: 'shifts',
        element: (
          <ProtectedRoute allowedRoles={["ADMIN", "HR"]}>
            <ShiftsPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
