import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
// Simple mock for redux-mock-store to avoid external dependency in tests
const mockStore = (initialState) => ({
  getState: () => initialState,
  subscribe: () => () => {},
  dispatch: () => {},
});
import ProtectedRoute from '../ProtectedRoute.jsx';

function renderWithStoreAndRouter(storeState, route = '/') {
  const store = mockStore(storeState);
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route
            path={route}
            element={
              <ProtectedRoute>
                <div>Protected content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/access-denied" element={<div>Access Denied</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
}

describe('ProtectedRoute', () => {
  it('shows loading screen when auth is loading', () => {
    renderWithStoreAndRouter({
      auth: { isAuthenticated: false, loading: true, initialized: false },
      user: { user: null },
    });

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('redirects to login when not authenticated after init', () => {
    renderWithStoreAndRouter({
      auth: { isAuthenticated: false, loading: false, initialized: true },
      user: { user: null },
    });

    expect(screen.getByText(/login page/i)).toBeInTheDocument();
  });

  it('renders children when authenticated and no role restriction', () => {
    renderWithStoreAndRouter({
      auth: { isAuthenticated: true, loading: false, initialized: true },
      user: { user: { role: 'STAFF' } },
    });

    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });

  it('redirects to access denied when user role is not allowed', () => {
    const store = mockStore({
      auth: { isAuthenticated: true, loading: false, initialized: true },
      user: { user: { role: 'STAFF' } },
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/employees']}>
          <Routes>
            <Route
              path="/employees"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'HR']}>
                  <div>Employees Page</div>
                </ProtectedRoute>
              }
            />
            <Route path="/access-denied" element={<div>Access Denied</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>,
    );

    expect(screen.getByText(/access denied/i)).toBeInTheDocument();
  });
});
