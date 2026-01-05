import { render, screen, fireEvent } from '@testing-library/react';
import SearchBar from '../SearchBar.jsx';

describe('SearchBar component', () => {
  it('renders input with placeholder', () => {
    render(<SearchBar placeholder="Search employees" onChange={() => {}} />);

    const input = screen.getByPlaceholderText('Search employees');
    expect(input).toBeInTheDocument();
  });

  it('calls onChange after debounce when typing', async () => {
    vi.useFakeTimers();
    const handleChange = vi.fn();
    render(<SearchBar onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'john' } });

    // Fast-forward debounce timer
    vi.advanceTimersByTime(500);

    expect(handleChange).toHaveBeenCalledWith('john');
    vi.useRealTimers();
  });

  it('clears input and calls onChange when clear button is clicked', () => {
    const handleChange = vi.fn();
    render(<SearchBar value="john" onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('john');

    const clearButton = screen.getByRole('button', { name: /clear search/i });
    fireEvent.click(clearButton);

    expect(input).toHaveValue('');
    expect(handleChange).toHaveBeenCalledWith('');
  });
});
