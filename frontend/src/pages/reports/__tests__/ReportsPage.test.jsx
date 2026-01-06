import { render, screen, fireEvent } from '@testing-library/react';
import ReportsPage from '..';
import { useReportsPage } from '../useReportsPage';

vi.mock('../useReportsPage', () => ({
  useReportsPage: vi.fn(),
}));

const mockKpis = [
  { label: 'Total Employees', value: '150' },
  { label: 'On-time Rate', value: '85%' },
  { label: 'Late Count', value: '12' },
  { label: 'Total Payroll', value: '500M' },
];

const mockLateByDept = [
  { name: 'IT Department', late: 5 },
  { name: 'HR Department', late: 3 },
  { name: 'Sales Department', late: 4 },
];

const mockPayrollByDept = [
  { name: 'IT Department', value: 150 },
  { name: 'HR Department', value: 80 },
  { name: 'Sales Department', value: 120 },
];

const mockAttendanceTrend = [
  { label: 'Mon', value: 90 },
  { label: 'Tue', value: 85 },
  { label: 'Wed', value: 88 },
  { label: 'Thu', value: 92 },
  { label: 'Fri', value: 80 },
  { label: 'Sat', value: 95 },
  { label: 'Sun', value: 100 },
];

const createMockHookReturn = (overrides = {}) => ({
  // state
  loading: false,
  error: '',
  kpis: mockKpis,
  lateByDept: mockLateByDept,
  payrollByDept: mockPayrollByDept,
  attendanceTrend: mockAttendanceTrend,
  selectedMonth: '2026-01',
  maxLate: 5,
  maxPayroll: 150,

  // handlers
  handleMonthChange: vi.fn(),
  ...overrides,
});

describe('ReportsPage', () => {
  beforeEach(() => {
    vi.mocked(useReportsPage).mockReturnValue(createMockHookReturn());
  });

  it('renders page header with title and description', () => {
    render(<ReportsPage />);

    expect(screen.getByText('Reports')).toBeInTheDocument();
    expect(screen.getByText('Live data for HR/Admin')).toBeInTheDocument();
  });

  it('renders KPI cards with correct values', () => {
    render(<ReportsPage />);

    expect(screen.getByText('Total Employees')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('On-time Rate')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText('Late Count')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('Total Payroll')).toBeInTheDocument();
    expect(screen.getByText('500M')).toBeInTheDocument();
  });

  it('renders loading state when loading and no KPIs', () => {
    vi.mocked(useReportsPage).mockReturnValue(createMockHookReturn({ loading: true, kpis: [] }));

    render(<ReportsPage />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders error message when error exists', () => {
    vi.mocked(useReportsPage).mockReturnValue(
      createMockHookReturn({ error: 'Failed to load reports data' }),
    );

    render(<ReportsPage />);

    expect(screen.getByText('Failed to load reports data')).toBeInTheDocument();
  });

  it('renders attendance trend chart', () => {
    render(<ReportsPage />);

    expect(screen.getByText('Attendance trend (last 7 days)')).toBeInTheDocument();
    expect(screen.getByText('On-time percentage')).toBeInTheDocument();
  });

  it('renders late by department chart', () => {
    render(<ReportsPage />);

    expect(screen.getByText('Late by department')).toBeInTheDocument();
    expect(screen.getByText('Count of late check-ins (30d)')).toBeInTheDocument();
  });

  it('renders department names in late by department chart', () => {
    render(<ReportsPage />);

    expect(screen.getAllByText('IT Department').length).toBeGreaterThan(0);
    expect(screen.getAllByText('HR Department').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Sales Department').length).toBeGreaterThan(0);
  });

  it('renders payroll by department chart', () => {
    render(<ReportsPage />);

    expect(screen.getByText('Payroll by department')).toBeInTheDocument();
    expect(screen.getByText('Gross payroll by month')).toBeInTheDocument();
    expect(screen.getByText('Unit: million VND')).toBeInTheDocument();
  });

  it('renders month selector for payroll chart', () => {
    render(<ReportsPage />);

    expect(screen.getByText('Month')).toBeInTheDocument();
    const monthInput = screen.getByDisplayValue('2026-01');
    expect(monthInput).toBeInTheDocument();
    expect(monthInput).toHaveAttribute('type', 'month');
  });

  it('calls handleMonthChange when month is changed', () => {
    const handleMonthChange = vi.fn();
    vi.mocked(useReportsPage).mockReturnValue(createMockHookReturn({ handleMonthChange }));

    render(<ReportsPage />);

    const monthInput = screen.getByDisplayValue('2026-01');
    fireEvent.change(monthInput, { target: { value: '2026-02' } });

    expect(handleMonthChange).toHaveBeenCalled();
  });

  it('shows no data message when attendance trend is empty', () => {
    vi.mocked(useReportsPage).mockReturnValue(createMockHookReturn({ attendanceTrend: [] }));

    render(<ReportsPage />);

    expect(screen.getAllByText('No data').length).toBeGreaterThan(0);
  });

  it('shows no data message when late by department is empty', () => {
    vi.mocked(useReportsPage).mockReturnValue(createMockHookReturn({ lateByDept: [] }));

    render(<ReportsPage />);

    expect(screen.getAllByText('No data').length).toBeGreaterThan(0);
  });

  it('shows no data message when payroll by department is empty', () => {
    vi.mocked(useReportsPage).mockReturnValue(createMockHookReturn({ payrollByDept: [] }));

    render(<ReportsPage />);

    expect(screen.getAllByText('No data').length).toBeGreaterThan(0);
  });

  it('renders attendance trend data points', () => {
    render(<ReportsPage />);

    // Check for some data points with labels and values
    expect(screen.getByText(/Mon.*90%/)).toBeInTheDocument();
    expect(screen.getByText(/Tue.*85%/)).toBeInTheDocument();
  });
});
