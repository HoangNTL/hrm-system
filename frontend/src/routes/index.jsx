import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '@/components/MainLayout';
import LoginPage from '@/pages/Auth/LoginPage';
import DashboardPage from '@/pages/Dashboard';
import EmployeesPage from '@/pages/employees';
import DepartmentsPage from '@/pages/departments';
import ProtectedRoute from './ProtectedRoute';
import NotFoundPage from '@pages/NotFound';

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
        path: 'departments',
        element: <DepartmentsPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
