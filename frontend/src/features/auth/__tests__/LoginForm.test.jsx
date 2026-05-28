import { fireEvent, render, screen } from '@testing-library/react';

import LoginForm from '../components/LoginForm.jsx';

const defaultProps = {
  formData: { email: '', password: '' },
  fieldErrors: {},
  globalError: '',
  loading: false,
  onChange: vi.fn(),
  onSubmit: vi.fn((e) => e.preventDefault()),
};

describe('LoginForm', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders email, password, and sign in controls', () => {
    render(<LoginForm {...defaultProps} />);
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('renders field and global errors', () => {
    render(
      <LoginForm
        {...defaultProps}
        globalError="Invalid credentials"
        fieldErrors={{ email: 'Email is required' }}
      />,
    );
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    expect(screen.getByText('Email is required')).toBeInTheDocument();
  });

  it('calls onChange for email and password', () => {
    const onChange = vi.fn();
    render(<LoginForm {...defaultProps} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { name: 'email', value: 'user@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { name: 'password', value: 'secret' },
    });
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('calls onSubmit when form is submitted', () => {
    const onSubmit = vi.fn((e) => e.preventDefault());
    render(<LoginForm {...defaultProps} onSubmit={onSubmit} />);
    fireEvent.submit(screen.getByRole('button', { name: /sign in/i }).closest('form'));
    expect(onSubmit).toHaveBeenCalled();
  });
});
