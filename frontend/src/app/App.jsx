import { RouterProvider } from 'react-router-dom';

import { router } from '@/routes/index.jsx';

export default function App() {
  return <RouterProvider router={router} />;
}
