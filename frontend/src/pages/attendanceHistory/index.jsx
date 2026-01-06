import React from 'react';

import Icon from '@components/ui/Icon';
import Button from '@components/ui/Button';
import StatsBadges from './StatsBadges';
import CalendarGrid from './CalendarGrid';
import { useAttendanceHistory } from './useAttendanceHistory';

function AttendanceHistoryPage() {
  const {
    // state
    monthCursor,
    historyLoading,
    stats,

    // handlers
    handlePreviousMonth,
    handleNextMonth,
    groupHistoryByDate,
  } = useAttendanceHistory();

  const mapByDate = groupHistoryByDate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-4 md:p-8 text-gray-900 dark:text-gray-100">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Attendance history</h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Monthly attendance calendar</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handlePreviousMonth}
              className="px-3 py-2 flex items-center justify-center"
            >
              <Icon name="chevron-left" className="w-4 h-4" />
            </Button>
            <div className="font-semibold text-gray-800 min-w-[140px] text-center">
              {monthCursor.month + 1}/{monthCursor.year}
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleNextMonth}
              className="px-3 py-2 flex items-center justify-center"
            >
              <Icon name="chevron-right" className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Stats Badges */}
        <StatsBadges stats={stats} />

        {/* Calendar Grid */}
        <CalendarGrid
          monthCursor={monthCursor}
          historyLoading={historyLoading}
          mapByDate={mapByDate}
        />
      </div>
    </div>
  );
}

export default AttendanceHistoryPage;
