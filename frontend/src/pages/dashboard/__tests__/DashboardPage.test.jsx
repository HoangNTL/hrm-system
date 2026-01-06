import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import DashboardPage from '..';
import { useAdminDashboard } from '../useAdminDashboard';
import { useStaffDashboard } from '../useStaffDashboard';

// Mock redux store
const mockStore = (initialState) => ({
  getState: () => initialState,
  subscribe: () => () => {},
  dispatch: () => {},
});

vi.mock('../useAdminDashboard', () => ({
  useAdminDashboard: vi.fn(),
}));

vi.mock('../useStaffDashboard', () => ({
  useStaffDashboard: vi.fn(),
}));

const mockAdminStats = {
  totalEmployees: 150,
  totalDepartments: 10,
  presentToday: 120,
  lateToday: 15,
  absentToday: 15,
  onLeaveToday: 5,
  pendingRequests: 3,
};

const mockAttendanceTrends = [
  { day: 'Mon', onTime: 100, late: 10, absent: 5 },
  { day: 'Tue', onTime: 105, late: 8, absent: 7 },
  { day: 'Wed', onTime: 110, late: 12, absent: 3 },
  { day: 'Thu', onTime: 95, late: 15, absent: 10 },
  { day: 'Fri', onTime: 108, late: 9, absent: 8 },
  { day: 'Sat', onTime: 50, late: 5, absent: 60 },
  { day: 'Sun', onTime: 45, late: 3, absent: 67 },
];

const mockStaffProfile = {
  employee: {
    full_name: 'John Doe',
    gender: 'male',
    address: '123 Main St',
    email: 'john.doe@example.com',
    phone: '0123456789',
    department: { name: 'IT Department' },
    position: { name: 'Software Engineer' },
  },
};

const mockStaffStats = {
  workDays: 22,
  lateCount: 2,
  onTimeRate: 90,
  upcomingPayroll: 15000000,
  attendanceRequests: {
    pending: 1,
    approved: 5,
    rejected: 0,
  },
};

const createMockAdminHookReturn = (overrides = {}) => ({
  stats: mockAdminStats,
  attendanceTrends: mockAttendanceTrends,
  loading: false,
  ...overrides,
});

const createMockStaffHookReturn = (overrides = {}) => ({
  user: { role: 'STAFF' },
  profile: mockStaffProfile,
  stats: mockStaffStats,
  recentAttendance: [],
  attendanceTrends: mockAttendanceTrends,
  loading: false,
  formatDate: vi.fn((date) => date),
  getStatusColor: vi.fn(() => 'green'),
  getStatusLabel: vi.fn((status) => status),
  formatMillions: vi.fn((value) => `${value / 1000000}M`),
  ...overrides,
});

describe('DashboardPage', () => {
  describe('Admin Dashboard', () => {
    beforeEach(() => {
      vi.mocked(useAdminDashboard).mockReturnValue(createMockAdminHookReturn());
      vi.mocked(useStaffDashboard).mockReturnValue(createMockStaffHookReturn());
    });

    const renderWithAdminRole = () => {
      const store = mockStore({
        user: { user: { role: 'ADMIN' } },
      });
      return render(
        <Provider store={store}>
          <MemoryRouter>
            <DashboardPage />
          </MemoryRouter>
        </Provider>,
      );
    };

    it('renders dashboard title and description for admin', () => {
      renderWithAdminRole();

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText(/Welcome back!/)).toBeInTheDocument();
    });

    it('renders stats cards for admin', () => {
      renderWithAdminRole();

      expect(screen.getByText('Total Employees')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('Departments')).toBeInTheDocument();
      // 10 appears multiple times (in stats card and chart)
      expect(screen.getAllByText('10').length).toBeGreaterThan(0);
    });

    it('renders present and absent today stats', () => {
      renderWithAdminRole();

      expect(screen.getByText('Present Today')).toBeInTheDocument();
      expect(screen.getByText('Absent Today')).toBeInTheDocument();
    });

    it('renders attendance overview section', () => {
      renderWithAdminRole();

      expect(screen.getByText("Today's Attendance Overview")).toBeInTheDocument();
      // These texts appear multiple times (in overview and chart legend)
      expect(screen.getAllByText('On Time').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Late').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Absent').length).toBeGreaterThan(0);
    });

    it('renders attendance trends section', () => {
      renderWithAdminRole();

      expect(screen.getByText('Attendance Trends (Last 7 Days)')).toBeInTheDocument();
    });

    it('renders loading state for admin', () => {
      vi.mocked(useAdminDashboard).mockReturnValue(createMockAdminHookReturn({ loading: true }));

      renderWithAdminRole();

      expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
    });
  });

  describe('Staff Dashboard', () => {
    beforeEach(() => {
      vi.mocked(useAdminDashboard).mockReturnValue(createMockAdminHookReturn());
      vi.mocked(useStaffDashboard).mockReturnValue(createMockStaffHookReturn());
    });

    const renderWithStaffRole = () => {
      const store = mockStore({
        user: { user: { role: 'STAFF' } },
      });
      return render(
        <Provider store={store}>
          <MemoryRouter>
            <DashboardPage />
          </MemoryRouter>
        </Provider>,
      );
    };

    it('renders employee information card for staff', () => {
      renderWithStaffRole();

      expect(screen.getByText('Employee Information')).toBeInTheDocument();
    });

    it('renders employee details', () => {
      renderWithStaffRole();

      expect(screen.getByText('Full Name')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Position')).toBeInTheDocument();
      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    });

    it('renders department info for staff', () => {
      renderWithStaffRole();

      // Department label should appear
      expect(screen.getAllByText('Department').length).toBeGreaterThan(0);
      expect(screen.getByText('IT Department')).toBeInTheDocument();
    });

    it('renders work days stats for staff', () => {
      renderWithStaffRole();

      expect(screen.getByText('Work Days This Month')).toBeInTheDocument();
      expect(screen.getByText('22')).toBeInTheDocument();
    });

    it('renders loading state for staff', () => {
      vi.mocked(useStaffDashboard).mockReturnValue(createMockStaffHookReturn({ loading: true }));

      renderWithStaffRole();

      expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
    });

    it('renders employee not found message when no employee record', () => {
      vi.mocked(useStaffDashboard).mockReturnValue(createMockStaffHookReturn({ profile: {} }));

      renderWithStaffRole();

      expect(screen.getByText('Employee Record Not Found')).toBeInTheDocument();
    });

    it('renders initials in avatar for staff', () => {
      renderWithStaffRole();

      // John Doe should show "JD" initials
      expect(screen.getByText('JD')).toBeInTheDocument();
    });
  });

  describe('Role-based rendering', () => {
    beforeEach(() => {
      vi.mocked(useAdminDashboard).mockReturnValue(createMockAdminHookReturn());
      vi.mocked(useStaffDashboard).mockReturnValue(createMockStaffHookReturn());
    });

    it('shows admin dashboard for HR role', () => {
      const store = mockStore({
        user: { user: { role: 'HR' } },
      });
      render(
        <Provider store={store}>
          <MemoryRouter>
            <DashboardPage />
          </MemoryRouter>
        </Provider>,
      );

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Total Employees')).toBeInTheDocument();
    });

    it('shows staff dashboard for STAFF role', () => {
      const store = mockStore({
        user: { user: { role: 'STAFF' } },
      });
      render(
        <Provider store={store}>
          <MemoryRouter>
            <DashboardPage />
          </MemoryRouter>
        </Provider>,
      );

      expect(screen.getByText('Employee Information')).toBeInTheDocument();
    });
  });
});
