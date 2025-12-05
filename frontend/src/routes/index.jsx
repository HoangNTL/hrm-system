import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import LoginPage from '../pages/Auth/Login';
import DashboardPage from '../pages/Dashboard';

// Protected Route Component
import ProtectedRoute from './ProtectedRoute';

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
            // Add more routes here as you build them
            // {
            //   path: 'employees',
            //   element: <EmployeesPage />,
            // },
            // {
            //   path: 'departments',
            //   element: <DepartmentsPage />,
            // },
        ],
    },
    {
        path: '*',
        element: <div className="flex items-center justify-center h-screen">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-secondary-900 dark:text-secondary-100">404</h1>
                <p className="text-xl text-secondary-600 dark:text-secondary-400 mt-4">Page Not Found</p>
            </div>
        </div>,
    },
]);