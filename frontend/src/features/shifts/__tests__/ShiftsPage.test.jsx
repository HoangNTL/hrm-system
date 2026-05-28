import { render, screen } from '@testing-library/react';

import ShiftsPage from '../pages/ShiftsPage.jsx';
import { useShifts } from '../hooks/useShifts.js';

vi.mock('../hooks/useShifts.js', () => ({
  useShifts: vi.fn(),
}));

const createMockHookReturn = (overrides = {}) => ({
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
  ...overrides,
});

describe('ShiftsPage', () => {
  beforeEach(() => {
    vi.mocked(useShifts).mockReturnValue(createMockHookReturn());
  });

  it('renders header and description', () => {
    render(<ShiftsPage />);
    expect(screen.getByText('Shifts')).toBeInTheDocument();
    expect(screen.getByText('Manage working shifts')).toBeInTheDocument();
  });

  it('renders action buttons', () => {
    render(<ShiftsPage />);
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
  });

  it('renders search and count', () => {
    render(<ShiftsPage />);
    expect(screen.getByPlaceholderText('Search shifts...')).toBeInTheDocument();
    expect(screen.getByText(/1 record/i)).toBeInTheDocument();
  });
});
