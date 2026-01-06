import { render, screen, fireEvent } from '@testing-library/react';
import Table from '../Table.jsx';

// Mock Icon component
vi.mock('../Icon.jsx', () => ({
  default: ({ name, className }) => <span data-testid={`icon-${name}`} className={className} />,
}));

describe('Table component', () => {
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
  ];

  const data = [
    { name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
  ];

  it('renders loading state', () => {
    render(<Table columns={columns} data={[]} loading={true} />);

    // Should show loading spinner
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('renders empty state when no data', () => {
    render(<Table columns={columns} data={[]} loading={false} />);

    expect(screen.getByText('No data found')).toBeInTheDocument();
    expect(screen.getByTestId('icon-inbox')).toBeInTheDocument();
  });

  it('renders empty state when data is null', () => {
    render(<Table columns={columns} data={null} loading={false} />);

    expect(screen.getByText('No data found')).toBeInTheDocument();
  });

  it('renders table headers correctly', () => {
    render(<Table columns={columns} data={data} />);

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
  });

  it('renders table data correctly', () => {
    render(<Table columns={columns} data={data} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();
  });

  it('calls onRowClick when a row is clicked', () => {
    const handleRowClick = vi.fn();
    render(<Table columns={columns} data={data} onRowClick={handleRowClick} />);

    const rows = screen.getAllByRole('row');
    // First row is header, so click second row
    fireEvent.click(rows[1]);

    expect(handleRowClick).toHaveBeenCalledTimes(1);
    expect(handleRowClick).toHaveBeenCalledWith(data[0]);
  });

  it('renders actions column when actions prop is provided', () => {
    const actions = (row) => <button>Edit {row.name}</button>;
    render(<Table columns={columns} data={data} actions={actions} />);

    expect(screen.getByText('Actions')).toBeInTheDocument();
    expect(screen.getByText('Edit John Doe')).toBeInTheDocument();
    expect(screen.getByText('Edit Jane Smith')).toBeInTheDocument();
  });

  it('does not propagate click event from actions column', () => {
    const handleRowClick = vi.fn();
    const actions = (row) => <button data-testid={`edit-${row.name}`}>Edit</button>;
    render(<Table columns={columns} data={data} onRowClick={handleRowClick} actions={actions} />);

    const editButton = screen.getByTestId('edit-John Doe');
    fireEvent.click(editButton);

    // onRowClick should not be called when clicking on actions
    expect(handleRowClick).not.toHaveBeenCalled();
  });

  it('applies selected row styles when isRowSelected returns true', () => {
    const isRowSelected = (row) => row.name === 'John Doe';
    render(<Table columns={columns} data={data} isRowSelected={isRowSelected} />);

    const rows = screen.getAllByRole('row');
    // First row is header, second is John Doe (selected)
    expect(rows[1]).toHaveClass('bg-primary-100');
  });

  it('renders custom cell content using column render function', () => {
    const columnsWithRender = [
      { key: 'name', label: 'Name', render: (value) => <strong>{value}</strong> },
      { key: 'email', label: 'Email' },
    ];
    render(<Table columns={columnsWithRender} data={data} />);

    const strongElement = screen.getByText('John Doe');
    expect(strongElement.tagName).toBe('STRONG');
  });
});
