import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';

import LoginPage from '../pages/LoginPage.jsx';
import authReducer from '@/store/slices/authSlice';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('@utils/validation', () => ({
  validateLoginForm: vi.fn(() => ({})),
}));

vi.mock('@utils/api', () => ({
  handleAPIError: vi.fn((error) => error?.message || 'An error occurred'),
}));

function renderLoginPage(initialState = {}) {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        ...initialState,
      },
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </Provider>,
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders welcome copy and form', () => {
    renderLoginPage();
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByText('Sign in to your HRM account')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('redirects when already authenticated', async () => {
    renderLoginPage({ isAuthenticated: true });
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });
  });

  it('shows auth error from the store', () => {
    renderLoginPage({ error: { message: 'Invalid credentials' } });
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });

  it('submits validated credentials', async () => {
    const { validateLoginForm } = await import('@utils/validation');
    vi.mocked(validateLoginForm).mockReturnValue({});

    renderLoginPage();
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { name: 'email', value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { name: 'password', value: 'password123' },
    });
    fireEvent.submit(screen.getByRole('button', { name: /sign in/i }).closest('form'));

    expect(validateLoginForm).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });
});
