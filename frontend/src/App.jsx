import { ThemeProvider } from './context/ThemeContext.jsx';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';

function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
