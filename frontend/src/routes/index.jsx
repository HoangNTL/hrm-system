import { createBrowserRouter } from 'react-router-dom';
import NotFoundPage from '@/pages/notFound/index.jsx';
import { protectedRoutes } from './protectedRoutes.jsx';
import { publicRoutes } from './publicRoutes.jsx';

export const router = createBrowserRouter([
  ...publicRoutes,
  ...protectedRoutes,
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
