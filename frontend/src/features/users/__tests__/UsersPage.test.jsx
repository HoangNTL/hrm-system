import { fireEvent, render, screen } from '@testing-library/react';

import UsersPage from '../pages/UsersPage.jsx';
import { useUsers } from '../hooks/useUsers.js';

vi.mock('../hooks/useUsers.js', () => ({
  useUsers: vi.fn(),
}));

vi.mock('../components/UserTable.jsx', () => ({
  default: () => <div>UserTable</div>,
}));

const mockUsers = [
  { id: 1, email: 'user1@example.com', is_locked: false, role: 'ADMIN' },
  { id: 2, email: 'user2@example.com', is_locked: true, role: 'STAFF' },
];

const createMockHookReturn = (overrides = {}) => ({
  users: mockUsers,
  employeesWithoutUser: [{ id: 1, full_name: 'John Doe' }],
  loading: false,
  search: '',
  roleFilter: '',
  pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
  selectedUsers: [],
  isModalOpen: false,
  formData: { role: 'STAFF', employee_id: '' },
  fieldErrors: {},
  globalError: '',
  saveLoading: false,
  resetPasswordLoading: false,
  toggleLockLoading: false,
  hasActiveFilters: false,
  roleOptions: [
    { value: '', label: 'All Roles' },
    { value: 'ADMIN', label: 'Admin' },
    { value: 'HR', label: 'HR' },
    { value: 'STAFF', label: 'Staff' },
  ],
  handleSearch: vi.fn(),
  handleRoleFilterChange: vi.fn(),
  handleClearFilters: vi.fn(),
  handlePageChange: vi.fn(),
  handleRowSelect: vi.fn(),
  handleSelectAll: vi.fn(),
  handleRowDoubleClick: vi.fn(),
  handleAdd: vi.fn(),
  handleModalClose: vi.fn(),
  handleFormChange: vi.fn(),
  handleCreateUserSubmit: vi.fn(),
  handleResetPassword: vi.fn(),
  handleToggleLock: vi.fn(),
  ...overrides,
});

describe('UsersPage', () => {
  beforeEach(() => {
    vi.mocked(useUsers).mockReturnValue(createMockHookReturn());
  });

  it('renders page header and description', () => {
    render(<UsersPage />);

    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(
      screen.getByText('Manage user accounts, roles, and security settings'),
    ).toBeInTheDocument();
  });

  it('renders action buttons', () => {
    render(<UsersPage />);

    expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /lock/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
  });

  it('disables reset password when not exactly one user is selected', () => {
    render(<UsersPage />);

    expect(screen.getByRole('button', { name: /reset password/i })).toBeDisabled();
  });

  it('enables reset password when exactly one user is selected', () => {
    vi.mocked(useUsers).mockReturnValue(
      createMockHookReturn({ selectedUsers: [mockUsers[0]] }),
    );

    render(<UsersPage />);

    expect(screen.getByRole('button', { name: /reset password/i })).not.toBeDisabled();
  });

  it('renders search and total count', () => {
    render(<UsersPage />);

    expect(screen.getByPlaceholderText('Search by email...')).toBeInTheDocument();
    expect(screen.getByText('2 users')).toBeInTheDocument();
  });

  it('calls handleAdd when add is clicked', () => {
    const handleAdd = vi.fn();
    vi.mocked(useUsers).mockReturnValue(createMockHookReturn({ handleAdd }));

    render(<UsersPage />);
    fireEvent.click(screen.getByRole('button', { name: /add/i }));

    expect(handleAdd).toHaveBeenCalled();
  });

  it('calls handleResetPassword when reset password is clicked', () => {
    const handleResetPassword = vi.fn();
    vi.mocked(useUsers).mockReturnValue(
      createMockHookReturn({
        selectedUsers: [mockUsers[0]],
        handleResetPassword,
      }),
    );

    render(<UsersPage />);
    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

    expect(handleResetPassword).toHaveBeenCalled();
  });

  it('calls handleClearFilters when clear filters is clicked', () => {
    const handleClearFilters = vi.fn();
    vi.mocked(useUsers).mockReturnValue(
      createMockHookReturn({
        hasActiveFilters: true,
        handleClearFilters,
      }),
    );

    render(<UsersPage />);
    fireEvent.click(screen.getByRole('button', { name: /clear filters/i }));

    expect(handleClearFilters).toHaveBeenCalled();
  });
});
