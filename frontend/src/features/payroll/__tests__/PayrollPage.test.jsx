import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

import PayrollPage from '../pages/PayrollPage.jsx';
import { useHRPayrollPage, useStaffPayslip } from '../hooks/usePayrollPage.js';

vi.mock('../hooks/usePayrollPage.js', () => ({
  useHRPayrollPage: vi.fn(),
  useStaffPayslip: vi.fn(),
}));

const mockStore = (initialState) => ({
  getState: () => initialState,
  subscribe: () => () => {},
  dispatch: () => {},
});

const createMockHRHookReturn = (overrides = {}) => ({
  year: 2026,
  month: 1,
  departmentId: '',
  search: '',
  departments: [{ id: 1, name: 'IT Department' }],
  rows: [
    {
      employee: { full_name: 'John Doe', department: { name: 'IT Department' } },
      contract: { salary: 15000000 },
      totals: { totalHours: 160, lateMinutes: 30, absentCount: 1 },
      hourlyRate: 93750,
      gross: 15000000,
      net: 13500000,
    },
  ],
  loading: false,
  totalNet: 13500000,
  pagination: { page: 1, total: 1, totalPages: 1 },
  setYear: vi.fn(),
  setMonth: vi.fn(),
  setDepartmentId: vi.fn(),
  handleSearchChange: vi.fn(),
  handlePageChange: vi.fn(),
  handleExport: vi.fn(),
  ...overrides,
});

const createMockStaffHookReturn = (overrides = {}) => ({
  year: 2026,
  month: 1,
  data: {
    employee: {
      full_name: 'John Doe',
      email: 'john.doe@example.com',
      department: { name: 'IT Department' },
    },
    contract: { salary: 15000000 },
    totals: { totalHours: 160, lateMinutes: 30, absentCount: 1 },
    hourlyRate: 93750,
    net: 13500000,
  },
  loading: false,
  setYear: vi.fn(),
  setMonth: vi.fn(),
  ...overrides,
});

function renderPage(role) {
  const store = mockStore({ user: { user: { role } } });
  return render(
    <Provider store={store}>
      <PayrollPage />
    </Provider>,
  );
}

describe('PayrollPage', () => {
  beforeEach(() => {
    vi.mocked(useHRPayrollPage).mockReturnValue(createMockHRHookReturn());
    vi.mocked(useStaffPayslip).mockReturnValue(createMockStaffHookReturn());
  });

  it('renders HR payroll view for admin users', () => {
    renderPage('ADMIN');
    expect(screen.getByText('Payroll Management')).toBeInTheDocument();
    expect(screen.getByText(/Current page net pay:/)).toBeInTheDocument();
  });

  it('calls handleExport in the HR view', () => {
    const handleExport = vi.fn();
    vi.mocked(useHRPayrollPage).mockReturnValue(createMockHRHookReturn({ handleExport }));
    renderPage('ADMIN');
    fireEvent.click(screen.getByText('Export'));
    expect(handleExport).toHaveBeenCalled();
  });

  it('renders the staff payslip view for staff users', () => {
    renderPage('STAFF');
    expect(screen.getByText(/Payslip for 1\/2026/)).toBeInTheDocument();
    expect(screen.getByText(/john.doe@example.com/)).toBeInTheDocument();
  });
});
