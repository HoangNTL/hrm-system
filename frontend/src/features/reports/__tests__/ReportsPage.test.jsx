import { fireEvent, render, screen } from '@testing-library/react';

import ReportsPage from '../pages/ReportsPage.jsx';
import { useReportsPage } from '../hooks/useReportsPage.js';

vi.mock('../hooks/useReportsPage.js', () => ({
  useReportsPage: vi.fn(),
}));

const createMockHookReturn = (overrides = {}) => ({
  loading: false,
  error: '',
  kpis: [{ label: 'Total Employees', value: '150' }],
  lateByDept: [{ name: 'IT Department', late: 5 }],
  payrollByDept: [{ name: 'IT Department', value: 150 }],
  attendanceTrend: [{ label: 'Mon', value: 90 }],
  selectedMonth: '2026-01',
  maxLate: 5,
  maxPayroll: 150,
  handleMonthChange: vi.fn(),
  ...overrides,
});

describe('ReportsPage', () => {
  beforeEach(() => {
    vi.mocked(useReportsPage).mockReturnValue(createMockHookReturn());
  });

  it('renders page header and KPI content', () => {
    render(<ReportsPage />);
    expect(screen.getByText('Reports')).toBeInTheDocument();
    expect(screen.getByText('Live data for HR/Admin')).toBeInTheDocument();
    expect(screen.getByText('Total Employees')).toBeInTheDocument();
  });

  it('renders error state when present', () => {
    vi.mocked(useReportsPage).mockReturnValue(
      createMockHookReturn({ error: 'Failed to load reports data' }),
    );
    render(<ReportsPage />);
    expect(screen.getByText('Failed to load reports data')).toBeInTheDocument();
  });

  it('calls handleMonthChange from the payroll chart month input', () => {
    const handleMonthChange = vi.fn();
    vi.mocked(useReportsPage).mockReturnValue(
      createMockHookReturn({ handleMonthChange }),
    );
    render(<ReportsPage />);
    fireEvent.change(screen.getByDisplayValue('2026-01'), {
      target: { value: '2026-02' },
    });
    expect(handleMonthChange).toHaveBeenCalled();
  });
});
