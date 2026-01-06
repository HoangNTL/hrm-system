import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import LoginPage from '../LoginPage';
import authReducer from '@/store/slices/authSlice';

// Mock the navigate function
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock validation
vi.mock('@utils/validation', () => ({
  validateLoginForm: vi.fn(() => ({})),
}));

// Mock API error handler
vi.mock('@utils/api', () => ({
  handleAPIError: vi.fn((error) => error?.message || 'An error occurred'),
}));

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
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
};

const renderLoginPage = (store = createMockStore()) => {
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </Provider>,
  );
};

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders welcome message', () => {
      renderLoginPage();

      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
      expect(screen.getByText('Sign in to your HRM account')).toBeInTheDocument();
    });

    it('renders email and password inputs', () => {
      renderLoginPage();

      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('renders sign in button', () => {
      renderLoginPage();

      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('renders forgot password link', () => {
      renderLoginPage();

      expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
    });

    it('renders contact administrator message', () => {
      renderLoginPage();

      expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
      expect(screen.getByText(/contact your administrator/i)).toBeInTheDocument();
    });

    it('renders copyright notice', () => {
      renderLoginPage();

      expect(screen.getByText(/© 2025 HRM System/i)).toBeInTheDocument();
    });
  });

  describe('Form Interaction', () => {
    it('updates email value when typing', () => {
      renderLoginPage();

      const emailInput = screen.getByLabelText(/email address/i);
      fireEvent.change(emailInput, { target: { name: 'email', value: 'test@example.com' } });

      expect(emailInput).toHaveValue('test@example.com');
    });

    it('updates password value when typing', () => {
      renderLoginPage();

      const passwordInput = screen.getByLabelText(/password/i);
      fireEvent.change(passwordInput, { target: { name: 'password', value: 'password123' } });

      expect(passwordInput).toHaveValue('password123');
    });

    it('submits form when sign in button is clicked', async () => {
      const { validateLoginForm } = await import('@utils/validation');
      vi.mocked(validateLoginForm).mockReturnValue({});

      renderLoginPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);

      fireEvent.change(emailInput, { target: { name: 'email', value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { name: 'password', value: 'password123' } });

      const form = screen.getByRole('button', { name: /sign in/i }).closest('form');
      fireEvent.submit(form);

      expect(validateLoginForm).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('does not submit when validation fails', async () => {
      const { validateLoginForm } = await import('@utils/validation');
      vi.mocked(validateLoginForm).mockReturnValue({
        email: 'Email is required',
        password: 'Password is required',
      });

      renderLoginPage();

      const form = screen.getByRole('button', { name: /sign in/i }).closest('form');
      fireEvent.submit(form);

      // Should not navigate since validation failed
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('shows loading state on button during authentication', () => {
      const store = createMockStore({ loading: true });
      renderLoginPage(store);

      const signInButton = screen.getByRole('button', { name: /sign in/i });
      expect(signInButton).toBeDisabled();
    });

    it('disables inputs during loading', () => {
      const store = createMockStore({ loading: true });
      renderLoginPage(store);

      expect(screen.getByLabelText(/email address/i)).toBeDisabled();
      expect(screen.getByLabelText(/password/i)).toBeDisabled();
    });
  });

  describe('Redirect', () => {
    it('redirects to dashboard when already authenticated', async () => {
      const store = createMockStore({ isAuthenticated: true });
      renderLoginPage(store);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
      });
    });

    it('does not redirect when not authenticated', () => {
      renderLoginPage();

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('displays auth error from store', () => {
      const store = createMockStore({ error: { message: 'Invalid credentials' } });
      renderLoginPage(store);

      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });
});
