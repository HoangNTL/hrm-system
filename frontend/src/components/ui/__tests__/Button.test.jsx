import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../Button.jsx';

describe('Button component', () => {
  it('renders children text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText('Click me'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    const handleClick = vi.fn();
    render(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>,
    );

    fireEvent.click(screen.getByText('Disabled'));

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('disables button when loading and prevents click handler', () => {
    const handleClick = vi.fn();
    render(
      <Button loading onClick={handleClick}>
        Loading
      </Button>,
    );

    const button = screen.getByRole('button', { name: /loading/i });

    // Disabled when loading
    expect(button).toBeDisabled();

    // Click should not trigger handler
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies fullWidth class when fullWidth is true', () => {
    render(<Button fullWidth>Full width</Button>);

    const button = screen.getByRole('button', { name: /full width/i });
    expect(button).toHaveClass('w-full');
  });
});
