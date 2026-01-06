import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import AttendancePage from '..';
import { useStaffAttendance } from '../useStaffAttendance';
import { useAdminAttendance } from '../useAdminAttendance';

// Mock redux store
const mockStore = (initialState) => ({
  getState: () => initialState,
  subscribe: () => () => {},
  dispatch: () => {},
});

vi.mock('../useStaffAttendance', () => ({
  useStaffAttendance: vi.fn(),
}));

vi.mock('../useAdminAttendance', () => ({
  useAdminAttendance: vi.fn(),
}));

vi.mock('../StaffHeader', () => ({
  default: ({ currentTime }) => (
    <div data-testid="staff-header">
      <span data-testid="current-time">{currentTime?.toISOString()}</span>
    </div>
  ),
}));

vi.mock('../ShiftSelector', () => ({
  default: ({ shifts, selectedShiftId, onShiftChange }) => (
    <div data-testid="shift-selector">
      <span data-testid="selected-shift">{selectedShiftId}</span>
      {shifts.map((shift) => (
        <button key={shift.id} onClick={() => onShiftChange(shift.id)}>
          {shift.name}
        </button>
      ))}
    </div>
  ),
}));

vi.mock('../CheckInOutCard', () => ({
  default: ({ attendance, message, status, loading, onCheckIn, onCheckOut, onClearMessage }) => (
    <div data-testid="checkin-card">
      {loading && <span>Loading...</span>}
      {message && (
        <div data-testid="message" className={status}>
          {message}
          <button onClick={onClearMessage}>Clear</button>
        </div>
      )}
      {attendance ? (
        <div data-testid="attendance-info">
          <span>Check-in: {attendance.check_in}</span>
          {attendance.check_out && <span>Check-out: {attendance.check_out}</span>}
        </div>
      ) : (
        <span>No attendance record</span>
      )}
      <button onClick={onCheckIn} disabled={loading}>
        Check In
      </button>
      <button onClick={onCheckOut} disabled={loading}>
        Check Out
      </button>
    </div>
  ),
}));

vi.mock('../AdminHeader', () => ({
  default: ({ selectedDate, onDateChange, onTodayClick }) => (
    <div data-testid="admin-header">
      <span data-testid="selected-date">{selectedDate}</span>
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => onDateChange(e.target.value)}
        data-testid="date-input"
      />
      <button onClick={onTodayClick}>Today</button>
    </div>
  ),
}));

vi.mock('../SearchFilter', () => ({
  default: ({
    searchText,
    onSearchChange,
    selectedDepartment,
    onDepartmentChange,
    departments,
  }) => (
    <div data-testid="search-filter">
      <input
        type="text"
        value={searchText}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search..."
        data-testid="search-input"
      />
      <select
        value={selectedDepartment}
        onChange={onDepartmentChange}
        data-testid="department-select"
      >
        <option value="">All Departments</option>
        {departments.map((dept) => (
          <option key={dept} value={dept}>
            {dept}
          </option>
        ))}
      </select>
    </div>
  ),
}));

vi.mock('../EmployeeList', () => ({
  default: ({ loading, employees, expandedEmployee, onToggleExpanded }) => (
    <div data-testid="employee-list">
      {loading ? (
        <span>Loading employees...</span>
      ) : employees.length === 0 ? (
        <span>No employees found</span>
      ) : (
        employees.map((emp) => (
          <div key={emp.employee.id} data-testid={`employee-${emp.employee.id}`}>
            <button onClick={() => onToggleExpanded(emp.employee.id)}>
              {emp.employee.full_name}
            </button>
            {expandedEmployee === emp.employee.id && (
              <span data-testid="expanded-details">Details expanded</span>
            )}
          </div>
        ))
      )}
    </div>
  ),
}));

vi.mock('@/components/EditAttendanceModal', () => ({
  default: ({ isOpen, onClose, onSuccess }) =>
    isOpen ? (
      <div data-testid="edit-modal">
        <button onClick={onClose}>Close</button>
        <button onClick={onSuccess}>Save</button>
      </div>
    ) : null,
}));

const mockShifts = [
  { id: 1, name: 'Morning Shift', start_time: '08:00', end_time: '12:00' },
  { id: 2, name: 'Afternoon Shift', start_time: '13:00', end_time: '17:00' },
];

const mockAttendance = {
  id: 1,
  check_in: '2025-01-15T08:00:00',
  check_out: null,
  status: 'on-time',
};

const createMockStaffHookReturn = (overrides = {}) => ({
  attendance: mockAttendance,
  currentTime: new Date('2025-01-15T10:30:00'),
  shift: mockShifts[0],
  loading: false,
  message: '',
  status: '',
  shifts: mockShifts,
  selectedShiftId: 1,
  modalOpen: false,
  setSelectedShiftId: vi.fn(),
  setMessage: vi.fn(),
  setModalOpen: vi.fn(),
  handleCheckIn: vi.fn(),
  handleCheckOut: vi.fn(),
  fetchTodayStatus: vi.fn(),
  ...overrides,
});

const mockEmployees = [
  {
    employee: {
      id: 1,
      full_name: 'John Doe',
      email: 'john@example.com',
      department: { name: 'IT' },
    },
    records: [{ id: 1, check_in: '08:00', check_out: '17:00', status: 'on-time' }],
  },
  {
    employee: {
      id: 2,
      full_name: 'Jane Smith',
      email: 'jane@example.com',
      department: { name: 'HR' },
    },
    records: [{ id: 2, check_in: '08:15', check_out: null, status: 'late' }],
  },
];

const createMockAdminHookReturn = (overrides = {}) => ({
  selectedDate: '2025-01-15',
  records: mockEmployees,
  loading: false,
  expandedEmployee: null,
  editModal: { isOpen: false, record: null, checkIn: '', checkOut: '', notes: '' },
  deleteConfirm: { isOpen: false, recordId: null, employeeName: '' },
  deleteLoading: false,
  searchText: '',
  selectedDepartment: '',
  today: '2025-01-15',
  departments: ['IT', 'HR', 'Finance'],
  filteredEmployees: mockEmployees,
  setSelectedDate: vi.fn(),
  setExpandedEmployee: vi.fn(),
  setEditModal: vi.fn(),
  setDeleteConfirm: vi.fn(),
  setSearchText: vi.fn(),
  setSelectedDepartment: vi.fn(),
  handleSaveEdit: vi.fn(),
  handleConfirmDelete: vi.fn(),
  ...overrides,
});

describe('AttendancePage', () => {
  describe('Role-based Rendering', () => {
    beforeEach(() => {
      vi.mocked(useStaffAttendance).mockReturnValue(createMockStaffHookReturn());
      vi.mocked(useAdminAttendance).mockReturnValue(createMockAdminHookReturn());
    });

    it('renders StaffAttendanceView for STAFF role', () => {
      const store = mockStore({ user: { user: { role: 'STAFF' } } });

      render(
        <Provider store={store}>
          <AttendancePage />
        </Provider>,
      );

      expect(screen.getByTestId('staff-header')).toBeInTheDocument();
      expect(screen.getByTestId('checkin-card')).toBeInTheDocument();
    });

    it('renders AdminAttendanceView for ADMIN role', () => {
      const store = mockStore({ user: { user: { role: 'ADMIN' } } });

      render(
        <Provider store={store}>
          <AttendancePage />
        </Provider>,
      );

      expect(screen.getByTestId('admin-header')).toBeInTheDocument();
      expect(screen.getByTestId('employee-list')).toBeInTheDocument();
    });

    it('renders AdminAttendanceView for HR role', () => {
      const store = mockStore({ user: { user: { role: 'HR' } } });

      render(
        <Provider store={store}>
          <AttendancePage />
        </Provider>,
      );

      expect(screen.getByTestId('admin-header')).toBeInTheDocument();
    });
  });

  describe('Staff Attendance View', () => {
    const renderStaffView = (hookOverrides = {}) => {
      vi.mocked(useStaffAttendance).mockReturnValue(createMockStaffHookReturn(hookOverrides));
      const store = mockStore({ user: { user: { role: 'STAFF' } } });
      return render(
        <Provider store={store}>
          <AttendancePage />
        </Provider>,
      );
    };

    it('renders shift selector', () => {
      renderStaffView();

      expect(screen.getByTestId('shift-selector')).toBeInTheDocument();
    });

    it('displays selected shift', () => {
      renderStaffView({ selectedShiftId: 1 });

      expect(screen.getByTestId('selected-shift')).toHaveTextContent('1');
    });

    it('calls setSelectedShiftId when shift is changed', () => {
      const setSelectedShiftId = vi.fn();
      renderStaffView({ setSelectedShiftId });

      fireEvent.click(screen.getByText('Afternoon Shift'));

      expect(setSelectedShiftId).toHaveBeenCalledWith(2);
    });

    it('renders check-in/out card', () => {
      renderStaffView();

      expect(screen.getByTestId('checkin-card')).toBeInTheDocument();
    });

    it('displays attendance info when available', () => {
      renderStaffView({ attendance: mockAttendance });

      expect(screen.getByTestId('attendance-info')).toBeInTheDocument();
    });

    it('shows no attendance message when no record', () => {
      renderStaffView({ attendance: null });

      expect(screen.getByText('No attendance record')).toBeInTheDocument();
    });

    it('calls handleCheckIn when Check In button is clicked', () => {
      const handleCheckIn = vi.fn();
      renderStaffView({ handleCheckIn });

      fireEvent.click(screen.getByText('Check In'));

      expect(handleCheckIn).toHaveBeenCalled();
    });

    it('calls handleCheckOut when Check Out button is clicked', () => {
      const handleCheckOut = vi.fn();
      renderStaffView({ handleCheckOut });

      fireEvent.click(screen.getByText('Check Out'));

      expect(handleCheckOut).toHaveBeenCalled();
    });

    it('displays message when available', () => {
      renderStaffView({ message: 'Check-in successful', status: 'success' });

      expect(screen.getByTestId('message')).toHaveTextContent('Check-in successful');
    });

    it('shows loading state', () => {
      renderStaffView({ loading: true });

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Admin Attendance View', () => {
    const renderAdminView = (hookOverrides = {}) => {
      vi.mocked(useAdminAttendance).mockReturnValue(createMockAdminHookReturn(hookOverrides));
      const store = mockStore({ user: { user: { role: 'ADMIN' } } });
      return render(
        <Provider store={store}>
          <AttendancePage />
        </Provider>,
      );
    };

    it('renders admin header with date selector', () => {
      renderAdminView();

      expect(screen.getByTestId('admin-header')).toBeInTheDocument();
      expect(screen.getByTestId('selected-date')).toHaveTextContent('2025-01-15');
    });

    it('calls setSelectedDate when date is changed', () => {
      const setSelectedDate = vi.fn();
      renderAdminView({ setSelectedDate });

      fireEvent.change(screen.getByTestId('date-input'), {
        target: { value: '2025-01-20' },
      });

      expect(setSelectedDate).toHaveBeenCalledWith('2025-01-20');
    });

    it('calls setSelectedDate with today when Today button is clicked', () => {
      const setSelectedDate = vi.fn();
      renderAdminView({ setSelectedDate, today: '2025-01-15' });

      fireEvent.click(screen.getByText('Today'));

      expect(setSelectedDate).toHaveBeenCalledWith('2025-01-15');
    });

    it('renders search filter when records exist', () => {
      renderAdminView();

      expect(screen.getByTestId('search-filter')).toBeInTheDocument();
    });

    it('does not render search filter when no records', () => {
      renderAdminView({ records: [], filteredEmployees: [] });

      expect(screen.queryByTestId('search-filter')).not.toBeInTheDocument();
    });

    it('calls setSearchText when search input changes', () => {
      const setSearchText = vi.fn();
      renderAdminView({ setSearchText });

      fireEvent.change(screen.getByTestId('search-input'), {
        target: { value: 'John' },
      });

      expect(setSearchText).toHaveBeenCalledWith('John');
    });

    it('renders employee list', () => {
      renderAdminView();

      expect(screen.getByTestId('employee-list')).toBeInTheDocument();
    });

    it('displays employees', () => {
      renderAdminView();

      expect(screen.getByTestId('employee-1')).toBeInTheDocument();
      expect(screen.getByTestId('employee-2')).toBeInTheDocument();
    });

    it('shows loading state for employee list', () => {
      renderAdminView({ loading: true });

      expect(screen.getByText('Loading employees...')).toBeInTheDocument();
    });

    it('shows empty state when no employees', () => {
      renderAdminView({ filteredEmployees: [] });

      expect(screen.getByText('No employees found')).toBeInTheDocument();
    });

    it('expands employee details when clicked', () => {
      const setExpandedEmployee = vi.fn();
      renderAdminView({ setExpandedEmployee });

      fireEvent.click(screen.getByText('John Doe'));

      expect(setExpandedEmployee).toHaveBeenCalled();
    });

    it('shows expanded details when employee is expanded', () => {
      renderAdminView({ expandedEmployee: 1 });

      expect(screen.getByTestId('expanded-details')).toBeInTheDocument();
    });
  });
});
