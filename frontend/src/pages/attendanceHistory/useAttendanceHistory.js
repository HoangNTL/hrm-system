import { useEffect, useMemo, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '@/store/slices/userSlice';
import axios from '@/api/axios';

/**
 * Hook quản lý toàn bộ state + logic cho trang AttendanceHistory
 */
export function useAttendanceHistory() {
  const user = useSelector(selectUser);
  const employeeId = user?.employee_id;
  const [historyRecords, setHistoryRecords] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [monthCursor, setMonthCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() }; // month 0-indexed
  });

  const fetchHistoryForMonth = useCallback(async (year, monthIndex) => {
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
        const data = response.data.data || [];
        console.log('📊 History data received:', data.length, 'records', data);
        setHistoryRecords(data);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!employeeId) return;
    fetchHistoryForMonth(monthCursor.year, monthCursor.month);
  }, [employeeId, monthCursor, fetchHistoryForMonth]);

  const handlePreviousMonth = useCallback(() => {
    setMonthCursor(prev => {
      const m = prev.month - 1;
      return { year: prev.year + (m < 0 ? -1 : 0), month: (m + 12) % 12 };
    });
  }, []);

  const handleNextMonth = useCallback(() => {
    setMonthCursor(prev => {
      const m = prev.month + 1;
      return { year: prev.year + (m > 11 ? 1 : 0), month: m % 12 };
    });
  }, []);

  const groupHistoryByDate = useCallback(() => {
    const map = new Map();
    const records = Array.isArray(historyRecords) ? historyRecords : [];
    records.forEach(r => {
      const dateStr = typeof r.date === 'string' ? r.date : new Date(r.date).toISOString();
      const key = dateStr.slice(0, 10); // YYYY-MM-DD
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(r);
    });
    return map;
  }, [historyRecords]);

  const stats = useMemo(() => {
    let totalLateMinutes = 0;
    let lateCount = 0;
    let absentCount = 0;
    let totalHours = 0;

    const records = Array.isArray(historyRecords) ? historyRecords : [];
    
    const filteredRecords = records.filter(r => {
      const dateStr = typeof r.date === 'string' ? r.date : new Date(r.date).toISOString();
      const recordYear = parseInt(dateStr.slice(0, 4));
      const recordMonth = parseInt(dateStr.slice(5, 7)) - 1;
      return recordYear === monthCursor.year && recordMonth === monthCursor.month;
    });
    
    filteredRecords.forEach(r => {
      if (r.status === 'absent') absentCount += 1;
      if (r.status === 'late') lateCount += 1;
      totalLateMinutes += r.late_minutes || 0;
      totalHours += parseFloat(r.work_hours) || 0;
    });

    const workedShifts = filteredRecords.length - absentCount;
    return {
      workedShifts,
      totalShifts: filteredRecords.length,
      lateCount,
      absentCount,
      totalLateMinutes,
      totalHours
    };
  }, [historyRecords, monthCursor]);

  return {
    // state
    historyRecords,
    historyLoading,
    monthCursor,
    stats,

    // handlers
    handlePreviousMonth,
    handleNextMonth,
    groupHistoryByDate,
  };
}
