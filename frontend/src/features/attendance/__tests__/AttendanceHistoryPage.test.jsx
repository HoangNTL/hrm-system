import { fireEvent, render, screen } from '@testing-library/react';

import AttendanceHistoryPage from '../pages/AttendanceHistoryPage.jsx';
import { useAttendanceHistory } from '../hooks/useAttendanceHistory.js';

vi.mock('../hooks/useAttendanceHistory.js', () => ({
  useAttendanceHistory: vi.fn(),
}));

vi.mock('../components/StatsBadges.jsx', () => ({
  default: ({ stats }) => <div data-testid="stats-badges">{stats.workedShifts}</div>,
}));

vi.mock('../components/CalendarGrid.jsx', () => ({
  default: ({ monthCursor }) => (
    <div data-testid="calendar-grid">{`${monthCursor.month + 1}/${monthCursor.year}`}</div>
  ),
}));

const createMockHookReturn = (overrides = {}) => ({
  monthCursor: { year: 2025, month: 0 },
  historyLoading: false,
  stats: {
    workedShifts: 20,
    totalShifts: 22,
    lateCount: 2,
    absentCount: 2,
    totalLateMinutes: 45,
    totalHours: 160,
  },
  handlePreviousMonth: vi.fn(),
  handleNextMonth: vi.fn(),
  groupHistoryByDate: vi.fn(() => new Map()),
  ...overrides,
});

describe('AttendanceHistoryPage', () => {
  beforeEach(() => {
    vi.mocked(useAttendanceHistory).mockReturnValue(createMockHookReturn());
  });

  it('renders page title and month label', () => {
    render(<AttendanceHistoryPage />);
    expect(screen.getByText('Attendance history')).toBeInTheDocument();
    expect(screen.getByText('1/2025')).toBeInTheDocument();
  });

  it('renders stats and calendar components', () => {
    render(<AttendanceHistoryPage />);
    expect(screen.getByTestId('stats-badges')).toBeInTheDocument();
    expect(screen.getByTestId('calendar-grid')).toBeInTheDocument();
  });

  it('calls previous and next month handlers', () => {
    const handlePreviousMonth = vi.fn();
    const handleNextMonth = vi.fn();
    vi.mocked(useAttendanceHistory).mockReturnValue(
      createMockHookReturn({ handlePreviousMonth, handleNextMonth }),
    );

    render(<AttendanceHistoryPage />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    fireEvent.click(buttons[1]);

    expect(handlePreviousMonth).toHaveBeenCalled();
    expect(handleNextMonth).toHaveBeenCalled();
  });
});
