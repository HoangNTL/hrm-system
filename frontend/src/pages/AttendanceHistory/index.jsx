import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '@/store/slices/userSlice';
import axios from '@/api/axios';
import { Loader } from 'lucide-react';

function AttendanceHistoryPage() {
  const user = useSelector(selectUser);
  const employeeId = user?.employee_id;
  const [historyRecords, setHistoryRecords] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [monthCursor, setMonthCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() }; // month 0-indexed
  });

  useEffect(() => {
    if (!employeeId) return;
    (async () => {
      await fetchHistoryForMonth(monthCursor.year, monthCursor.month);
    })();
  }, [employeeId, monthCursor]);

  const fetchHistoryForMonth = async (year, monthIndex) => {
    try {
      setHistoryLoading(true);
      const start = new Date(year, monthIndex, 1);
      const end = new Date(year, monthIndex + 1, 0, 23, 59, 59);
      const response = await axios.get('/attendance/history', {
        params: {
          fromDate: start.toISOString(),
          toDate: end.toISOString()
        }
      });
      if (response.data.success) {
        setHistoryRecords(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const formatTimeShort = (date) => {
    if (!date) return '--:--';
    const d = new Date(date);
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return local.toISOString().slice(11, 16);
  };

  const buildCalendar = (year, monthIndex) => {
    const firstDay = new Date(year, monthIndex, 1);
    const startWeekday = (firstDay.getDay() + 6) % 7; // Monday=0
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, monthIndex, d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  };

  const groupHistoryByDate = () => {
    const map = new Map();
    const records = Array.isArray(historyRecords) ? historyRecords : [];
    records.forEach(r => {
      // Parse date without timezone conversion
      // If r.date is "2025-12-27T05:00:00.000Z" (from DB at noon UTC+7), 
      // we want just "2025-12-27" without timezone shift
      const dateStr = typeof r.date === 'string' ? r.date : new Date(r.date).toISOString();
      const key = dateStr.slice(0, 10); // YYYY-MM-DD
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(r);
    });
    return map;
  };

  const getDaySummary = (records) => {
    if (!records || records.length === 0) {
      return {
        label: 'Not recorded',
        color: 'bg-gray-50 text-gray-600 border-gray-200',
        headerColor: 'bg-gray-200 text-gray-800',
        lateMinutes: 0,
        totalHours: 0,
        earliest: null,
        latest: null,
      };
    }

    const anyAbsent = records.some(r => r.status === 'absent');
    const anyLate = records.some(r => r.status === 'late');
    const totalHours = records.reduce((sum, r) => sum + (parseFloat(r.work_hours) || 0), 0);
    const lateMinutes = records.reduce((sum, r) => sum + (r.late_minutes || 0), 0);
    const times = records.flatMap(r => [r.check_in, r.check_out].filter(Boolean));
    const dates = times.map(t => new Date(t));
    const earliest = dates.length ? new Date(Math.min(...dates)) : null;
    const latest = dates.length ? new Date(Math.max(...dates)) : null;

    let headerColor = 'bg-green-500 text-white';
    if (anyAbsent) headerColor = 'bg-red-500 text-white';
    else if (anyLate) headerColor = 'bg-purple-500 text-white';

    let label = 'On time';
    if (anyAbsent) label = 'Absent';
    else if (anyLate) label = 'Late';

    return {
      label,
      color: 'bg-white text-gray-800 border-gray-200',
      headerColor,
      lateMinutes,
      totalHours,
      earliest,
      latest,
    };
  };

  const calendarCells = buildCalendar(monthCursor.year, monthCursor.month);
  const mapByDate = groupHistoryByDate();

  const stats = useMemo(() => {
    let totalLateMinutes = 0;
    let lateCount = 0;
    let absentCount = 0;
    let totalHours = 0;

    const records = Array.isArray(historyRecords) ? historyRecords : [];
    records.forEach(r => {
      if (r.status === 'absent') absentCount += 1;
      if (r.status === 'late') lateCount += 1;
      totalLateMinutes += r.late_minutes || 0;
      totalHours += parseFloat(r.work_hours) || 0;
    });

    const workedShifts = records.length - absentCount;
    return {
      workedShifts,
      totalShifts: records.length,
      lateCount,
      absentCount,
      totalLateMinutes,
      totalHours
    };
  }, [historyRecords]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-4 md:p-8 text-gray-900 dark:text-gray-100">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Attendance history</h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Monthly attendance calendar</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMonthCursor(prev => {
                const m = prev.month - 1;
                return { year: prev.year + (m < 0 ? -1 : 0), month: (m + 12) % 12 };
              })}
              className="px-3 py-2 border rounded-md hover:bg-gray-50"
            >
              ←
            </button>
            <div className="font-semibold text-gray-800 min-w-[140px] text-center">
              {monthCursor.month + 1}/{monthCursor.year}
            </div>
            <button
              onClick={() => setMonthCursor(prev => {
                const m = prev.month + 1;
                return { year: prev.year + (m > 11 ? 1 : 0), month: m % 12 };
              })}
              className="px-3 py-2 border rounded-md hover:bg-gray-50"
            >
              →
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm mb-4">
          {[{
            label: 'Shifts',
            value: `${stats.workedShifts}/${stats.totalShifts}`,
            color: 'bg-emerald-100 text-emerald-700 border border-emerald-200'
          }, {
            label: 'Late',
            value: stats.lateCount,
            color: 'bg-amber-100 text-amber-700 border border-amber-200'
          }, {
            label: 'Late mins',
            value: stats.totalLateMinutes,
            color: 'bg-amber-50 text-amber-700 border border-amber-100'
          }, {
            label: 'Absent',
            value: stats.absentCount,
            color: 'bg-rose-50 text-rose-700 border border-rose-100'
          }, {
            label: 'Hours',
            value: stats.totalHours.toFixed(1),
            color: 'bg-blue-50 text-blue-700 border border-blue-100'
          }].map(item => (
            <span key={item.label} className={`px-3 py-2 font-semibold inline-flex items-center gap-2 ${item.color}`}>
              <span className="text-xs uppercase tracking-wide text-gray-600">{item.label}</span>
              <span className="text-base">{item.value}</span>
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 text-center text-sm font-semibold text-gray-500 mb-2">
          {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
            <div key={d} className="py-2">{d}</div>
          ))}
        </div>

        {historyLoading ? (
          <div className="flex items-center justify-center py-10 text-gray-600">
            <Loader className="w-6 h-6 animate-spin mr-2" /> Loading calendar...
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-3">
            {calendarCells.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} className="h-48 rounded-xl bg-gray-50 border border-gray-200" />;
              // Create key in local timezone format (YYYY-MM-DD) without UTC conversion
              const year = day.getFullYear();
              const month = String(day.getMonth() + 1).padStart(2, '0');
              const date = String(day.getDate()).padStart(2, '0');
              const key = `${year}-${month}-${date}`;
              const records = mapByDate.get(key) || [];
              const summary = getDaySummary(records);
              const earliest = summary.earliest ? formatTimeShort(summary.earliest) : '--';
              const latest = summary.latest ? formatTimeShort(summary.latest) : '--';
              return (
                <div key={key} className="rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col min-h-[200px]">
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
                            <span className="font-mono text-[10px] whitespace-nowrap">{formatTimeShort(r.check_in)}-{formatTimeShort(r.check_out)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="px-3 py-2 text-[11px] font-semibold text-gray-800 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                    <span>Late: {summary.lateMinutes || 0} mins</span>
                    <span className="text-gray-600">Hours: {summary.totalHours?.toFixed ? summary.totalHours.toFixed(1) : summary.totalHours}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default AttendanceHistoryPage;
