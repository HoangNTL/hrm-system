import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '@/store/slices/userSlice';
import Icon from '@/components/ui/Icon';
import { userService } from '@/services/userService';
import axios from '@/api/axios';

const formatMillions = (value) => {
  const num = Number(value) || 0;
  const millions = num / 1_000_000;
  const opts = millions >= 10
    ? { maximumFractionDigits: 0 }
    : { minimumFractionDigits: 2, maximumFractionDigits: 2 };
  return `${millions.toLocaleString(undefined, opts)}M`;
};

export default function StaffDashboard() {
  const navigate = useNavigate();
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
          }
        });

        const raw = attendanceRes?.data?.data || attendanceRes?.data || [];
        attendances = (Array.isArray(raw) ? raw : []).map((a) => {
          const dateStr = typeof a.date === 'string'
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
        attendances = attendances.filter(a => {
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
          const pick = !current || (statusPriority[candidateStatus] || 0) > (statusPriority[current.status] || 0);
          if (pick) {
            dailyMap.set(key, {
              status: candidateStatus,
              checkIn: a.check_in || a.check_in_time || a.checkInTime || null,
              checkOut: a.check_out || a.check_out_time || a.checkOutTime || null,
            });
          }
        });
        
        // Build trends using daily map to avoid missing days
        attendanceMapRef.current = { dailyMap }; // stash for later use when generating trends

        workDays = attendances.length;
        lateCount = attendances.filter(a => a.status === 'late').length;
        const onTimeCount = attendances.filter(a => a.status === 'on_time' || a.status === 'present').length;
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
          }
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
          params: { page: 1, limit: 100 }
        });
        
        const requests = reqRes?.data?.data?.requests || [];
        attendanceRequests.pending = requests.filter(r => r.status === 'pending').length;
        attendanceRequests.approved = requests.filter(r => r.status === 'approved').length;
        attendanceRequests.rejected = requests.filter(r => r.status === 'rejected').length;
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
      case 'present': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'late': return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20';
      case 'absent': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      default: return 'text-secondary-600 bg-secondary-50 dark:bg-secondary-900/20';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'on_time': return 'On Time';
      case 'present': return 'Present';
      case 'late': return 'Late';
      case 'absent': return 'Absent';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-secondary-500">Loading dashboard...</p>
      </div>
    );
  }

  // Check if user has employee record
  if (!profile?.employee) {
    return (
      <div className="space-y-6">
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <Icon name="alert-triangle" className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            <div>
              <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
                Employee Record Not Found
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                Your account is not linked to an employee record. Please contact HR to set up your employee profile.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const initials = profile?.employee?.full_name
    ? profile.employee.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <div className="space-y-6">
      {/* Employee Information Card */}
      <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-md border border-secondary-200 dark:border-secondary-700 p-6">
        <h2 className="text-xl font-bold text-secondary-900 dark:text-secondary-50 mb-6">
          Employee Information
        </h2>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-32 h-32 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
              {initials}
            </div>
          </div>

          {/* Employee Details */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">Full Name</p>
                <p className="text-base font-semibold text-secondary-900 dark:text-secondary-50">
                  {profile?.employee?.full_name || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">Gender</p>
                <p className="text-base font-semibold text-secondary-900 dark:text-secondary-50">
                  {profile?.employee?.gender === 'male' ? 'Male' : profile?.employee?.gender === 'female' ? 'Female' : 'Other'}
                </p>
              </div>
              <div>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">Address</p>
                <p className="text-base font-semibold text-secondary-900 dark:text-secondary-50">
                  {profile?.employee?.address || 'N/A'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">Position</p>
                <p className="text-base font-semibold text-secondary-900 dark:text-secondary-50">
                  {profile?.employee?.position?.name || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">Department</p>
                <p className="text-base font-semibold text-secondary-900 dark:text-secondary-50">
                  {profile?.employee?.department?.name || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">Email</p>
                <p className="text-base font-semibold text-secondary-900 dark:text-secondary-50">
                  {profile?.employee?.email || user?.email || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">Phone</p>
                <p className="text-base font-semibold text-secondary-900 dark:text-secondary-50">
                  {profile?.employee?.phone || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Work Days */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Work Days This Month</p>
              <p className="text-4xl font-bold text-blue-900 dark:text-blue-100 mt-2">{stats.workDays}</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Icon name="calendar" className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <button 
            onClick={() => navigate('/attendance-history')}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-2"
          >
            View Details →
          </button>
        </div>

        {/* Attendance Rate */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800 p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-green-700 dark:text-green-300 font-medium">On-Time Rate</p>
              <p className="text-4xl font-bold text-green-900 dark:text-green-100 mt-2">{stats.onTimeRate}%</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Icon name="check-circle" className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="text-sm text-green-700 dark:text-green-300 mt-2">
            {stats.lateCount} times late
          </p>
        </div>

        {/* Payroll */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800 p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">Current Month Salary</p>
              <p className="text-4xl font-bold text-purple-900 dark:text-purple-100 mt-2">
                {stats.upcomingPayroll > 0 ? formatMillions(stats.upcomingPayroll) : '0'}
              </p>
            </div>
            <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Icon name="dollar-sign" className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <button 
            onClick={() => navigate('/payroll')}
            className="text-sm text-purple-600 dark:text-purple-400 hover:underline mt-2"
          >
            View Payslip →
          </button>
        </div>
      </div>

      {/* Attendance Requests */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pending Requests */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-200 dark:border-amber-800 p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">Pending Requests</p>
              <p className="text-4xl font-bold text-amber-900 dark:text-amber-100 mt-2">{stats.attendanceRequests.pending}</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Icon name="clock" className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <button 
            onClick={() => navigate('/attendance-requests')}
            className="text-sm text-amber-600 dark:text-amber-400 hover:underline mt-2"
          >
            View Requests →
          </button>
        </div>

        {/* Approved Requests */}
        <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-xl border border-green-200 dark:border-green-800 p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-green-700 dark:text-green-300 font-medium">Approved Requests</p>
              <p className="text-4xl font-bold text-green-900 dark:text-green-100 mt-2">{stats.attendanceRequests.approved}</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Icon name="check-circle" className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Rejected Requests */}
        <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-xl border border-red-200 dark:border-red-800 p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-red-700 dark:text-red-300 font-medium">Rejected Requests</p>
              <p className="text-4xl font-bold text-red-900 dark:text-red-100 mt-2">{stats.attendanceRequests.rejected}</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <Icon name="x-circle" className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-md border border-secondary-200 dark:border-secondary-700 p-6">
        <h2 className="text-xl font-bold text-secondary-900 dark:text-secondary-50 mb-6">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/my-profile')}
            className="flex flex-col items-center gap-3 p-6 rounded-lg bg-secondary-50 dark:bg-secondary-900/50 hover:bg-secondary-100 dark:hover:bg-secondary-900/70 border border-secondary-200 dark:border-secondary-700 transition-all hover:shadow-md"
          >
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Icon name="user" className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300 text-center">
              My Profile
            </span>
          </button>

          <button
            onClick={() => navigate('/attendance')}
            className="flex flex-col items-center gap-3 p-6 rounded-lg bg-secondary-50 dark:bg-secondary-900/50 hover:bg-secondary-100 dark:hover:bg-secondary-900/70 border border-secondary-200 dark:border-secondary-700 transition-all hover:shadow-md"
          >
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Icon name="calendar-check" className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300 text-center">
              Attendance
            </span>
          </button>

          <button
            onClick={() => navigate('/payroll')}
            className="flex flex-col items-center gap-3 p-6 rounded-lg bg-secondary-50 dark:bg-secondary-900/50 hover:bg-secondary-100 dark:hover:bg-secondary-900/70 border border-secondary-200 dark:border-secondary-700 transition-all hover:shadow-md"
          >
            <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Icon name="dollar-sign" className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300 text-center">
              Payroll
            </span>
          </button>

        </div>
      </div>

      {/* Attendance Trends */}
      {/* Attendance Trends */}
      <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-md border border-secondary-200 dark:border-secondary-700 p-6">
        <h2 className="text-xl font-bold text-secondary-900 dark:text-secondary-50 mb-4">
          Attendance Progress (Last 7 Days)
        </h2>
        {attendanceTrends.length === 0 ? (
          <p className="text-center text-secondary-500 py-6">Loading trends...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            {attendanceTrends.map((trend, index) => {
              const statusConfig = {
                on_time: { color: 'bg-green-500', label: 'On Time', icon: 'check-circle', textColor: 'text-green-700 dark:text-green-300' },
                present: { color: 'bg-green-500', label: 'Present', icon: 'check-circle', textColor: 'text-green-700 dark:text-green-300' },
                late: { color: 'bg-amber-500', label: 'Late', icon: 'clock', textColor: 'text-amber-700 dark:text-amber-300' },
                absent: { color: 'bg-red-500', label: 'Absent', icon: 'x-circle', textColor: 'text-red-700 dark:text-red-300' },
              };

              const config = statusConfig[trend.status] || statusConfig.absent;

              return (
                <div key={index} className="flex flex-col items-center gap-2 p-3 rounded-lg bg-secondary-50 dark:bg-secondary-900/50 border border-secondary-100 dark:border-secondary-800">
                  <div className={`w-10 h-10 rounded-full ${config.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon name={config.icon} className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-xs text-secondary-900 dark:text-secondary-50">
                      {trend.day}
                    </p>
                    <p className="text-xs text-secondary-500 dark:text-secondary-400">
                      {new Date(trend.date).getDate()}/{new Date(trend.date).getMonth() + 1}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-md ${config.textColor} ${config.color}/20`}>
                    {config.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Attendance Details */}
      <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-md border border-secondary-200 dark:border-secondary-700">
        <div className="px-6 py-5 border-b border-secondary-200 dark:border-secondary-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-secondary-50">
            Attendance History
          </h2>
        </div>
        <div className="p-6">
          {recentAttendance.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="calendar-x" className="w-16 h-16 text-secondary-400 dark:text-secondary-600 mx-auto mb-4" />
              <p className="text-secondary-500">No attendance records this month</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-secondary-200 dark:border-secondary-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700 dark:text-secondary-300">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700 dark:text-secondary-300">Check In</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700 dark:text-secondary-300">Check Out</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700 dark:text-secondary-300">Hours</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700 dark:text-secondary-300">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAttendance.map((attendance) => (
                    <tr key={attendance.id} className="border-b border-secondary-100 dark:border-secondary-800 hover:bg-secondary-50 dark:hover:bg-secondary-900/30">
                      <td className="py-4 px-4 text-sm text-secondary-900 dark:text-secondary-50 font-medium">
                        {formatDate(attendance.date)}
                      </td>
                      <td className="py-4 px-4 text-sm text-secondary-600 dark:text-secondary-400">
                        {attendance.check_in || attendance.check_in_time || attendance.checkInTime || '-'}
                      </td>
                      <td className="py-4 px-4 text-sm text-secondary-600 dark:text-secondary-400">
                        {attendance.check_out || attendance.check_out_time || attendance.checkOutTime || '-'}
                      </td>
                      <td className="py-4 px-4 text-sm text-secondary-600 dark:text-secondary-400">
                        {attendance.total_hours || attendance.totalHours || attendance.work_hours || attendance.workHours
                          ? `${attendance.total_hours || attendance.totalHours || attendance.work_hours || attendance.workHours}h`
                          : '-'}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(attendance.status)}`}>
                          {getStatusLabel(attendance.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {recentAttendance.length > 0 && (
          <div className="px-6 py-4 border-t border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-900/30 flex justify-end">
            <button
              onClick={() => navigate('/attendance-history')}
              className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition"
            >
              View All →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
