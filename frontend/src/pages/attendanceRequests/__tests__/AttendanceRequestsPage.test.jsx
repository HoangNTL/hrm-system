import { render, screen, fireEvent } from '@testing-library/react';
import AttendanceRequestsPage from '..';
import { useAttendanceRequests } from '../useAttendanceRequests';

vi.mock('../useAttendanceRequests', () => ({
  useAttendanceRequests: vi.fn(),
}));

vi.mock('../StatusFilter', () => ({
  default: ({ statusFilter, onFilterChange }) => (
    <div data-testid="status-filter">
      <button onClick={() => onFilterChange('')}>All</button>
      <button onClick={() => onFilterChange('pending')}>Pending</button>
      <button onClick={() => onFilterChange('approved')}>Approved</button>
      <button onClick={() => onFilterChange('rejected')}>Rejected</button>
      <span data-testid="current-filter">{statusFilter || 'all'}</span>
    </div>
  ),
}));

vi.mock('../RequestList', () => ({
  default: ({ requests, loading, expandedId, onToggleExpanded }) => (
    <div data-testid="request-list">
      {loading ? (
        <span>Loading requests...</span>
      ) : requests.length === 0 ? (
        <span>No requests found</span>
      ) : (
        requests.map((request) => (
          <div
            key={request.id}
            data-testid={`request-item-${request.id}`}
            onClick={() => onToggleExpanded(request.id)}
          >
            <span>{request.request_type}</span>
            <span>{request.status}</span>
            {expandedId === request.id && <span data-testid="expanded-details">Details</span>}
          </div>
        ))
      )}
    </div>
  ),
}));

vi.mock('@/components/EditAttendanceModal', () => ({
  default: ({ isOpen, onClose, attendanceRecord, onSuccess }) =>
    isOpen ? (
      <div data-testid="edit-attendance-modal">
        <span data-testid="modal-attendance">{attendanceRecord?.id || 'new'}</span>
        <button onClick={onClose}>Close Modal</button>
        <button onClick={onSuccess}>Save</button>
      </div>
    ) : null,
}));

vi.mock('@components/ui/Pagination', () => ({
  default: ({ currentPage, totalPages, onPageChange }) => (
    <div data-testid="pagination">
      <span data-testid="current-page">{currentPage}</span>
      <span data-testid="total-pages">{totalPages}</span>
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1}>
        Previous
      </button>
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages}>
        Next
      </button>
    </div>
  ),
}));

const mockRequests = [
  {
    id: 1,
    request_type: 'check_in',
    status: 'pending',
    requested_date: '2025-01-15',
    reason: 'Forgot to check in',
    new_check_in: '2025-01-15T08:00:00',
  },
  {
    id: 2,
    request_type: 'check_out',
    status: 'approved',
    requested_date: '2025-01-14',
    reason: 'System error',
    new_check_out: '2025-01-14T17:30:00',
  },
  {
    id: 3,
    request_type: 'both',
    status: 'rejected',
    requested_date: '2025-01-13',
    reason: 'Working from home',
    admin_note: 'Not eligible',
  },
];

const createMockHookReturn = (overrides = {}) => ({
  requests: mockRequests,
  loading: false,
  expandedId: null,
  statusFilter: '',
  page: 1,
  totalPages: 1,
  modalOpen: false,
  selectedAttendance: null,
  toggleExpanded: vi.fn(),
  handleFilterChange: vi.fn(),
  handlePageChange: vi.fn(),
  openModal: vi.fn(),
  closeModal: vi.fn(),
  fetchRequests: vi.fn(),
  ...overrides,
});

describe('AttendanceRequestsPage', () => {
  beforeEach(() => {
    vi.mocked(useAttendanceRequests).mockReturnValue(createMockHookReturn());
  });

  describe('Page Header', () => {
    it('renders page title', () => {
      render(<AttendanceRequestsPage />);

      expect(screen.getByText('Attendance correction requests')).toBeInTheDocument();
    });

    it('renders page description', () => {
      render(<AttendanceRequestsPage />);

      expect(screen.getByText('Manage your attendance correction requests.')).toBeInTheDocument();
    });

    it('renders New request button', () => {
      render(<AttendanceRequestsPage />);

      expect(screen.getByRole('button', { name: /new request/i })).toBeInTheDocument();
    });

    it('calls openModal when New request button is clicked', () => {
      const openModal = vi.fn();
      vi.mocked(useAttendanceRequests).mockReturnValue(createMockHookReturn({ openModal }));

      render(<AttendanceRequestsPage />);

      fireEvent.click(screen.getByRole('button', { name: /new request/i }));

      expect(openModal).toHaveBeenCalled();
    });
  });

  describe('Status Filter', () => {
    it('renders status filter', () => {
      render(<AttendanceRequestsPage />);

      expect(screen.getByTestId('status-filter')).toBeInTheDocument();
    });

    it('calls handleFilterChange when filter is changed', () => {
      const handleFilterChange = vi.fn();
      vi.mocked(useAttendanceRequests).mockReturnValue(
        createMockHookReturn({ handleFilterChange }),
      );

      render(<AttendanceRequestsPage />);

      fireEvent.click(screen.getByText('Pending'));

      expect(handleFilterChange).toHaveBeenCalledWith('pending');
    });

    it('calls handleFilterChange with empty string for All filter', () => {
      const handleFilterChange = vi.fn();
      vi.mocked(useAttendanceRequests).mockReturnValue(
        createMockHookReturn({ handleFilterChange }),
      );

      render(<AttendanceRequestsPage />);

      fireEvent.click(screen.getByText('All'));

      expect(handleFilterChange).toHaveBeenCalledWith('');
    });
  });

  describe('Request List', () => {
    it('renders request list', () => {
      render(<AttendanceRequestsPage />);

      expect(screen.getByTestId('request-list')).toBeInTheDocument();
    });

    it('shows loading state', () => {
      vi.mocked(useAttendanceRequests).mockReturnValue(createMockHookReturn({ loading: true }));

      render(<AttendanceRequestsPage />);

      expect(screen.getByText('Loading requests...')).toBeInTheDocument();
    });

    it('renders request items', () => {
      render(<AttendanceRequestsPage />);

      expect(screen.getByTestId('request-item-1')).toBeInTheDocument();
      expect(screen.getByTestId('request-item-2')).toBeInTheDocument();
      expect(screen.getByTestId('request-item-3')).toBeInTheDocument();
    });

    it('shows empty state when no requests', () => {
      vi.mocked(useAttendanceRequests).mockReturnValue(createMockHookReturn({ requests: [] }));

      render(<AttendanceRequestsPage />);

      expect(screen.getByText('No requests found')).toBeInTheDocument();
    });

    it('calls toggleExpanded when request item is clicked', () => {
      const toggleExpanded = vi.fn();
      vi.mocked(useAttendanceRequests).mockReturnValue(createMockHookReturn({ toggleExpanded }));

      render(<AttendanceRequestsPage />);

      fireEvent.click(screen.getByTestId('request-item-1'));

      expect(toggleExpanded).toHaveBeenCalledWith(1);
    });

    it('shows expanded details when expandedId matches', () => {
      vi.mocked(useAttendanceRequests).mockReturnValue(createMockHookReturn({ expandedId: 1 }));

      render(<AttendanceRequestsPage />);

      expect(screen.getByTestId('expanded-details')).toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
    it('does not render pagination when totalPages is 1', () => {
      render(<AttendanceRequestsPage />);

      expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
    });

    it('renders pagination when totalPages > 1', () => {
      vi.mocked(useAttendanceRequests).mockReturnValue(createMockHookReturn({ totalPages: 3 }));

      render(<AttendanceRequestsPage />);

      expect(screen.getByTestId('pagination')).toBeInTheDocument();
    });

    it('displays current page', () => {
      vi.mocked(useAttendanceRequests).mockReturnValue(
        createMockHookReturn({ page: 2, totalPages: 3 }),
      );

      render(<AttendanceRequestsPage />);

      expect(screen.getByTestId('current-page')).toHaveTextContent('2');
    });

    it('calls handlePageChange when Next is clicked', () => {
      const handlePageChange = vi.fn();
      vi.mocked(useAttendanceRequests).mockReturnValue(
        createMockHookReturn({ page: 1, totalPages: 3, handlePageChange }),
      );

      render(<AttendanceRequestsPage />);

      fireEvent.click(screen.getByText('Next'));

      expect(handlePageChange).toHaveBeenCalledWith(2);
    });

    it('calls handlePageChange when Previous is clicked', () => {
      const handlePageChange = vi.fn();
      vi.mocked(useAttendanceRequests).mockReturnValue(
        createMockHookReturn({ page: 2, totalPages: 3, handlePageChange }),
      );

      render(<AttendanceRequestsPage />);

      fireEvent.click(screen.getByText('Previous'));

      expect(handlePageChange).toHaveBeenCalledWith(1);
    });
  });

  describe('Edit Attendance Modal', () => {
    it('does not render modal when modalOpen is false', () => {
      render(<AttendanceRequestsPage />);

      expect(screen.queryByTestId('edit-attendance-modal')).not.toBeInTheDocument();
    });

    it('renders modal when modalOpen is true', () => {
      vi.mocked(useAttendanceRequests).mockReturnValue(createMockHookReturn({ modalOpen: true }));

      render(<AttendanceRequestsPage />);

      expect(screen.getByTestId('edit-attendance-modal')).toBeInTheDocument();
    });

    it('shows "new" when no selectedAttendance', () => {
      vi.mocked(useAttendanceRequests).mockReturnValue(
        createMockHookReturn({ modalOpen: true, selectedAttendance: null }),
      );

      render(<AttendanceRequestsPage />);

      expect(screen.getByTestId('modal-attendance')).toHaveTextContent('new');
    });

    it('shows attendance id when selectedAttendance exists', () => {
      vi.mocked(useAttendanceRequests).mockReturnValue(
        createMockHookReturn({
          modalOpen: true,
          selectedAttendance: { id: 123 },
        }),
      );

      render(<AttendanceRequestsPage />);

      expect(screen.getByTestId('modal-attendance')).toHaveTextContent('123');
    });

    it('calls closeModal when Close button is clicked', () => {
      const closeModal = vi.fn();
      vi.mocked(useAttendanceRequests).mockReturnValue(
        createMockHookReturn({ modalOpen: true, closeModal }),
      );

      render(<AttendanceRequestsPage />);

      fireEvent.click(screen.getByText('Close Modal'));

      expect(closeModal).toHaveBeenCalled();
    });

    it('calls fetchRequests when Save is clicked (onSuccess)', () => {
      const fetchRequests = vi.fn();
      vi.mocked(useAttendanceRequests).mockReturnValue(
        createMockHookReturn({ modalOpen: true, fetchRequests }),
      );

      render(<AttendanceRequestsPage />);

      fireEvent.click(screen.getByText('Save'));

      expect(fetchRequests).toHaveBeenCalled();
    });
  });
});
