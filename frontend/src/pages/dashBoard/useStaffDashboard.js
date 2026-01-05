import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '@/store/slices/userSlice';
import { userService } from '@/services/userService';
import axios from '@/api/axios';

const formatMillions = (value) => {
  const num = Number(value) || 0;
  const millions = num / 1_000_000;
  const opts =
    millions >= 10
      ? { maximumFractionDigits: 0 }
      : { minimumFractionDigits: 2, maximumFractionDigits: 2 };
  return `${millions.toLocaleString(undefined, opts)}M`;
};

export function useStaffDashboard() {
  const user = useSelector(selectUser);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    workDays: 0,
    lateCount: 0,
    onTimeRate: 0,
    upcomingPayroll: 0,
    attendanceRequests: {
      pending: 0,
      approved: 0,
      rejected: 0,
    },
  });
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [attendanceTrends, setAttendanceTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const attendanceMapRef = useRef({ dailyMap: new Map() });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load profile
      const profileRes = await userService.getMe();
      setProfile(profileRes?.data || profileRes);

      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      firstDay.setHours(0, 0, 0, 0);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      lastDay.setHours(23, 59, 59, 999);

      let workDays = 0;
      let lateCount = 0;
      let onTimeRate = 0;
      let attendances = [];

      // Load attendance history (current month) - staff endpoint
      try {
        const attendanceRes = await axios.get('/attendance/history', {
          params: {
            fromDate: firstDay.toISOString(),
            toDate: lastDay.toISOString(),
          },
        });

        const raw = attendanceRes?.data?.data || attendanceRes?.data || [];
        attendances = (Array.isArray(raw) ? raw : []).map((a) => {
          const dateStr =
            typeof a.date === 'string'
              ? a.date.slice(0, 10)
              : new Date(a.date).toISOString().slice(0, 10);
          return {
            ...a,
            date: dateStr,
          };
        });

        // Filter to only records from the current month (handle timezone offset from backend)
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        attendances = attendances.filter((a) => {
          const [year, month] = a.date.split('-').map(Number);
          return year === currentYear && month - 1 === currentMonth;
        });

        // Sort by date desc
        attendances.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Build daily best status map (present/on_time > late > absent)
        const statusPriority = { present: 3, on_time: 3, late: 2, absent: 1 };
        const dailyMap = new Map();
        attendances.forEach((a) => {
          const key = a.date;
          const current = dailyMap.get(key);
          const candidateStatus = a.status || 'absent';
          const pick =
            !current ||
            (statusPriority[candidateStatus] || 0) >
              (statusPriority[current.status] || 0);
          if (pick) {
            dailyMap.set(key, {
              status: candidateStatus,
              checkIn:
                a.check_in || a.check_in_time || a.checkInTime || null,
              checkOut:
                a.check_out || a.check_out_time || a.checkOutTime || null,
            });
          }
        });

        // Build trends using daily map to avoid missing days
        attendanceMapRef.current = { dailyMap }; // stash for later use when generating trends

        workDays = attendances.length;
        lateCount = attendances.filter((a) => a.status === 'late').length;
        const onTimeCount = attendances.filter(
          (a) => a.status === 'on_time' || a.status === 'present',
        ).length;
        onTimeRate = workDays > 0 ? Math.round((onTimeCount / workDays) * 100) : 0;
      } catch (e) {
        console.error('Error loading attendance:', e);
      }

      // Load payroll - staff payslip endpoint
      let upcomingPayroll = 0;
      try {
        const payrollRes = await axios.get('/payroll/payslip', {
          params: {
            year: now.getFullYear(),
            month: now.getMonth() + 1,
          },
        });
        const payroll = payrollRes?.data?.data || payrollRes?.data;

        // New payroll schema returns an object with net/gross/contract
        if (payroll) {
          upcomingPayroll =
            payroll.net ||
            payroll.gross ||
            payroll.total_salary ||
            payroll.net_salary ||
            payroll.net_pay ||
            payroll.contract?.salary ||
            0;
        }
      } catch (e) {
        console.error('Error loading payroll:', e);
      }

      // Load attendance requests stats
      let attendanceRequests = { pending: 0, approved: 0, rejected: 0 };
      try {
        const reqRes = await axios.get('/attendance-requests/my-requests', {
          params: { page: 1, limit: 100 },
        });

        const requests = reqRes?.data?.data?.requests || [];
        attendanceRequests.pending = requests.filter(
          (r) => r.status === 'pending',
        ).length;
        attendanceRequests.approved = requests.filter(
          (r) => r.status === 'approved',
        ).length;
        attendanceRequests.rejected = requests.filter(
          (r) => r.status === 'rejected',
        ).length;
      } catch (e) {
        console.error('Error loading attendance requests:', e);
      }

      // Load attendance trends for last 7 days
      const trends = [];
      const currentDate = new Date();

      const dailyMap = attendanceMapRef.current?.dailyMap || new Map();

      for (let i = 6; i >= 0; i--) {
        const date = new Date(currentDate);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dayAttendance = dailyMap.get(dateStr);

        trends.push({
          date: dateStr,
          day: dayName,
          status: dayAttendance?.status || 'absent',
          checkIn: dayAttendance?.checkIn || null,
          checkOut: dayAttendance?.checkOut || null,
        });
      }

      setStats({ workDays, lateCount, onTimeRate, upcomingPayroll, attendanceRequests });
      setRecentAttendance(attendances.slice(0, 5));
      setAttendanceTrends(trends);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'on_time':
      case 'present':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'late':
        return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20';
      case 'absent':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      default:
        return 'text-secondary-600 bg-secondary-50 dark:bg-secondary-900/20';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'on_time':
        return 'On Time';
      case 'present':
        return 'Present';
      case 'late':
        return 'Late';
      case 'absent':
        return 'Absent';
      default:
        return status;
    }
  };

  return {
    user,
    profile,
    stats,
    recentAttendance,
    attendanceTrends,
    loading,
    formatDate,
    getStatusColor,
    getStatusLabel,
    formatMillions,
  };
}
