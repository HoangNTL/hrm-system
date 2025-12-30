import { ThemeProvider } from './context/ThemeContext.jsx';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { Toaster } from 'react-hot-toast';
// import { useEffect } from 'react';
// import { useDispatch } from 'react-redux';
// import { refreshAccessTokenAsync } from '@/store/slices/authSlice';
// import { useLocation } from 'react-router-dom';

function App() {


  return (
    <ThemeProvider>
      <Toaster position="top-right" />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
