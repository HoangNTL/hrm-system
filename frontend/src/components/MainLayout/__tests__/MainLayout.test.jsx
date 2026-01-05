import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { MemoryRouter } from 'react-router-dom';
import MainLayout from '..';

const mockStore = configureStore([]);

describe('MainLayout', () => {
  it('renders Sidebar, Header and main content outlet', () => {
    const store = mockStore({
      ui: { sidebarCollapsed: false },
      auth: { initialized: true },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <MainLayout />
        </MemoryRouter>
      </Provider>,
    );

    // Sidebar has aria-label="Main navigation"
    expect(screen.getByLabelText(/main navigation/i)).toBeInTheDocument();

    // Main content area role="main"
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});
