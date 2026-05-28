import { render, screen } from '@testing-library/react';

import ApproveAttendanceRequestsPage from '../pages/ApproveAttendanceRequestsPage.jsx';
import { useApproveAttendanceRequests } from '../hooks/useApproveAttendanceRequests.js';

vi.mock('../hooks/useApproveAttendanceRequests.js', () => ({
  useApproveAttendanceRequests: vi.fn(),
}));

vi.mock('../components/ApproveRequestList.jsx', () => ({
  default: ({ requests }) => <div>{requests.length} pending requests</div>,
}));

const createMockHookReturn = (overrides = {}) => ({
  requests: [{ id: 1 }, { id: 2 }, { id: 3 }],
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

  it('renders title and pending count', () => {
    render(<ApproveAttendanceRequestsPage />);
    expect(screen.getByText('Approve attendance correction requests')).toBeInTheDocument();
    expect(screen.getByText('There are 3 requests pending approval')).toBeInTheDocument();
  });

  it('renders request list content', () => {
    render(<ApproveAttendanceRequestsPage />);
    expect(screen.getByText('3 pending requests')).toBeInTheDocument();
  });
});
