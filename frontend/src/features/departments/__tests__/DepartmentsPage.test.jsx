import { fireEvent, render, screen } from '@testing-library/react';

import DepartmentsPage from '../pages/DepartmentsPage.jsx';
import { useDepartments } from '../hooks/useDepartments.js';

vi.mock('../hooks/useDepartments.js', () => ({
  useDepartments: vi.fn(),
}));

const mockDepartments = [
  { id: 1, name: 'IT Department', code: 'IT' },
  { id: 2, name: 'HR Department', code: 'HR' },
];

const createMockHookReturn = (overrides = {}) => ({
  departments: mockDepartments,
  loading: false,
  search: '',
  pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
  isModalOpen: false,
  selectedDepartments: [],
  selectedDepartment: null,
  isDeleteModalOpen: false,
  deleteLoading: false,
  modalFormData: { name: '', code: '', description: '', status: true },
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
    vi.mocked(useDepartments).mockReturnValue(createMockHookReturn());
  });

  it('renders title and description', () => {
    render(<DepartmentsPage />);
    expect(screen.getByText('Departments')).toBeInTheDocument();
    expect(
      screen.getByText("Manage your organization's departments"),
    ).toBeInTheDocument();
  });

  it('renders edit, delete, and add actions', () => {
    render(<DepartmentsPage />);
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
  });

  it('renders search and count', () => {
    render(<DepartmentsPage />);
    expect(
      screen.getByPlaceholderText('Search by department name or code...'),
    ).toBeInTheDocument();
    expect(screen.getByText('2 departments found')).toBeInTheDocument();
  });

  it('calls handleAdd when add is clicked', () => {
    const handleAdd = vi.fn();
    vi.mocked(useDepartments).mockReturnValue(createMockHookReturn({ handleAdd }));
    render(<DepartmentsPage />);
    fireEvent.click(screen.getByRole('button', { name: /add/i }));
    expect(handleAdd).toHaveBeenCalled();
  });

  it('calls handleDelete when delete is clicked', () => {
    const handleDelete = vi.fn();
    vi.mocked(useDepartments).mockReturnValue(
      createMockHookReturn({
        selectedDepartments: [mockDepartments[0]],
        handleDelete,
      }),
    );
    render(<DepartmentsPage />);
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(handleDelete).toHaveBeenCalled();
  });
});
