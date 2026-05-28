import LoginPage from '@/features/auth/pages/LoginPage.jsx';
import AccessDeniedPage from '@/pages/accessDenied/index.jsx';
import { AppRoutes } from '@/shared/constants/routes';

import AppErrorBoundary from './AppErrorBoundary.jsx';

export const publicRoutes = [
  {
    path: AppRoutes.LOGIN,
    element: <LoginPage />,
    errorElement: <AppErrorBoundary />,
  },
  {
    path: AppRoutes.ACCESS_DENIED,
    element: <AccessDeniedPage />,
    errorElement: <AppErrorBoundary />,
  },
];
