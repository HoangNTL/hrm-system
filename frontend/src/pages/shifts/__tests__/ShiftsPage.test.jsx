import { render, screen } from '@testing-library/react';
import ShiftsPage from '..';
import { useShiftsPage } from '../useShiftsPage';

vi.mock('../useShiftsPage', () => ({
  useShiftsPage: vi.fn(),
}));

const createMockHookReturn = (overrides = {}) => ({
  // state
  shifts: [
    {
      id: 1,
      shift_name: 'Morning Shift',
      start_time: '08:00',
      end_time: '12:00',
      early_check_in_minutes: 15,
      late_checkout_minutes: 15,
    },
  ],
  loading: false,
  search: '',
  pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
  selectedShifts: [],
  selectedShift: null,
  isModalOpen: false,
  isDeleteModalOpen: false,
  deleteLoading: false,
  modalFormData: {
    shift_name: '',
    start_time: '',
    end_time: '',
    early_check_in_minutes: 15,
    late_checkout_minutes: 15,
  },

  // handlers
  handleSearch: vi.fn(),
  handlePageChange: vi.fn(),
  handleRowSelect: vi.fn(),
  handleSelectAll: vi.fn(),
  handleEdit: vi.fn(),
  handleAdd: vi.fn(),
  handleFormDataChange: vi.fn(),
  handleModalSuccess: vi.fn(),
  handleModalClose: vi.fn(),
  handleDelete: vi.fn(),
  handleConfirmDelete: vi.fn(),
  handleCancelDelete: vi.fn(),
  ...overrides,
});

describe('ShiftsPage', () => {
  beforeEach(() => {
    vi.mocked(useShiftsPage).mockReturnValue(createMockHookReturn());
  });
  it('renders header, description, and actions', () => {
    render(<ShiftsPage />);

    expect(screen.getByText('Shifts')).toBeInTheDocument();
    expect(screen.getByText('Manage working shifts')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Add')).toBeInTheDocument();
  });

  it('disables Edit when not exactly one shift is selected', () => {
    render(<ShiftsPage />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    expect(editButton).toBeDisabled();
  });

  it('disables Delete when no shift is selected', () => {
    render(<ShiftsPage />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    expect(deleteButton).toBeDisabled();
  });

  it('shows search bar and record count text', () => {
    render(<ShiftsPage />);

    const searchInput = screen.getByPlaceholderText('Search shifts...');
    expect(searchInput).toBeInTheDocument();

    expect(screen.getByText(/1 record/i)).toBeInTheDocument();
  });

  it('enables Edit and Delete when appropriate selection is provided', () => {
    const selectedShift = {
      id: 1,
      shift_name: 'Morning Shift',
      start_time: '08:00',
      end_time: '12:00',
      early_check_in_minutes: 15,
      late_checkout_minutes: 15,
    };

    vi.mocked(useShiftsPage).mockReturnValue(
      createMockHookReturn({
        selectedShifts: [selectedShift],
        selectedShift: selectedShift,
      }),
    );

    render(<ShiftsPage />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    const deleteButton = screen.getByRole('button', { name: /delete/i });

    expect(editButton).not.toBeDisabled();
    expect(deleteButton).not.toBeDisabled();
  });
});
