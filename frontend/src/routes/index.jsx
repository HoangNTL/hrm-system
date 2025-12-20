import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '@/components/MainLayout';
import LoginPage from '@/pages/Auth/LoginPage';
import DashboardPage from '@/pages/Dashboard';
import EmployeesPage from '@/pages/employees';
import DepartmentsPage from '@/pages/departments';
import ContractsPage from '@/pages/Contracts';
import UsersPage from '@/pages/Users';
import ProtectedRoute from './ProtectedRoute';
import NotFoundPage from '@/pages/notFound';
import PositionsPage from '@/pages/positions';

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
        path: 'employees',
        element: <EmployeesPage />,
      },
      {
        path: 'positions',
        element: <PositionsPage />,
      },
      {
        path: 'departments',
        element: <DepartmentsPage />,
      },
      {
        path: 'contracts',
        element: <ContractsPage />,
      },
      {
        path: 'users',
        element: <UsersPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
