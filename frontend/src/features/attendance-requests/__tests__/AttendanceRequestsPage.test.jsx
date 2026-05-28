import { fireEvent, render, screen } from '@testing-library/react';

import AttendanceRequestsPage from '../pages/AttendanceRequestsPage.jsx';
import { useAttendanceRequests } from '../hooks/useAttendanceRequests.js';

vi.mock('../hooks/useAttendanceRequests.js', () => ({
  useAttendanceRequests: vi.fn(),
}));

vi.mock('../components/StatusFilter.jsx', () => ({
  default: ({ onFilterChange }) => (
    <button onClick={() => onFilterChange('pending')}>Pending</button>
  ),
}));

vi.mock('../components/AttendanceRequestList.jsx', () => ({
  default: ({ requests }) => <div>{requests.length} requests</div>,
}));

vi.mock('@/components/EditAttendanceModal', () => ({
  default: ({ isOpen }) => (isOpen ? <div>EditAttendanceModal</div> : null),
}));

const createMockHookReturn = (overrides = {}) => ({
  requests: [{ id: 1 }, { id: 2 }],
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

  it('renders title and description', () => {
    render(<AttendanceRequestsPage />);
    expect(screen.getByText('Attendance correction requests')).toBeInTheDocument();
    expect(screen.getByText('Manage your attendance correction requests.')).toBeInTheDocument();
  });

  it('calls openModal when new request is clicked', () => {
    const openModal = vi.fn();
    vi.mocked(useAttendanceRequests).mockReturnValue(createMockHookReturn({ openModal }));
    render(<AttendanceRequestsPage />);
    fireEvent.click(screen.getByRole('button', { name: /new request/i }));
    expect(openModal).toHaveBeenCalled();
  });

  it('calls handleFilterChange when pending filter is clicked', () => {
    const handleFilterChange = vi.fn();
    vi.mocked(useAttendanceRequests).mockReturnValue(
      createMockHookReturn({ handleFilterChange }),
    );
    render(<AttendanceRequestsPage />);
    fireEvent.click(screen.getByText('Pending'));
    expect(handleFilterChange).toHaveBeenCalledWith('pending');
  });
});
