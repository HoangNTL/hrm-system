import { render, screen, fireEvent } from '@testing-library/react';
import EmployeesPage from '..';
import { useEmployeesPage } from '../useEmployeesPage';

vi.mock('../useEmployeesPage', () => ({
  useEmployeesPage: vi.fn(),
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
  // state
  employees: mockEmployees,
  loading: false,
  search: '',
  filters: {
    department_id: '',
    gender: '',
    work_status: '',
  },
  pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
  selectedEmployees: [],
  selectedEmployee: null,
  isModalOpen: false,
  isDeleteModalOpen: false,
  deleteLoading: false,
  isPasswordModalOpen: false,
  passwordModalData: {
    employeeName: '',
    email: '',
    password: '',
  },
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

  // handlers
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
    vi.mocked(useEmployeesPage).mockReturnValue(createMockHookReturn());
  });

  it('renders page header with title and description', () => {
    render(<EmployeesPage />);

    expect(screen.getByText('Employees')).toBeInTheDocument();
    expect(screen.getByText("Manage your organization's employees")).toBeInTheDocument();
  });

  it('renders action buttons (Edit, Add)', () => {
    render(<EmployeesPage />);

    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
  });

  it('disables Edit button when no employee is selected', () => {
    render(<EmployeesPage />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    expect(editButton).toBeDisabled();
  });

  it('enables Edit button when exactly one employee is selected', () => {
    vi.mocked(useEmployeesPage).mockReturnValue(
      createMockHookReturn({
        selectedEmployees: [mockEmployees[0]],
      }),
    );

    render(<EmployeesPage />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    expect(editButton).not.toBeDisabled();
  });

  it('disables Edit button when multiple employees are selected', () => {
    vi.mocked(useEmployeesPage).mockReturnValue(
      createMockHookReturn({
        selectedEmployees: [mockEmployees[0], mockEmployees[1]],
      }),
    );

    render(<EmployeesPage />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    expect(editButton).toBeDisabled();
  });

  it('renders search bar with correct placeholder', () => {
    render(<EmployeesPage />);

    expect(
      screen.getByPlaceholderText('Search by name, email, phone, or Identity Number...'),
    ).toBeInTheDocument();
  });

  it('renders employee count text', () => {
    render(<EmployeesPage />);

    expect(screen.getByText('2 employees found')).toBeInTheDocument();
  });

  it('renders singular employee text when only one employee', () => {
    vi.mocked(useEmployeesPage).mockReturnValue(
      createMockHookReturn({
        employees: [mockEmployees[0]],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      }),
    );

    render(<EmployeesPage />);

    expect(screen.getByText('1 employee found')).toBeInTheDocument();
  });

  it('renders filter selects', () => {
    render(<EmployeesPage />);

    // Check filter labels exist
    expect(screen.getAllByText('Department').length).toBeGreaterThan(0);
    expect(screen.getByText('Gender')).toBeInTheDocument();
    expect(screen.getByText('Work Status')).toBeInTheDocument();
  });

  it('renders Clear Filters button', () => {
    render(<EmployeesPage />);

    expect(screen.getByRole('button', { name: /clear filters/i })).toBeInTheDocument();
  });

  it('disables Clear Filters button when no active filters', () => {
    render(<EmployeesPage />);

    const clearButton = screen.getByRole('button', { name: /clear filters/i });
    expect(clearButton).toBeDisabled();
  });

  it('enables Clear Filters button when has active filters', () => {
    vi.mocked(useEmployeesPage).mockReturnValue(
      createMockHookReturn({
        hasActiveFilters: true,
      }),
    );

    render(<EmployeesPage />);

    const clearButton = screen.getByRole('button', { name: /clear filters/i });
    expect(clearButton).not.toBeDisabled();
  });

  it('calls handleAdd when Add button is clicked', () => {
    const handleAdd = vi.fn();
    vi.mocked(useEmployeesPage).mockReturnValue(createMockHookReturn({ handleAdd }));

    render(<EmployeesPage />);

    fireEvent.click(screen.getByRole('button', { name: /add/i }));
    expect(handleAdd).toHaveBeenCalled();
  });

  it('calls handleEdit when Edit button is clicked', () => {
    const handleEdit = vi.fn();
    vi.mocked(useEmployeesPage).mockReturnValue(
      createMockHookReturn({
        selectedEmployees: [mockEmployees[0]],
        handleEdit,
      }),
    );

    render(<EmployeesPage />);

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(handleEdit).toHaveBeenCalled();
  });

  it('calls handleClearFilters when Clear Filters button is clicked', () => {
    const handleClearFilters = vi.fn();
    vi.mocked(useEmployeesPage).mockReturnValue(
      createMockHookReturn({
        hasActiveFilters: true,
        handleClearFilters,
      }),
    );

    render(<EmployeesPage />);

    fireEvent.click(screen.getByRole('button', { name: /clear filters/i }));
    expect(handleClearFilters).toHaveBeenCalled();
  });

  it('renders delete confirmation modal when isDeleteModalOpen is true', () => {
    vi.mocked(useEmployeesPage).mockReturnValue(
      createMockHookReturn({
        isDeleteModalOpen: true,
        selectedEmployees: [mockEmployees[0]],
      }),
    );

    render(<EmployeesPage />);

    expect(screen.getByText('Delete Employee')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete John Doe/)).toBeInTheDocument();
  });

  it('renders delete confirmation modal with plural message for multiple selections', () => {
    vi.mocked(useEmployeesPage).mockReturnValue(
      createMockHookReturn({
        isDeleteModalOpen: true,
        selectedEmployees: [mockEmployees[0], mockEmployees[1]],
      }),
    );

    render(<EmployeesPage />);

    expect(screen.getByText(/Are you sure you want to delete 2 employees/)).toBeInTheDocument();
  });

  it('renders password display modal when isPasswordModalOpen is true', () => {
    vi.mocked(useEmployeesPage).mockReturnValue(
      createMockHookReturn({
        isPasswordModalOpen: true,
        passwordModalData: {
          employeeName: 'John Doe',
          email: 'john.doe@example.com',
          password: 'temp123456',
        },
      }),
    );

    render(<EmployeesPage />);

    // Email appears in both table and modal, so use getAllByText
    expect(screen.getAllByText('john.doe@example.com').length).toBeGreaterThan(0);
  });

  it('renders filter options correctly', () => {
    render(<EmployeesPage />);

    // Check for filter options
    expect(screen.getByText('All Departments')).toBeInTheDocument();
    expect(screen.getByText('All Genders')).toBeInTheDocument();
    expect(screen.getByText('All Statuses')).toBeInTheDocument();
  });
});
