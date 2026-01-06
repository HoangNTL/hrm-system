import { render, screen, fireEvent } from '@testing-library/react';
import Textarea from '../Textarea.jsx';

// Mock Icon component
vi.mock('../Icon.jsx', () => ({
  default: ({ name, className }) => <span data-testid={`icon-${name}`} className={className} />,
}));

describe('Textarea component', () => {
  it('renders label and required indicator', () => {
    render(<Textarea label="Description" name="description" required />);

    const label = screen.getByText('Description');
    expect(label).toBeInTheDocument();
    expect(label).toContainHTML('<span');
  });

  it('renders label without required indicator when not required', () => {
    render(<Textarea label="Notes" name="notes" />);

    const label = screen.getByText('Notes');
    expect(label).toBeInTheDocument();
    expect(screen.queryByText('*')).not.toBeInTheDocument();
  });

  it('renders textarea without label when label prop is not provided', () => {
    render(<Textarea name="comment" placeholder="Enter comment" />);

    expect(screen.queryByRole('textbox', { name: /comment/i })).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter comment')).toBeInTheDocument();
  });

  it('calls onChange when user types', () => {
    const handleChange = vi.fn();
    render(<Textarea name="content" onChange={handleChange} />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Hello world' } });

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('displays the value passed as prop', () => {
    render(<Textarea name="message" value="Initial value" onChange={() => {}} />);

    expect(screen.getByDisplayValue('Initial value')).toBeInTheDocument();
  });

  it('renders with default 4 rows', () => {
    render(<Textarea name="content" />);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('rows', '4');
  });

  it('renders with custom rows', () => {
    render(<Textarea name="content" rows={8} />);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('rows', '8');
  });

  it('shows error message when error prop is provided', () => {
    render(<Textarea name="description" error="Description is required" />);

    expect(screen.getByText('Description is required')).toBeInTheDocument();
    expect(screen.getByTestId('icon-alert-circle')).toBeInTheDocument();
  });

  it('does not show error message when error prop is not provided', () => {
    render(<Textarea name="description" />);

    expect(screen.queryByTestId('icon-alert-circle')).not.toBeInTheDocument();
  });

  it('applies error styles when error prop is provided', () => {
    render(<Textarea name="description" error="Error message" />);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('border-error');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Textarea name="content" disabled />);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeDisabled();
  });

  it('renders placeholder text', () => {
    render(<Textarea name="content" placeholder="Enter your message..." />);

    expect(screen.getByPlaceholderText('Enter your message...')).toBeInTheDocument();
  });

  it('passes additional props to textarea element', () => {
    render(<Textarea name="content" maxLength={500} data-testid="custom-textarea" />);

    const textarea = screen.getByTestId('custom-textarea');
    expect(textarea).toHaveAttribute('maxLength', '500');
  });

  it('applies custom className', () => {
    render(<Textarea name="content" className="custom-class" />);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('custom-class');
  });
});
