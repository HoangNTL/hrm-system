import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import PayrollPage from '..';
import { useHRPayrollPage, useStaffPayslip } from '../usePayrollPage';

// Mock redux store
const mockStore = (initialState) => ({
  getState: () => initialState,
  subscribe: () => () => {},
  dispatch: () => {},
});

vi.mock('../usePayrollPage', () => ({
  useHRPayrollPage: vi.fn(),
  useStaffPayslip: vi.fn(),
}));

const mockDepartments = [
  { id: 1, name: 'IT Department' },
  { id: 2, name: 'HR Department' },
  { id: 3, name: 'Sales Department' },
];

const mockPayrollRows = [
  {
    id: 1,
    employee: { full_name: 'John Doe', department: { name: 'IT Department' } },
    contract: { salary: 15000000 },
    totals: { totalHours: 160, lateMinutes: 30, absentCount: 1 },
    hourlyRate: 93750,
    gross: 15000000,
    net: 13500000,
  },
  {
    id: 2,
    employee: { full_name: 'Jane Smith', department: { name: 'HR Department' } },
    contract: { salary: 12000000 },
    totals: { totalHours: 168, lateMinutes: 0, absentCount: 0 },
    hourlyRate: 71429,
    gross: 12000000,
    net: 10800000,
  },
];

const mockStaffPayslip = {
  employee: {
    full_name: 'John Doe',
    email: 'john.doe@example.com',
    department: { name: 'IT Department' },
  },
  contract: { salary: 15000000 },
  totals: { totalHours: 160, lateMinutes: 30, absentCount: 1 },
  hourlyRate: 93750,
  gross: 15000000,
  net: 13500000,
};

const createMockHRHookReturn = (overrides = {}) => ({
  year: 2026,
  month: 1,
  departmentId: '',
  departments: mockDepartments,
  rows: mockPayrollRows,
  loading: false,
  totalNet: 24300000,
  setYear: vi.fn(),
  setMonth: vi.fn(),
  setDepartmentId: vi.fn(),
  handleExport: vi.fn(),
  ...overrides,
});

const createMockStaffHookReturn = (overrides = {}) => ({
  year: 2026,
  month: 1,
  data: mockStaffPayslip,
  loading: false,
  setYear: vi.fn(),
  setMonth: vi.fn(),
  ...overrides,
});

describe('PayrollPage', () => {
  describe('HRPayrollView (Admin/HR role)', () => {
    beforeEach(() => {
      vi.mocked(useHRPayrollPage).mockReturnValue(createMockHRHookReturn());
      vi.mocked(useStaffPayslip).mockReturnValue(createMockStaffHookReturn());
    });

    const renderWithAdminRole = () => {
      const store = mockStore({
        user: { user: { role: 'ADMIN' } },
      });
      return render(
        <Provider store={store}>
          <PayrollPage />
        </Provider>,
      );
    };

    it('renders page title for HR/Admin', () => {
      renderWithAdminRole();

      expect(screen.getByText('Payroll Management')).toBeInTheDocument();
    });

    it('renders month selector', () => {
      renderWithAdminRole();

      expect(screen.getByText('Month')).toBeInTheDocument();
    });

    it('renders year selector', () => {
      renderWithAdminRole();

      expect(screen.getByText('Year')).toBeInTheDocument();
    });

    it('renders department filter', () => {
      renderWithAdminRole();

      // Department appears in both filter label and table header
      expect(screen.getAllByText('Department').length).toBeGreaterThan(0);
      expect(screen.getByText('All departments')).toBeInTheDocument();
    });

    it('renders export button', () => {
      renderWithAdminRole();

      expect(screen.getByText('Export')).toBeInTheDocument();
    });

    it('renders payroll table with employee data', () => {
      renderWithAdminRole();

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('renders table columns', () => {
      renderWithAdminRole();

      expect(screen.getByText('Employee')).toBeInTheDocument();
      // Department appears in both filter label and table header
      expect(screen.getAllByText('Department').length).toBeGreaterThan(0);
      expect(screen.getByText('Hours')).toBeInTheDocument();
      expect(screen.getByText('Base salary')).toBeInTheDocument();
      expect(screen.getByText('Hourly rate')).toBeInTheDocument();
      expect(screen.getByText('Gross pay')).toBeInTheDocument();
      expect(screen.getByText('Late mins')).toBeInTheDocument();
      expect(screen.getByText('Absences')).toBeInTheDocument();
      expect(screen.getByText('Net pay')).toBeInTheDocument();
    });

    it('renders total net pay', () => {
      renderWithAdminRole();

      expect(screen.getByText(/Total net pay:/)).toBeInTheDocument();
      expect(screen.getByText(/24,300,000/)).toBeInTheDocument();
    });

    it('renders loading state', () => {
      vi.mocked(useHRPayrollPage).mockReturnValue(createMockHRHookReturn({ loading: true }));

      renderWithAdminRole();

      // Check for loading spinner (animated div)
      const loadingContainer = document.querySelector('.animate-spin');
      expect(loadingContainer).toBeInTheDocument();
    });

    it('calls handleExport when Export button is clicked', () => {
      const handleExport = vi.fn();
      vi.mocked(useHRPayrollPage).mockReturnValue(createMockHRHookReturn({ handleExport }));

      renderWithAdminRole();

      fireEvent.click(screen.getByText('Export'));
      expect(handleExport).toHaveBeenCalled();
    });

    it('calls setMonth when month is changed', () => {
      const setMonth = vi.fn();
      vi.mocked(useHRPayrollPage).mockReturnValue(createMockHRHookReturn({ setMonth }));

      renderWithAdminRole();

      const monthSelect = screen.getAllByRole('combobox')[0];
      fireEvent.change(monthSelect, { target: { value: '6' } });
      expect(setMonth).toHaveBeenCalledWith(6);
    });

    it('calls setYear when year is changed', () => {
      const setYear = vi.fn();
      vi.mocked(useHRPayrollPage).mockReturnValue(createMockHRHookReturn({ setYear }));

      renderWithAdminRole();

      const yearSelect = screen.getAllByRole('combobox')[1];
      fireEvent.change(yearSelect, { target: { value: '2025' } });
      expect(setYear).toHaveBeenCalledWith(2025);
    });

    it('calls setDepartmentId when department is changed', () => {
      const setDepartmentId = vi.fn();
      vi.mocked(useHRPayrollPage).mockReturnValue(createMockHRHookReturn({ setDepartmentId }));

      renderWithAdminRole();

      const deptSelect = screen.getAllByRole('combobox')[2];
      fireEvent.change(deptSelect, { target: { value: '1' } });
      expect(setDepartmentId).toHaveBeenCalledWith('1');
    });
  });

  describe('StaffPayslipView (Staff role)', () => {
    beforeEach(() => {
      vi.mocked(useHRPayrollPage).mockReturnValue(createMockHRHookReturn());
      vi.mocked(useStaffPayslip).mockReturnValue(createMockStaffHookReturn());
    });

    const renderWithStaffRole = () => {
      const store = mockStore({
        user: { user: { role: 'STAFF' } },
      });
      return render(
        <Provider store={store}>
          <PayrollPage />
        </Provider>,
      );
    };

    it('renders payslip title for staff', () => {
      renderWithStaffRole();

      expect(screen.getByText(/Payslip for 1\/2026/)).toBeInTheDocument();
    });

    it('renders employee name and email', () => {
      renderWithStaffRole();

      expect(screen.getByText(/John Doe/)).toBeInTheDocument();
      expect(screen.getByText(/john.doe@example.com/)).toBeInTheDocument();
    });

    it('renders department info', () => {
      renderWithStaffRole();

      expect(screen.getByText('Department:')).toBeInTheDocument();
      expect(screen.getByText('IT Department')).toBeInTheDocument();
    });

    it('renders salary info', () => {
      renderWithStaffRole();

      expect(screen.getByText('Base salary:')).toBeInTheDocument();
      expect(screen.getByText('15,000,000')).toBeInTheDocument();
    });

    it('renders working hours', () => {
      renderWithStaffRole();

      expect(screen.getByText('Working hours:')).toBeInTheDocument();
      expect(screen.getByText('160.00 h')).toBeInTheDocument();
    });

    it('renders late minutes and absences', () => {
      renderWithStaffRole();

      expect(screen.getByText('Late:')).toBeInTheDocument();
      expect(screen.getByText('30 mins')).toBeInTheDocument();
      expect(screen.getByText('Absent:')).toBeInTheDocument();
      expect(screen.getByText('1 shifts')).toBeInTheDocument();
    });

    it('renders net pay', () => {
      renderWithStaffRole();

      expect(screen.getByText('Net pay:')).toBeInTheDocument();
      expect(screen.getByText(/13,500,000/)).toBeInTheDocument();
    });

    it('renders loading state for staff', () => {
      vi.mocked(useStaffPayslip).mockReturnValue(
        createMockStaffHookReturn({ loading: true, data: null }),
      );

      renderWithStaffRole();

      expect(screen.getByText('Loading payslip...')).toBeInTheDocument();
    });

    it('renders month selector for staff', () => {
      renderWithStaffRole();

      expect(screen.getByText('Month')).toBeInTheDocument();
    });

    it('renders year input for staff', () => {
      renderWithStaffRole();

      expect(screen.getByText('Year')).toBeInTheDocument();
    });
  });
});
