import { render, screen, fireEvent } from '@testing-library/react';
import Input from '../Input.jsx';

describe('Input component', () => {
  it('renders label and required indicator', () => {
    render(<Input label="Email" name="email" required />);

    const label = screen.getByText('Email');
    expect(label).toBeInTheDocument();
    expect(label).toContainHTML('<span');
  });

  it('calls onChange when user types', () => {
    const handleChange = vi.fn();
    render(<Input name="username" onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'john' } });

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('shows and hides password when toggle icon is clicked', () => {
    render(<Input type="password" name="password" value="secret" onChange={() => {}} />);

    let input = screen.getByDisplayValue('secret');
    expect(input).toHaveAttribute('type', 'password');

    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton);

    input = screen.getByDisplayValue('secret');
    expect(input).toHaveAttribute('type', 'text');
  });

  it('shows error message when error prop is provided', () => {
    render(<Input name="email" error="Invalid email" />);

    expect(screen.getByText('Invalid email')).toBeInTheDocument();
  });
});
