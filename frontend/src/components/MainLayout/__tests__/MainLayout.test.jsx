import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
// Simple mock for redux-mock-store to avoid external dependency in tests
const mockStore = (initialState) => ({
  getState: () => initialState,
  subscribe: () => () => {},
  dispatch: () => {},
});
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@context/ThemeContext.jsx';
import MainLayout from '..';

describe('MainLayout', () => {
  it('renders Sidebar, Header and main content outlet', () => {
    const store = mockStore({
      ui: { sidebarCollapsed: false },
      auth: { initialized: true },
      user: { user: { name: 'Test User', role: 'admin' } },
    });

    render(
      <Provider store={store}>
        <ThemeProvider>
          <MemoryRouter>
            <MainLayout />
          </MemoryRouter>
        </ThemeProvider>
      </Provider>,
    );

    // Sidebar has aria-label="Main navigation"
    expect(screen.getByLabelText(/main navigation/i)).toBeInTheDocument();

    // Main content area role="main"
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});
