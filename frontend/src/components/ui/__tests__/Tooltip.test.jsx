import { render, screen, fireEvent, act } from '@testing-library/react';
import Tooltip from '../Tooltip.jsx';

describe('Tooltip component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders children', () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>,
    );

    expect(screen.getByRole('button', { name: /hover me/i })).toBeInTheDocument();
  });

  it('does not render tooltip initially', () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>,
    );

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('shows tooltip on mouse enter after delay', async () => {
    render(
      <Tooltip content="Tooltip text" delay={200}>
        <button>Hover me</button>
      </Tooltip>,
    );

    const button = screen.getByRole('button');
    fireEvent.mouseEnter(button);

    // Tooltip should not be visible yet
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    // Advance timers by delay
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    expect(screen.getByText('Tooltip text')).toBeInTheDocument();
  });

  it('hides tooltip on mouse leave', async () => {
    render(
      <Tooltip content="Tooltip text" delay={200}>
        <button>Hover me</button>
      </Tooltip>,
    );

    const button = screen.getByRole('button');

    // Show tooltip
    fireEvent.mouseEnter(button);
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    // Hide tooltip
    fireEvent.mouseLeave(button);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('cancels tooltip if mouse leaves before delay', () => {
    render(
      <Tooltip content="Tooltip text" delay={500}>
        <button>Hover me</button>
      </Tooltip>,
    );

    const button = screen.getByRole('button');

    fireEvent.mouseEnter(button);
    act(() => {
      vi.advanceTimersByTime(200); // Less than delay
    });

    fireEvent.mouseLeave(button);

    act(() => {
      vi.advanceTimersByTime(500); // Complete the original delay
    });

    // Tooltip should not appear
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('renders only children when content is empty', () => {
    render(
      <Tooltip content="">
        <button>Hover me</button>
      </Tooltip>,
    );

    const button = screen.getByRole('button');
    fireEvent.mouseEnter(button);

    act(() => {
      vi.advanceTimersByTime(200);
    });

    // No tooltip wrapper should exist
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('renders only children when content is null', () => {
    render(
      <Tooltip content={null}>
        <button>Hover me</button>
      </Tooltip>,
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('applies top position by default', () => {
    render(
      <Tooltip content="Tooltip text" delay={0}>
        <button>Hover me</button>
      </Tooltip>,
    );

    const button = screen.getByRole('button');
    fireEvent.mouseEnter(button);

    act(() => {
      vi.advanceTimersByTime(0);
    });

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveClass('bottom-full');
  });

  it('applies bottom position when specified', () => {
    render(
      <Tooltip content="Tooltip text" position="bottom" delay={0}>
        <button>Hover me</button>
      </Tooltip>,
    );

    const button = screen.getByRole('button');
    fireEvent.mouseEnter(button);

    act(() => {
      vi.advanceTimersByTime(0);
    });

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveClass('top-full');
  });

  it('applies left position when specified', () => {
    render(
      <Tooltip content="Tooltip text" position="left" delay={0}>
        <button>Hover me</button>
      </Tooltip>,
    );

    const button = screen.getByRole('button');
    fireEvent.mouseEnter(button);

    act(() => {
      vi.advanceTimersByTime(0);
    });

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveClass('right-full');
  });

  it('applies right position when specified', () => {
    render(
      <Tooltip content="Tooltip text" position="right" delay={0}>
        <button>Hover me</button>
      </Tooltip>,
    );

    const button = screen.getByRole('button');
    fireEvent.mouseEnter(button);

    act(() => {
      vi.advanceTimersByTime(0);
    });

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveClass('left-full');
  });

  it('applies custom className to tooltip', () => {
    render(
      <Tooltip content="Tooltip text" className="custom-tooltip" delay={0}>
        <button>Hover me</button>
      </Tooltip>,
    );

    const button = screen.getByRole('button');
    fireEvent.mouseEnter(button);

    act(() => {
      vi.advanceTimersByTime(0);
    });

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveClass('custom-tooltip');
  });

  it('uses custom delay', () => {
    render(
      <Tooltip content="Tooltip text" delay={1000}>
        <button>Hover me</button>
      </Tooltip>,
    );

    const button = screen.getByRole('button');
    fireEvent.mouseEnter(button);

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });
});
