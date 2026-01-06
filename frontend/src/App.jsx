import { ThemeProvider } from './context/ThemeContext.jsx';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <ThemeProvider>
      <Toaster position="top-right" />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
