import { render, screen, fireEvent } from '@testing-library/react';
import UsersPage from '..';
vi.mock('../UserTable', () => ({ default: () => <div>UserTable</div> }));
vi.mock('../UserModal', () => ({ default: () => <div>UserModal</div> }));
vi.mock('../UserQuickViewModal', () => ({ default: () => <div>UserQuickViewModal</div> }));
import { useUsersPage } from '../useUsersPage';

vi.mock('../useUsersPage', () => ({
  useUsersPage: vi.fn(),
}));

const mockUsers = [
  {
    id: 1,
    email: 'user1@example.com',
    is_locked: false,
    role: 'admin',
  },
  {
    id: 2,
    email: 'user2@example.com',
    is_locked: true,
    role: 'user',
  },
];

const mockEmployeesWithoutUser = [
  { id: 1, full_name: 'John Doe' },
  { id: 2, full_name: 'Jane Smith' },
];

const mockRoleOptions = [
  { value: '', label: 'All Roles' },
  { value: 'admin', label: 'Admin' },
  { value: 'user', label: 'User' },
];

const createMockHookReturn = (overrides = {}) => ({
  users: mockUsers,
  employeesWithoutUser: mockEmployeesWithoutUser,
  loading: false,
  search: '',
  roleFilter: '',
  pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
  selectedUsers: [],
  isModalOpen: false,
  isQuickViewOpen: false,
  quickViewUser: null,
  resetPasswordLoading: false,
  toggleLockLoading: false,
  hasActiveFilters: false,
  roleOptions: mockRoleOptions,
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

  it('renders page header with title and description', () => {
    render(<UsersPage />);
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Manage user accounts, roles, and security settings')).toBeInTheDocument();
  });

  it('renders action buttons (Reset Password, Lock/Unlock, Add)', () => {
    render(<UsersPage />);
    expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /lock/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
  });

  it('disables Reset Password button when not exactly one user is selected', () => {
    render(<UsersPage />);
    const resetBtn = screen.getByRole('button', { name: /reset password/i });
    expect(resetBtn).toBeDisabled();
  });

  it('enables Reset Password button when exactly one user is selected', () => {
    vi.mocked(useUsersPage).mockReturnValue(createMockHookReturn({ selectedUsers: [mockUsers[0]] }));
    render(<UsersPage />);
    const resetBtn = screen.getByRole('button', { name: /reset password/i });
    expect(resetBtn).not.toBeDisabled();
  });

  it('renders search bar with correct placeholder', () => {
    render(<UsersPage />);
    expect(screen.getByPlaceholderText('Search by email...')).toBeInTheDocument();
  });

  it('renders user count text', () => {
    render(<UsersPage />);
    expect(screen.getByText('2 users')).toBeInTheDocument();
  });

  it('renders filter select for roles', () => {
    render(<UsersPage />);
    expect(screen.getByText('All Roles')).toBeInTheDocument();
  });

  it('renders Clear Filters button', () => {
    render(<UsersPage />);
    expect(screen.getByRole('button', { name: /clear filters/i })).toBeInTheDocument();
  });

  it('disables Clear Filters button when no active filters', () => {
    render(<UsersPage />);
    const clearBtn = screen.getByRole('button', { name: /clear filters/i });
    expect(clearBtn).toBeDisabled();
  });

  it('enables Clear Filters button when has active filters', () => {
    vi.mocked(useUsersPage).mockReturnValue(createMockHookReturn({ hasActiveFilters: true }));
    render(<UsersPage />);
    const clearBtn = screen.getByRole('button', { name: /clear filters/i });
    expect(clearBtn).not.toBeDisabled();
  });

  it('calls handleAdd when Add button is clicked', () => {
    const handleAdd = vi.fn();
    vi.mocked(useUsersPage).mockReturnValue(createMockHookReturn({ handleAdd }));
    render(<UsersPage />);
    fireEvent.click(screen.getByRole('button', { name: /add/i }));
    expect(handleAdd).toHaveBeenCalled();
  });

  it('calls handleResetPassword when Reset Password button is clicked', () => {
    const handleResetPassword = vi.fn();
    vi.mocked(useUsersPage).mockReturnValue(createMockHookReturn({ selectedUsers: [mockUsers[0]], handleResetPassword }));
    render(<UsersPage />);
    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));
    expect(handleResetPassword).toHaveBeenCalled();
  });

  it('calls handleClearFilters when Clear Filters button is clicked', () => {
    const handleClearFilters = vi.fn();
    vi.mocked(useUsersPage).mockReturnValue(createMockHookReturn({ hasActiveFilters: true, handleClearFilters }));
    render(<UsersPage />);
    fireEvent.click(screen.getByRole('button', { name: /clear filters/i }));
    expect(handleClearFilters).toHaveBeenCalled();
  });
});
