import { render, screen, fireEvent } from '@testing-library/react';
import DepartmentsPage from '..';
import { useDepartmentsPage } from '../useDepartmentsPage';

vi.mock('../useDepartmentsPage', () => ({
  useDepartmentsPage: vi.fn(),
}));

const mockDepartments = [
  { id: 1, name: 'IT Department', code: 'IT', description: 'Information Technology', status: true },
  { id: 2, name: 'HR Department', code: 'HR', description: 'Human Resources', status: true },
  {
    id: 3,
    name: 'Sales Department',
    code: 'SALES',
    description: 'Sales and Marketing',
    status: false,
  },
];

const createMockHookReturn = (overrides = {}) => ({
  // state
  departments: mockDepartments,
  loading: false,
  search: '',
  pagination: { page: 1, limit: 10, total: 3, totalPages: 1 },
  isModalOpen: false,
  selectedDepartments: [],
  selectedDepartment: null,
  isDeleteModalOpen: false,
  deleteLoading: false,
  modalFormData: {
    name: '',
    code: '',
    description: '',
    status: true,
  },

  // handlers
  handleSearch: vi.fn(),
  handlePageChange: vi.fn(),
  handleRowSelect: vi.fn(),
  handleSelectAll: vi.fn(),
  handleEdit: vi.fn(),
  handleAdd: vi.fn(),
  handleModalClose: vi.fn(),
  handleModalSuccess: vi.fn(),
  handleFormDataChange: vi.fn(),
  handleDelete: vi.fn(),
  handleConfirmDelete: vi.fn(),
  handleCancelDelete: vi.fn(),
  ...overrides,
});

describe('DepartmentsPage', () => {
  beforeEach(() => {
    vi.mocked(useDepartmentsPage).mockReturnValue(createMockHookReturn());
  });

  it('renders page header with title and description', () => {
    render(<DepartmentsPage />);

    expect(screen.getByText('Departments')).toBeInTheDocument();
    expect(screen.getByText("Manage your organization's departments")).toBeInTheDocument();
  });

  it('renders action buttons (Edit, Delete, Add)', () => {
    render(<DepartmentsPage />);

    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
  });

  it('disables Edit button when no department is selected', () => {
    render(<DepartmentsPage />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    expect(editButton).toBeDisabled();
  });

  it('disables Delete button when no department is selected', () => {
    render(<DepartmentsPage />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    expect(deleteButton).toBeDisabled();
  });

  it('enables Edit button when exactly one department is selected', () => {
    vi.mocked(useDepartmentsPage).mockReturnValue(
      createMockHookReturn({
        selectedDepartments: [mockDepartments[0]],
      }),
    );

    render(<DepartmentsPage />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    expect(editButton).not.toBeDisabled();
  });

  it('disables Edit button when multiple departments are selected', () => {
    vi.mocked(useDepartmentsPage).mockReturnValue(
      createMockHookReturn({
        selectedDepartments: [mockDepartments[0], mockDepartments[1]],
      }),
    );

    render(<DepartmentsPage />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    expect(editButton).toBeDisabled();
  });

  it('enables Delete button when at least one department is selected', () => {
    vi.mocked(useDepartmentsPage).mockReturnValue(
      createMockHookReturn({
        selectedDepartments: [mockDepartments[0]],
      }),
    );

    render(<DepartmentsPage />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    expect(deleteButton).not.toBeDisabled();
  });

  it('renders search bar with correct placeholder', () => {
    render(<DepartmentsPage />);

    expect(screen.getByPlaceholderText('Search by department name or code...')).toBeInTheDocument();
  });

  it('renders department count text', () => {
    render(<DepartmentsPage />);

    expect(screen.getByText('3 departments found')).toBeInTheDocument();
  });

  it('renders singular department text when only one department', () => {
    vi.mocked(useDepartmentsPage).mockReturnValue(
      createMockHookReturn({
        departments: [mockDepartments[0]],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      }),
    );

    render(<DepartmentsPage />);

    expect(screen.getByText('1 department found')).toBeInTheDocument();
  });

  it('calls handleAdd when Add button is clicked', () => {
    const handleAdd = vi.fn();
    vi.mocked(useDepartmentsPage).mockReturnValue(createMockHookReturn({ handleAdd }));

    render(<DepartmentsPage />);

    fireEvent.click(screen.getByRole('button', { name: /add/i }));
    expect(handleAdd).toHaveBeenCalled();
  });

  it('calls handleEdit when Edit button is clicked', () => {
    const handleEdit = vi.fn();
    vi.mocked(useDepartmentsPage).mockReturnValue(
      createMockHookReturn({
        selectedDepartments: [mockDepartments[0]],
        handleEdit,
      }),
    );

    render(<DepartmentsPage />);

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(handleEdit).toHaveBeenCalled();
  });

  it('calls handleDelete when Delete button is clicked', () => {
    const handleDelete = vi.fn();
    vi.mocked(useDepartmentsPage).mockReturnValue(
      createMockHookReturn({
        selectedDepartments: [mockDepartments[0]],
        handleDelete,
      }),
    );

    render(<DepartmentsPage />);

    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(handleDelete).toHaveBeenCalled();
  });

  it('renders delete confirmation modal when isDeleteModalOpen is true', () => {
    vi.mocked(useDepartmentsPage).mockReturnValue(
      createMockHookReturn({
        isDeleteModalOpen: true,
        selectedDepartments: [mockDepartments[0]],
      }),
    );

    render(<DepartmentsPage />);

    expect(screen.getByText('Delete Department')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete IT Department/)).toBeInTheDocument();
  });

  it('renders delete confirmation modal with plural message for multiple selections', () => {
    vi.mocked(useDepartmentsPage).mockReturnValue(
      createMockHookReturn({
        isDeleteModalOpen: true,
        selectedDepartments: [mockDepartments[0], mockDepartments[1]],
      }),
    );

    render(<DepartmentsPage />);

    expect(screen.getByText(/Are you sure you want to delete 2 departments/)).toBeInTheDocument();
  });

  it('enables Delete button when multiple departments are selected', () => {
    vi.mocked(useDepartmentsPage).mockReturnValue(
      createMockHookReturn({
        selectedDepartments: [mockDepartments[0], mockDepartments[1]],
      }),
    );

    render(<DepartmentsPage />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    expect(deleteButton).not.toBeDisabled();
  });
});
