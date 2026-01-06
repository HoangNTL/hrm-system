import { render, screen, fireEvent } from '@testing-library/react';
import ApproveAttendanceRequestsPage from '..';
import { useApproveAttendanceRequests } from '../useApproveAttendanceRequests';

vi.mock('../useApproveAttendanceRequests', () => ({
  useApproveAttendanceRequests: vi.fn(),
}));

vi.mock('../RequestList', () => ({
  default: ({
    requests,
    loading,
    expandedId,
    actionLoading,
    notes,
    onToggleExpanded,
    onUpdateNotes,
    onApprove,
    onReject,
  }) => (
    <div data-testid="request-list">
      {loading ? (
        <span>Loading requests...</span>
      ) : requests.length === 0 ? (
        <span>No pending requests</span>
      ) : (
        requests.map((request) => (
          <div key={request.id} data-testid={`request-item-${request.id}`}>
            <button onClick={() => onToggleExpanded(request.id)}>
              {request.employee?.full_name || 'Unknown'}
            </button>
            <span>{request.request_type}</span>
            <span>{request.status}</span>
            {expandedId === request.id && (
              <div data-testid={`expanded-${request.id}`}>
                <textarea
                  data-testid={`notes-${request.id}`}
                  value={notes[request.id] || ''}
                  onChange={(e) => onUpdateNotes(request.id, e.target.value)}
                  placeholder="Admin notes..."
                />
                <button
                  onClick={() => onApprove(request.id)}
                  disabled={actionLoading === request.id}
                >
                  {actionLoading === request.id ? 'Processing...' : 'Approve'}
                </button>
                <button
                  onClick={() => onReject(request.id)}
                  disabled={actionLoading === request.id}
                >
                  {actionLoading === request.id ? 'Processing...' : 'Reject'}
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  ),
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
    employee: { id: 1, full_name: 'John Doe' },
    request_type: 'check_in',
    status: 'pending',
    requested_date: '2025-01-15',
    reason: 'Forgot to check in',
    new_check_in: '2025-01-15T08:00:00',
  },
  {
    id: 2,
    employee: { id: 2, full_name: 'Jane Smith' },
    request_type: 'check_out',
    status: 'pending',
    requested_date: '2025-01-14',
    reason: 'System error',
    new_check_out: '2025-01-14T17:30:00',
  },
  {
    id: 3,
    employee: { id: 3, full_name: 'Bob Wilson' },
    request_type: 'both',
    status: 'pending',
    requested_date: '2025-01-13',
    reason: 'Working from home',
  },
];

const createMockHookReturn = (overrides = {}) => ({
  requests: mockRequests,
  loading: false,
  expandedId: null,
  page: 1,
  total: 3,
  totalPages: 1,
  actionLoading: null,
  notes: {},
  toggleExpanded: vi.fn(),
  handlePageChange: vi.fn(),
  handleApprove: vi.fn(),
  handleReject: vi.fn(),
  updateNotes: vi.fn(),
  ...overrides,
});

describe('ApproveAttendanceRequestsPage', () => {
  beforeEach(() => {
    vi.mocked(useApproveAttendanceRequests).mockReturnValue(createMockHookReturn());
  });

  describe('Page Header', () => {
    it('renders page title', () => {
      render(<ApproveAttendanceRequestsPage />);

      expect(screen.getByText('Approve attendance correction requests')).toBeInTheDocument();
    });

    it('renders pending requests count', () => {
      render(<ApproveAttendanceRequestsPage />);

      expect(screen.getByText('There are 3 requests pending approval')).toBeInTheDocument();
    });

    it('updates count when total changes', () => {
      vi.mocked(useApproveAttendanceRequests).mockReturnValue(createMockHookReturn({ total: 10 }));

      render(<ApproveAttendanceRequestsPage />);

      expect(screen.getByText('There are 10 requests pending approval')).toBeInTheDocument();
    });

    it('shows zero count when no requests', () => {
      vi.mocked(useApproveAttendanceRequests).mockReturnValue(
        createMockHookReturn({ total: 0, requests: [] }),
      );

      render(<ApproveAttendanceRequestsPage />);

      expect(screen.getByText('There are 0 requests pending approval')).toBeInTheDocument();
    });
  });

  describe('Request List', () => {
    it('renders request list', () => {
      render(<ApproveAttendanceRequestsPage />);

      expect(screen.getByTestId('request-list')).toBeInTheDocument();
    });

    it('shows loading state', () => {
      vi.mocked(useApproveAttendanceRequests).mockReturnValue(
        createMockHookReturn({ loading: true }),
      );

      render(<ApproveAttendanceRequestsPage />);

      expect(screen.getByText('Loading requests...')).toBeInTheDocument();
    });

    it('renders all request items', () => {
      render(<ApproveAttendanceRequestsPage />);

      expect(screen.getByTestId('request-item-1')).toBeInTheDocument();
      expect(screen.getByTestId('request-item-2')).toBeInTheDocument();
      expect(screen.getByTestId('request-item-3')).toBeInTheDocument();
    });

    it('shows empty state when no requests', () => {
      vi.mocked(useApproveAttendanceRequests).mockReturnValue(
        createMockHookReturn({ requests: [] }),
      );

      render(<ApproveAttendanceRequestsPage />);

      expect(screen.getByText('No pending requests')).toBeInTheDocument();
    });

    it('displays employee names', () => {
      render(<ApproveAttendanceRequestsPage />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
    });
  });

  describe('Expand/Collapse', () => {
    it('calls toggleExpanded when request is clicked', () => {
      const toggleExpanded = vi.fn();
      vi.mocked(useApproveAttendanceRequests).mockReturnValue(
        createMockHookReturn({ toggleExpanded }),
      );

      render(<ApproveAttendanceRequestsPage />);

      fireEvent.click(screen.getByText('John Doe'));

      expect(toggleExpanded).toHaveBeenCalledWith(1);
    });

    it('shows expanded details when expandedId matches', () => {
      vi.mocked(useApproveAttendanceRequests).mockReturnValue(
        createMockHookReturn({ expandedId: 1 }),
      );

      render(<ApproveAttendanceRequestsPage />);

      expect(screen.getByTestId('expanded-1')).toBeInTheDocument();
    });

    it('does not show expanded details for non-expanded items', () => {
      vi.mocked(useApproveAttendanceRequests).mockReturnValue(
        createMockHookReturn({ expandedId: 1 }),
      );

      render(<ApproveAttendanceRequestsPage />);

      expect(screen.queryByTestId('expanded-2')).not.toBeInTheDocument();
      expect(screen.queryByTestId('expanded-3')).not.toBeInTheDocument();
    });
  });

  describe('Notes', () => {
    it('renders notes textarea when expanded', () => {
      vi.mocked(useApproveAttendanceRequests).mockReturnValue(
        createMockHookReturn({ expandedId: 1 }),
      );

      render(<ApproveAttendanceRequestsPage />);

      expect(screen.getByTestId('notes-1')).toBeInTheDocument();
    });

    it('displays existing notes value', () => {
      vi.mocked(useApproveAttendanceRequests).mockReturnValue(
        createMockHookReturn({
          expandedId: 1,
          notes: { 1: 'Some admin note' },
        }),
      );

      render(<ApproveAttendanceRequestsPage />);

      expect(screen.getByTestId('notes-1')).toHaveValue('Some admin note');
    });

    it('calls updateNotes when notes are changed', () => {
      const updateNotes = vi.fn();
      vi.mocked(useApproveAttendanceRequests).mockReturnValue(
        createMockHookReturn({ expandedId: 1, updateNotes }),
      );

      render(<ApproveAttendanceRequestsPage />);

      fireEvent.change(screen.getByTestId('notes-1'), {
        target: { value: 'New note' },
      });

      expect(updateNotes).toHaveBeenCalledWith(1, 'New note');
    });
  });

  describe('Approve Action', () => {
    it('renders Approve button when expanded', () => {
      vi.mocked(useApproveAttendanceRequests).mockReturnValue(
        createMockHookReturn({ expandedId: 1 }),
      );

      render(<ApproveAttendanceRequestsPage />);

      expect(screen.getByText('Approve')).toBeInTheDocument();
    });

    it('calls handleApprove when Approve button is clicked', () => {
      const handleApprove = vi.fn();
      vi.mocked(useApproveAttendanceRequests).mockReturnValue(
        createMockHookReturn({ expandedId: 1, handleApprove }),
      );

      render(<ApproveAttendanceRequestsPage />);

      fireEvent.click(screen.getByText('Approve'));

      expect(handleApprove).toHaveBeenCalledWith(1);
    });

    it('shows processing state during approve action', () => {
      vi.mocked(useApproveAttendanceRequests).mockReturnValue(
        createMockHookReturn({ expandedId: 1, actionLoading: 1 }),
      );

      render(<ApproveAttendanceRequestsPage />);

      expect(screen.getAllByText('Processing...').length).toBeGreaterThan(0);
    });

    it('disables buttons during action loading', () => {
      vi.mocked(useApproveAttendanceRequests).mockReturnValue(
        createMockHookReturn({ expandedId: 1, actionLoading: 1 }),
      );

      render(<ApproveAttendanceRequestsPage />);

      const buttons = screen.getAllByRole('button');
      const actionButtons = buttons.filter((btn) => btn.textContent === 'Processing...');
      actionButtons.forEach((btn) => {
        expect(btn).toBeDisabled();
      });
    });
  });

  describe('Reject Action', () => {
    it('renders Reject button when expanded', () => {
      vi.mocked(useApproveAttendanceRequests).mockReturnValue(
        createMockHookReturn({ expandedId: 1 }),
      );

      render(<ApproveAttendanceRequestsPage />);

      expect(screen.getByText('Reject')).toBeInTheDocument();
    });

    it('calls handleReject when Reject button is clicked', () => {
      const handleReject = vi.fn();
      vi.mocked(useApproveAttendanceRequests).mockReturnValue(
        createMockHookReturn({ expandedId: 1, handleReject }),
      );

      render(<ApproveAttendanceRequestsPage />);

      fireEvent.click(screen.getByText('Reject'));

      expect(handleReject).toHaveBeenCalledWith(1);
    });
  });

  describe('Pagination', () => {
    it('does not render pagination when totalPages is 1', () => {
      render(<ApproveAttendanceRequestsPage />);

      expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
    });

    it('renders pagination when totalPages > 1', () => {
      vi.mocked(useApproveAttendanceRequests).mockReturnValue(
        createMockHookReturn({ totalPages: 3 }),
      );

      render(<ApproveAttendanceRequestsPage />);

      expect(screen.getByTestId('pagination')).toBeInTheDocument();
    });

    it('displays current page', () => {
      vi.mocked(useApproveAttendanceRequests).mockReturnValue(
        createMockHookReturn({ page: 2, totalPages: 3 }),
      );

      render(<ApproveAttendanceRequestsPage />);

      expect(screen.getByTestId('current-page')).toHaveTextContent('2');
    });

    it('displays total pages', () => {
      vi.mocked(useApproveAttendanceRequests).mockReturnValue(
        createMockHookReturn({ page: 1, totalPages: 5 }),
      );

      render(<ApproveAttendanceRequestsPage />);

      expect(screen.getByTestId('total-pages')).toHaveTextContent('5');
    });

    it('calls handlePageChange when Next is clicked', () => {
      const handlePageChange = vi.fn();
      vi.mocked(useApproveAttendanceRequests).mockReturnValue(
        createMockHookReturn({ page: 1, totalPages: 3, handlePageChange }),
      );

      render(<ApproveAttendanceRequestsPage />);

      fireEvent.click(screen.getByText('Next'));

      expect(handlePageChange).toHaveBeenCalledWith(2);
    });

    it('calls handlePageChange when Previous is clicked', () => {
      const handlePageChange = vi.fn();
      vi.mocked(useApproveAttendanceRequests).mockReturnValue(
        createMockHookReturn({ page: 2, totalPages: 3, handlePageChange }),
      );

      render(<ApproveAttendanceRequestsPage />);

      fireEvent.click(screen.getByText('Previous'));

      expect(handlePageChange).toHaveBeenCalledWith(1);
    });

    it('disables Previous button on first page', () => {
      vi.mocked(useApproveAttendanceRequests).mockReturnValue(
        createMockHookReturn({ page: 1, totalPages: 3 }),
      );

      render(<ApproveAttendanceRequestsPage />);

      expect(screen.getByText('Previous')).toBeDisabled();
    });

    it('disables Next button on last page', () => {
      vi.mocked(useApproveAttendanceRequests).mockReturnValue(
        createMockHookReturn({ page: 3, totalPages: 3 }),
      );

      render(<ApproveAttendanceRequestsPage />);

      expect(screen.getByText('Next')).toBeDisabled();
    });
  });
});
