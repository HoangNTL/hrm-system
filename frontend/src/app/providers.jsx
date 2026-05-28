import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';

import { ThemeProvider } from '@/context/ThemeContext.jsx';
import store from './store.js';

export default function AppProviders({ children }) {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <Toaster position="top-right" />
        {children}
      </ThemeProvider>
    </Provider>
  );
}
