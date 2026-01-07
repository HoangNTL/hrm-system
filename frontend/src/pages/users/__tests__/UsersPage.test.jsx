import { render, screen } from '@testing-library/react';
import UsersPage from '..';
import { useUsersPage } from '../useUsersPage';

vi.mock('../useUsersPage', () => ({
  useUsersPage: vi.fn(),
}));

const createMockHookReturn = (overrides = {}) => ({
  // state
  users: [{ id: 1, email: 'user1@example.com', is_locked: false }],
  employeesWithoutUser: [],
  loading: false,
  search: '',
  roleFilter: '',
  pagination: { page: 1, total: 1, totalPages: 1 },
  selectedUsers: [],
  isModalOpen: false,
  isQuickViewOpen: false,
  quickViewUser: null,
  resetPasswordLoading: false,
  toggleLockLoading: false,
  hasActiveFilters: false,
  roleOptions: [
    { value: '', label: 'All roles' },
    { value: 'ADMIN', label: 'Admin' },
  ],

  // handlers
  handleSearch: vi.fn(),
  handleRoleFilterChange: vi.fn(),
  handleClearFilters: vi.fn(),
  handlePageChange: vi.fn(),
  handleRowSelect: vi.fn(),
  handleSelectAll: vi.fn(),
  handleRowDoubleClick: vi.fn(),
  handleAdd: vi.fn(),
  handleResetPassword: vi.fn(),
  handleToggleLock: vi.fn(),
  handleModalSuccess: vi.fn(),
  handleModalClose: vi.fn(),
  handleQuickViewClose: vi.fn(),
  ...overrides,
});

describe('UsersPage', () => {
  beforeEach(() => {
    vi.mocked(useUsersPage).mockReturnValue(createMockHookReturn());
  });
  it('renders header and actions', () => {
    render(<UsersPage />);

    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(
      screen.getByText('Manage user accounts, roles, and security settings'),
    ).toBeInTheDocument();
    expect(screen.getByText('Reset Password')).toBeInTheDocument();
    expect(screen.getByText('Lock')).toBeInTheDocument();
    expect(screen.getByText('Add')).toBeInTheDocument();
  });

  it('disables Reset Password and Lock buttons when no user is selected', () => {
    render(<UsersPage />);

    const resetButton = screen.getByRole('button', { name: /reset password/i });
    const lockButton = screen.getByRole('button', { name: /lock/i });

    expect(resetButton).toBeDisabled();
    expect(lockButton).toBeDisabled();
  });

  it('shows search bar and role select filter', () => {
    render(<UsersPage />);

    // Search input
    const searchInput = screen.getByPlaceholderText('Search by email...');
    expect(searchInput).toBeInTheDocument();

    // Role select (combobox)
    const roleSelect = screen.getByRole('combobox');
    expect(roleSelect).toBeInTheDocument();
  });

  it('shows users count text', () => {
    render(<UsersPage />);

    expect(screen.getByText(/1 users/i)).toBeInTheDocument();
  });

  it('enables Reset Password when exactly one user is selected', () => {
    // Mock hook with one selected user
    vi.mocked(useUsersPage).mockReturnValue(
      createMockHookReturn({
        selectedUsers: [{ id: 1, email: 'user1@example.com', is_locked: false }],
      }),
    );

    render(<UsersPage />);

    const resetButton = screen.getByRole('button', { name: /reset password/i });
    expect(resetButton).not.toBeDisabled();
  });
});
