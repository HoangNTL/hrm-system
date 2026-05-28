import { fireEvent, render, screen } from '@testing-library/react';

import EmployeesPage from '../pages/EmployeesPage.jsx';
import { useEmployees } from '../hooks/useEmployees.js';

vi.mock('../hooks/useEmployees.js', () => ({
  useEmployees: vi.fn(),
}));

const mockDepartments = [
  { id: 1, name: 'IT Department' },
  { id: 2, name: 'HR Department' },
];

const mockPositions = [
  { id: 1, name: 'Software Engineer' },
  { id: 2, name: 'Project Manager' },
];

const mockEmployees = [
  {
    id: 1,
    full_name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '0123456789',
    gender: 'male',
    work_status: 'working',
    department: { name: 'IT Department' },
    position: { name: 'Software Engineer' },
  },
  {
    id: 2,
    full_name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '0987654321',
    gender: 'female',
    work_status: 'probation',
    department: { name: 'HR Department' },
    position: { name: 'Project Manager' },
  },
];

const createMockHookReturn = (overrides = {}) => ({
  employees: mockEmployees,
  loading: false,
  search: '',
  filters: { department_id: '', gender: '', work_status: '' },
  pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
  selectedEmployees: [],
  selectedEmployee: null,
  isModalOpen: false,
  isDeleteModalOpen: false,
  deleteLoading: false,
  isPasswordModalOpen: false,
  passwordModalData: { employeeName: '', email: '', password: '' },
  departments: mockDepartments,
  positions: mockPositions,
  loadingOptions: false,
  modalFormData: {
    full_name: '',
    gender: '',
    dob: '',
    cccd: '',
    phone: '',
    email: '',
    address: '',
    department_id: '',
    position_id: '',
    create_login: false,
  },
  hasActiveFilters: false,
  handleSearch: vi.fn(),
  handleFilterChange: vi.fn(),
  handleClearFilters: vi.fn(),
  handlePageChange: vi.fn(),
  handleRowSelect: vi.fn(),
  handleSelectAll: vi.fn(),
  handleEdit: vi.fn(),
  handleAdd: vi.fn(),
  handleModalClose: vi.fn(),
  handleModalSuccess: vi.fn(),
  handleFormDataChange: vi.fn(),
  handleConfirmDelete: vi.fn(),
  handleCancelDelete: vi.fn(),
  handlePasswordModalClose: vi.fn(),
  ...overrides,
});

describe('EmployeesPage', () => {
  beforeEach(() => {
    vi.mocked(useEmployees).mockReturnValue(createMockHookReturn());
  });

  it('renders header and description', () => {
    render(<EmployeesPage />);

    expect(screen.getByText('Employees')).toBeInTheDocument();
    expect(
      screen.getByText("Manage your organization's employees"),
    ).toBeInTheDocument();
  });

  it('renders edit and add actions', () => {
    render(<EmployeesPage />);

    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
  });

  it('disables edit when no employee is selected', () => {
    render(<EmployeesPage />);

    expect(screen.getByRole('button', { name: /edit/i })).toBeDisabled();
  });

  it('enables edit when one employee is selected', () => {
    vi.mocked(useEmployees).mockReturnValue(
      createMockHookReturn({ selectedEmployees: [mockEmployees[0]] }),
    );

    render(<EmployeesPage />);

    expect(screen.getByRole('button', { name: /edit/i })).not.toBeDisabled();
  });

  it('renders filters and employee count', () => {
    render(<EmployeesPage />);

    expect(
      screen.getByPlaceholderText('Search by name, email, phone, or Identity Number...'),
    ).toBeInTheDocument();
    expect(screen.getByText('2 employees found')).toBeInTheDocument();
    expect(screen.getAllByText('Department').length).toBeGreaterThan(0);
    expect(screen.getByText('Gender')).toBeInTheDocument();
    expect(screen.getByText('Work Status')).toBeInTheDocument();
  });

  it('calls handleAdd when add is clicked', () => {
    const handleAdd = vi.fn();
    vi.mocked(useEmployees).mockReturnValue(createMockHookReturn({ handleAdd }));

    render(<EmployeesPage />);
    fireEvent.click(screen.getByRole('button', { name: /add/i }));

    expect(handleAdd).toHaveBeenCalled();
  });

  it('calls handleEdit when edit is clicked', () => {
    const handleEdit = vi.fn();
    vi.mocked(useEmployees).mockReturnValue(
      createMockHookReturn({
        selectedEmployees: [mockEmployees[0]],
        handleEdit,
      }),
    );

    render(<EmployeesPage />);
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));

    expect(handleEdit).toHaveBeenCalled();
  });

  it('renders delete confirmation modal when open', () => {
    vi.mocked(useEmployees).mockReturnValue(
      createMockHookReturn({
        isDeleteModalOpen: true,
        selectedEmployees: [mockEmployees[0]],
      }),
    );

    render(<EmployeesPage />);

    expect(screen.getByText('Delete Employee')).toBeInTheDocument();
    expect(
      screen.getByText(/Are you sure you want to delete John Doe/),
    ).toBeInTheDocument();
  });
});
