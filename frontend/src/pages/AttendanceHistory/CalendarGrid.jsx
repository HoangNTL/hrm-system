import React from 'react';
import { Loader } from 'lucide-react';
import { buildCalendar, getDaySummary, formatTimeShort } from './CalendarUtils';

export default function CalendarGrid({ 
  monthCursor, 
  historyLoading, 
  mapByDate 
}) {
  const calendarCells = buildCalendar(monthCursor.year, monthCursor.month);

  if (historyLoading) {
    return (
      <div className="flex items-center justify-center py-10 text-gray-600">
        <Loader className="w-6 h-6 animate-spin mr-2" /> Loading calendar...
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-7 text-center text-sm font-semibold text-gray-500 mb-2">
        {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
          <div key={d} className="py-2">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-3">
        {calendarCells.map((day, idx) => {
          const emptyKey = `empty-${monthCursor.year}-${monthCursor.month}-${idx}`;
          if (!day) {
            return <div key={emptyKey} className="h-48 rounded-xl bg-gray-50 border border-gray-200" />;
          }

          const year = day.getFullYear();
          const month = String(day.getMonth() + 1).padStart(2, '0');
          const date = String(day.getDate()).padStart(2, '0');
          const key = `${year}-${month}-${date}`;
          const records = mapByDate.get(key) || [];
          const summary = getDaySummary(records);
          const earliest = summary.earliest ? formatTimeShort(summary.earliest) : '--';
          const latest = summary.latest ? formatTimeShort(summary.latest) : '--';

          return (
            <div key={`cell-${key}`} className="rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col min-h-[200px]">
              <div className={`px-2 py-1.5 text-[10px] font-semibold flex items-center justify-between ${summary.headerColor}`}>
                <span>{String(day.getDate()).padStart(2,'0')}/{String(day.getMonth()+1).padStart(2,'0')}</span>
                <span className="inline-flex items-center text-[9px] whitespace-nowrap">
                  {earliest}-{latest}
                </span>
              </div>
              <div className="flex-1 grid grid-cols-[70px_1fr]">
                <div className="border-r border-gray-200 flex flex-col items-center justify-center text-sm font-semibold text-gray-800 bg-gray-50">
                  <div className="text-lg">{records.length}</div>
                  <div className="text-[11px] text-gray-600 mt-1">shifts</div>
                  <span className="mt-2 text-[10px] text-gray-700">{summary.label}</span>
                </div>
                <div className="px-2 py-3 text-xs text-gray-800 space-y-2 overflow-hidden">
                  {records.length === 0 && <div className="text-gray-500">No records</div>}
                  {records.map(r => {
                    const isLate = r.status === 'late';
                    const isAbsent = r.status === 'absent';
                    const dot = isAbsent ? '❌' : isLate ? '🟠' : '✅';
                    const lateInfo = isLate ? ` (+${r.late_minutes || 0}')` : '';
                    return (
                      <div key={r.id} className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1 font-semibold text-gray-900 truncate">
                          <span>{dot}</span>
                          <span className="truncate text-[11px]">{r.shift?.shift_name || 'Shift'}{lateInfo}</span>
                        </span>
                        <span className="font-mono text-[10px] whitespace-nowrap">
                          {formatTimeShort(r.check_in)}-{formatTimeShort(r.check_out)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="px-3 py-2 text-[11px] font-semibold text-gray-800 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                <span>Late: {summary.lateMinutes || 0} mins</span>
                <span className="text-gray-600">
                  Hours: {summary.totalHours?.toFixed ? summary.totalHours.toFixed(1) : summary.totalHours}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
