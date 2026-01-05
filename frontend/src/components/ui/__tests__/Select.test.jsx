import { render, screen, fireEvent } from '@testing-library/react';
import Select from '../Select.jsx';

const OPTIONS = [
  { value: '', label: 'Select option' },
  { value: '1', label: 'Option 1' },
  { value: '2', label: 'Option 2' },
];

describe('Select component', () => {
  it('renders label and options', () => {
    render(<Select label="Status" name="status" options={OPTIONS} value="" onChange={() => {}} />);

    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('calls onChange when a new option is selected', () => {
    const handleChange = vi.fn();
    render(<Select name="status" options={OPTIONS} value="" onChange={handleChange} />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '1' } });

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('shows error message when error prop is provided', () => {
    render(
      <Select
        name="status"
        options={OPTIONS}
        value=""
        onChange={() => {}}
        error="Required field"
      />,
    );

    expect(screen.getByText('Required field')).toBeInTheDocument();
  });
});
