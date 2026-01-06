import { render, screen, fireEvent } from '@testing-library/react';
import AttendanceHistoryPage from '..';
import { useAttendanceHistory } from '../useAttendanceHistory';

vi.mock('../useAttendanceHistory', () => ({
  useAttendanceHistory: vi.fn(),
}));

vi.mock('../StatsBadges', () => ({
  default: ({ stats }) => (
    <div data-testid="stats-badges">
      <span data-testid="worked-shifts">{stats.workedShifts}</span>
      <span data-testid="total-shifts">{stats.totalShifts}</span>
      <span data-testid="late-count">{stats.lateCount}</span>
      <span data-testid="absent-count">{stats.absentCount}</span>
      <span data-testid="total-late-minutes">{stats.totalLateMinutes}</span>
      <span data-testid="total-hours">{stats.totalHours}</span>
    </div>
  ),
}));

vi.mock('../CalendarGrid', () => ({
  default: ({ monthCursor, historyLoading, mapByDate }) => (
    <div data-testid="calendar-grid">
      {historyLoading ? (
        <span>Loading calendar...</span>
      ) : (
        <>
          <span data-testid="calendar-month">{monthCursor.month + 1}</span>
          <span data-testid="calendar-year">{monthCursor.year}</span>
          <span data-testid="map-size">{mapByDate.size}</span>
        </>
      )}
    </div>
  ),
}));

const mockStats = {
  workedShifts: 20,
  totalShifts: 22,
  lateCount: 2,
  absentCount: 2,
  totalLateMinutes: 45,
  totalHours: 160,
};

const createMockHookReturn = (overrides = {}) => ({
  monthCursor: { year: 2025, month: 0 }, // January 2025
  historyLoading: false,
  stats: mockStats,
  handlePreviousMonth: vi.fn(),
  handleNextMonth: vi.fn(),
  groupHistoryByDate: vi.fn(() => new Map()),
  ...overrides,
});

describe('AttendanceHistoryPage', () => {
  beforeEach(() => {
    vi.mocked(useAttendanceHistory).mockReturnValue(createMockHookReturn());
  });

  describe('Page Header', () => {
    it('renders page title', () => {
      render(<AttendanceHistoryPage />);

      expect(screen.getByText('Attendance history')).toBeInTheDocument();
    });

    it('renders page description', () => {
      render(<AttendanceHistoryPage />);

      expect(screen.getByText('Monthly attendance calendar')).toBeInTheDocument();
    });
  });

  describe('Month Navigation', () => {
    it('displays current month and year', () => {
      render(<AttendanceHistoryPage />);

      // month is 0-indexed, so 0 + 1 = 1 (January)
      expect(screen.getByText('1/2025')).toBeInTheDocument();
    });

    it('displays different month correctly', () => {
      vi.mocked(useAttendanceHistory).mockReturnValue(
        createMockHookReturn({ monthCursor: { year: 2025, month: 11 } }), // December
      );

      render(<AttendanceHistoryPage />);

      expect(screen.getByText('12/2025')).toBeInTheDocument();
    });

    it('renders previous month button', () => {
      render(<AttendanceHistoryPage />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(2);
    });

    it('calls handlePreviousMonth when previous button is clicked', () => {
      const handlePreviousMonth = vi.fn();
      vi.mocked(useAttendanceHistory).mockReturnValue(
        createMockHookReturn({ handlePreviousMonth }),
      );

      render(<AttendanceHistoryPage />);

      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[0]); // First button is previous

      expect(handlePreviousMonth).toHaveBeenCalled();
    });

    it('calls handleNextMonth when next button is clicked', () => {
      const handleNextMonth = vi.fn();
      vi.mocked(useAttendanceHistory).mockReturnValue(createMockHookReturn({ handleNextMonth }));

      render(<AttendanceHistoryPage />);

      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[1]); // Second button is next

      expect(handleNextMonth).toHaveBeenCalled();
    });
  });

  describe('Stats Badges', () => {
    it('renders stats badges component', () => {
      render(<AttendanceHistoryPage />);

      expect(screen.getByTestId('stats-badges')).toBeInTheDocument();
    });

    it('passes correct stats to StatsBadges', () => {
      render(<AttendanceHistoryPage />);

      expect(screen.getByTestId('worked-shifts')).toHaveTextContent('20');
      expect(screen.getByTestId('total-shifts')).toHaveTextContent('22');
      expect(screen.getByTestId('late-count')).toHaveTextContent('2');
      expect(screen.getByTestId('absent-count')).toHaveTextContent('2');
      expect(screen.getByTestId('total-late-minutes')).toHaveTextContent('45');
      expect(screen.getByTestId('total-hours')).toHaveTextContent('160');
    });

    it('displays updated stats when stats change', () => {
      vi.mocked(useAttendanceHistory).mockReturnValue(
        createMockHookReturn({
          stats: {
            workedShifts: 15,
            totalShifts: 18,
            lateCount: 3,
            absentCount: 3,
            totalLateMinutes: 90,
            totalHours: 120,
          },
        }),
      );

      render(<AttendanceHistoryPage />);

      expect(screen.getByTestId('worked-shifts')).toHaveTextContent('15');
      expect(screen.getByTestId('late-count')).toHaveTextContent('3');
      expect(screen.getByTestId('total-hours')).toHaveTextContent('120');
    });
  });

  describe('Calendar Grid', () => {
    it('renders calendar grid component', () => {
      render(<AttendanceHistoryPage />);

      expect(screen.getByTestId('calendar-grid')).toBeInTheDocument();
    });

    it('passes correct monthCursor to CalendarGrid', () => {
      render(<AttendanceHistoryPage />);

      expect(screen.getByTestId('calendar-month')).toHaveTextContent('1');
      expect(screen.getByTestId('calendar-year')).toHaveTextContent('2025');
    });

    it('shows loading state when historyLoading is true', () => {
      vi.mocked(useAttendanceHistory).mockReturnValue(
        createMockHookReturn({ historyLoading: true }),
      );

      render(<AttendanceHistoryPage />);

      expect(screen.getByText('Loading calendar...')).toBeInTheDocument();
    });

    it('passes mapByDate to CalendarGrid', () => {
      const mockMap = new Map([
        ['2025-01-15', [{ id: 1, status: 'present' }]],
        ['2025-01-16', [{ id: 2, status: 'late' }]],
      ]);

      vi.mocked(useAttendanceHistory).mockReturnValue(
        createMockHookReturn({
          groupHistoryByDate: vi.fn(() => mockMap),
        }),
      );

      render(<AttendanceHistoryPage />);

      expect(screen.getByTestId('map-size')).toHaveTextContent('2');
    });

    it('passes empty map when no history data', () => {
      vi.mocked(useAttendanceHistory).mockReturnValue(
        createMockHookReturn({
          groupHistoryByDate: vi.fn(() => new Map()),
        }),
      );

      render(<AttendanceHistoryPage />);

      expect(screen.getByTestId('map-size')).toHaveTextContent('0');
    });
  });

  describe('Month Navigation Integration', () => {
    it('updates display when navigating to previous month', () => {
      const { rerender } = render(<AttendanceHistoryPage />);

      expect(screen.getByText('1/2025')).toBeInTheDocument();

      // Simulate month change
      vi.mocked(useAttendanceHistory).mockReturnValue(
        createMockHookReturn({ monthCursor: { year: 2024, month: 11 } }), // December 2024
      );

      rerender(<AttendanceHistoryPage />);

      expect(screen.getByText('12/2024')).toBeInTheDocument();
    });

    it('updates display when navigating to next month', () => {
      const { rerender } = render(<AttendanceHistoryPage />);

      expect(screen.getByText('1/2025')).toBeInTheDocument();

      // Simulate month change
      vi.mocked(useAttendanceHistory).mockReturnValue(
        createMockHookReturn({ monthCursor: { year: 2025, month: 1 } }), // February 2025
      );

      rerender(<AttendanceHistoryPage />);

      expect(screen.getByText('2/2025')).toBeInTheDocument();
    });
  });
});
