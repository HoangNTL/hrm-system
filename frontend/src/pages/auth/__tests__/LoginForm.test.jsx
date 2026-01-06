import { render, screen, fireEvent } from '@testing-library/react';
import LoginForm from '../LoginForm';

const defaultProps = {
  formData: { email: '', password: '' },
  fieldErrors: {},
  globalError: '',
  loading: false,
  onChange: vi.fn(),
  onSubmit: vi.fn((e) => e.preventDefault()),
};

const renderLoginForm = (props = {}) => {
  return render(<LoginForm {...defaultProps} {...props} />);
};

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders email input with label', () => {
      renderLoginForm();

      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    });

    it('renders password input with label', () => {
      renderLoginForm();

      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('renders email placeholder', () => {
      renderLoginForm();

      expect(screen.getByPlaceholderText('you@company.com')).toBeInTheDocument();
    });

    it('renders password placeholder', () => {
      renderLoginForm();

      expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
    });

    it('renders Sign In button', () => {
      renderLoginForm();

      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('renders forgot password link', () => {
      renderLoginForm();

      expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
    });
  });

  describe('Form Values', () => {
    it('displays email value', () => {
      renderLoginForm({
        formData: { email: 'test@example.com', password: '' },
      });

      expect(screen.getByLabelText(/email address/i)).toHaveValue('test@example.com');
    });

    it('displays password value', () => {
      renderLoginForm({
        formData: { email: '', password: 'mypassword' },
      });

      expect(screen.getByLabelText(/password/i)).toHaveValue('mypassword');
    });
  });

  describe('Error Display', () => {
    it('displays global error message', () => {
      renderLoginForm({
        globalError: 'Invalid credentials',
      });

      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });

    it('does not display global error when empty', () => {
      renderLoginForm({
        globalError: '',
      });

      expect(screen.queryByText('Invalid credentials')).not.toBeInTheDocument();
    });

    it('displays email field error', () => {
      renderLoginForm({
        fieldErrors: { email: 'Email is required' },
      });

      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });

    it('displays password field error', () => {
      renderLoginForm({
        fieldErrors: { password: 'Password is required' },
      });

      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });

    it('displays multiple field errors', () => {
      renderLoginForm({
        fieldErrors: {
          email: 'Email is required',
          password: 'Password must be at least 6 characters',
        },
      });

      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('disables email input when loading', () => {
      renderLoginForm({ loading: true });

      expect(screen.getByLabelText(/email address/i)).toBeDisabled();
    });

    it('disables password input when loading', () => {
      renderLoginForm({ loading: true });

      expect(screen.getByLabelText(/password/i)).toBeDisabled();
    });

    it('disables submit button when loading', () => {
      renderLoginForm({ loading: true });

      expect(screen.getByRole('button', { name: /sign in/i })).toBeDisabled();
    });

    it('enables inputs when not loading', () => {
      renderLoginForm({ loading: false });

      expect(screen.getByLabelText(/email address/i)).not.toBeDisabled();
      expect(screen.getByLabelText(/password/i)).not.toBeDisabled();
      expect(screen.getByRole('button', { name: /sign in/i })).not.toBeDisabled();
    });
  });

  describe('Event Handlers', () => {
    it('calls onChange when email is changed', () => {
      const onChange = vi.fn();
      renderLoginForm({ onChange });

      const emailInput = screen.getByLabelText(/email address/i);
      fireEvent.change(emailInput, { target: { name: 'email', value: 'new@email.com' } });

      expect(onChange).toHaveBeenCalled();
    });

    it('calls onChange when password is changed', () => {
      const onChange = vi.fn();
      renderLoginForm({ onChange });

      const passwordInput = screen.getByLabelText(/password/i);
      fireEvent.change(passwordInput, { target: { name: 'password', value: 'newpassword' } });

      expect(onChange).toHaveBeenCalled();
    });

    it('calls onSubmit when form is submitted', () => {
      const onSubmit = vi.fn((e) => e.preventDefault());
      renderLoginForm({ onSubmit });

      const form = screen.getByRole('button', { name: /sign in/i }).closest('form');
      fireEvent.submit(form);

      expect(onSubmit).toHaveBeenCalled();
    });

    it('calls onSubmit when Sign In button is clicked', () => {
      const onSubmit = vi.fn((e) => e.preventDefault());
      renderLoginForm({ onSubmit });

      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      expect(onSubmit).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has correct autocomplete attribute on email', () => {
      renderLoginForm();

      expect(screen.getByLabelText(/email address/i)).toHaveAttribute('autocomplete', 'email');
    });

    it('has correct autocomplete attribute on password', () => {
      renderLoginForm();

      expect(screen.getByLabelText(/password/i)).toHaveAttribute(
        'autocomplete',
        'current-password',
      );
    });

    it('has type email for email input', () => {
      renderLoginForm();

      expect(screen.getByLabelText(/email address/i)).toHaveAttribute('type', 'email');
    });

    it('has type password for password input', () => {
      renderLoginForm();

      expect(screen.getByLabelText(/password/i)).toHaveAttribute('type', 'password');
    });
  });
});
