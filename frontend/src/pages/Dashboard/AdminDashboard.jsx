import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/Icon';
import axios from '@/api/axios';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalDepartments: 0,
    presentToday: 0,
    lateToday: 0,
    absentToday: 0,
    onLeaveToday: 0,
    pendingRequests: 0,
  });
  const [attendanceTrends, setAttendanceTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load employees
      const employeesRes = await axios.get('/employees', { params: { page: 1, limit: 1000 } });
      const employeesData = employeesRes?.data?.data || {};
      const employees = employeesData.employees || [];
      const totalEmployees = employeesData.pagination?.total || employees.length;

      // Load departments
      const departmentsRes = await axios.get('/departments', { params: { page: 1, limit: 100 } });
      const departmentsData = departmentsRes?.data?.data || {};
      const departments = departmentsData.departments || [];
      const totalDepartments = departmentsData.pagination?.total || departments.length;

      // Today's attendance
      const today = new Date().toISOString().split('T')[0];
      let presentToday = 0;
      let lateToday = 0;
      let absentToday = 0;
      try {
        const attendanceRes = await axios.get('/attendance', {
          params: { fromDate: today, toDate: today, page: 1, limit: 1000 },
        });
        const attendanceData = attendanceRes?.data?.data || {};
        const attendances = attendanceData.data || attendanceData.attendances || [];

        const statusPriority = { on_time: 2, present: 2, late: 1 };
        const byEmployee = new Map();
        attendances.forEach((a) => {
          const key = a.employee_id || a.employeeId || a.employee?.id || a.id;
          if (!key) return;
          const priority = statusPriority[a.status] || 0;
          const current = byEmployee.get(key);
          if (!current || priority > current.priority) {
            byEmployee.set(key, { status: a.status, priority });
          }
        });

        presentToday = Array.from(byEmployee.values()).filter((a) => a.status === 'on_time' || a.status === 'present').length;
        lateToday = Array.from(byEmployee.values()).filter((a) => a.status === 'late').length;
        absentToday = Math.max(totalEmployees - presentToday - lateToday, 0);
      } catch (e) {
        console.error('Error loading attendance today:', e);
      }

      // Pending requests
      let pendingRequests = 0;
      try {
        const reqRes = await axios.get('/attendance-requests', { params: { status: 'pending', page: 1, limit: 1 } });
        pendingRequests = reqRes?.data?.data?.total || 0;
      } catch (e) {
        console.error('Error loading pending requests:', e);
      }

      // Attendance trends last 7 days
      const trends = [];
      const currentDate = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(currentDate);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

        try {
          const res = await axios.get('/attendance', {
            params: { fromDate: dateStr, toDate: dateStr, page: 1, limit: 1000 },
          });
          const attendanceData = res?.data?.data || {};
          const attendances = attendanceData.data || attendanceData.attendances || [];

          const statusPriority = { on_time: 2, present: 2, late: 1 };
          const byEmployee = new Map();
          attendances.forEach((a) => {
            const key = a.employee_id || a.employeeId || a.employee?.id || a.id;
            if (!key) return;
            const priority = statusPriority[a.status] || 0;
            const current = byEmployee.get(key);
            if (!current || priority > current.priority) {
              byEmployee.set(key, { status: a.status, priority });
            }
          });

          const onTime = Array.from(byEmployee.values()).filter((a) => a.status === 'on_time' || a.status === 'present').length;
          const late = Array.from(byEmployee.values()).filter((a) => a.status === 'late').length;
          const absent = Math.max(totalEmployees - onTime - late, 0);

          trends.push({ date: dateStr, day: dayName, onTime, late, absent });
        } catch (e) {
          trends.push({ date: dateStr, day: dayName, onTime: 0, late: 0, absent: totalEmployees });
        }
      }

      setStats({
        totalEmployees,
        totalDepartments,
        presentToday,
        lateToday,
        absentToday,
        onLeaveToday: 0,
        pendingRequests,
      });
      setAttendanceTrends(trends);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-secondary-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-50">
          Dashboard
        </h1>
        <p className="text-secondary-600 dark:text-secondary-400 mt-2">
          Welcome back! Here's what's happening with your organization today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Employees */}
        <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-md border border-secondary-200 dark:border-secondary-700 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">Total Employees</p>
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Icon name="users" className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-4xl font-bold text-secondary-900 dark:text-secondary-50">{stats.totalEmployees}</p>
          <p className="text-sm text-secondary-500 mt-2">Active employees</p>
        </div>

        {/* Departments */}
        <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-md border border-secondary-200 dark:border-secondary-700 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">Departments</p>
            <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Icon name="building" className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p className="text-4xl font-bold text-secondary-900 dark:text-secondary-50">{stats.totalDepartments}</p>
          <p className="text-sm text-secondary-500 mt-2">Active departments</p>
        </div>

        {/* Present Today */}
        <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-md border border-secondary-200 dark:border-secondary-700 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">Present Today</p>
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Icon name="check-circle" className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="text-4xl font-bold text-secondary-900 dark:text-secondary-50">{stats.presentToday}</p>
          <p className="text-sm text-secondary-500 mt-2">
            {stats.lateToday > 0 && `${stats.lateToday} late`}
          </p>
        </div>

        {/* Absent Today */}
        <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-md border border-secondary-200 dark:border-secondary-700 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">Absent Today</p>
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <Icon name="x-circle" className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <p className="text-4xl font-bold text-secondary-900 dark:text-secondary-50">{stats.absentToday}</p>
          <p className="text-sm text-secondary-500 mt-2">Not checked in</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-md border border-secondary-200 dark:border-secondary-700 p-6">
        <h2 className="text-xl font-bold text-secondary-900 dark:text-secondary-50 mb-6">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/employees')}
            className="flex items-center gap-4 p-5 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-2 border-blue-200 dark:border-blue-800 hover:shadow-lg hover:scale-105 transition-all group"
          >
            <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
              <Icon name="user-plus" className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <p className="font-bold text-blue-900 dark:text-blue-100 text-lg">Add Employee</p>
              <p className="text-sm text-blue-700 dark:text-blue-300">Create new employee</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/approve-attendance-requests')}
            className="flex items-center gap-4 p-5 rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-2 border-green-200 dark:border-green-800 hover:shadow-lg hover:scale-105 transition-all group relative"
          >
            <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center group-hover:bg-green-600 transition-colors">
              <Icon name="clipboard-check" className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <p className="font-bold text-green-900 dark:text-green-100 text-lg">Mark Attendance</p>
              <p className="text-sm text-green-700 dark:text-green-300">Approve attendance requests</p>
            </div>
            {stats.pendingRequests > 0 && (
              <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold">
                {stats.pendingRequests}
              </div>
            )}
          </button>

          <button
            onClick={() => navigate('/reports')}
            className="flex items-center gap-4 p-5 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-2 border-purple-200 dark:border-purple-800 hover:shadow-lg hover:scale-105 transition-all group"
          >
            <div className="w-14 h-14 rounded-full bg-purple-500 flex items-center justify-center group-hover:bg-purple-600 transition-colors">
              <Icon name="file-text" className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <p className="font-bold text-purple-900 dark:text-purple-100 text-lg">View Reports</p>
              <p className="text-sm text-purple-700 dark:text-purple-300">Analytics & insights</p>
            </div>
          </button>
        </div>
      </div>

      {/* Attendance Overview */}
      <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-md border border-secondary-200 dark:border-secondary-700 p-6">
        <h2 className="text-xl font-bold text-secondary-900 dark:text-secondary-50 mb-6">
          Today's Attendance Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Icon name="check-circle" className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-green-700 dark:text-green-300 font-medium">On Time</p>
              <p className="text-3xl font-bold text-green-900 dark:text-green-100">{stats.presentToday}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Icon name="clock" className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">Late</p>
              <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">{stats.lateToday}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <Icon name="x-circle" className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-red-700 dark:text-red-300 font-medium">Absent</p>
              <p className="text-3xl font-bold text-red-900 dark:text-red-100">{stats.absentToday}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Trends */}
      <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-md border border-secondary-200 dark:border-secondary-700 p-6">
        <h2 className="text-xl font-bold text-secondary-900 dark:text-secondary-50 mb-6">
          Attendance Trends (Last 7 Days)
        </h2>
        {attendanceTrends.length === 0 ? (
          <p className="text-center text-secondary-500 py-8">Loading trends...</p>
        ) : (
          <>
            {/* Compact Legend */}
            <div className="flex justify-center gap-4 pb-4 text-xs font-medium text-secondary-700 dark:text-secondary-300">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded bg-green-500" />
                <span>On Time</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded bg-amber-500" />
                <span>Late</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded bg-red-500" />
                <span>Absent</span>
              </div>
            </div>

            {/* Column Chart */}
            <div className="flex items-end justify-between gap-2 h-64 px-4">
              {attendanceTrends.map((trend, index) => {
                const total = trend.onTime + trend.late + trend.absent;
                const maxValue = Math.max(...attendanceTrends.map(t => t.onTime + t.late + t.absent));
                const heightPercent = maxValue > 0 ? ((total / maxValue) * 100) : 0;
                const onTimeHeight = total > 0 ? (trend.onTime / total) * heightPercent : 0;
                const lateHeight = total > 0 ? (trend.late / total) * heightPercent : 0;
                const absentHeight = total > 0 ? (trend.absent / total) * heightPercent : 0;

                return (
                  <div key={index} className="flex flex-col items-center flex-1 gap-2">
                    {/* Column */}
                    <div className="flex flex-col-reverse justify-start w-full rounded-t-lg overflow-hidden" style={{ height: '100%' }}>
                      <div className="flex flex-col w-full" style={{ height: `${heightPercent}%` }}>
                        {trend.absent > 0 && (
                          <div
                            className="bg-red-500 flex items-center justify-center text-[10px] font-semibold text-white w-full"
                            style={{ height: `${(trend.absent / total) * 100}%` }}
                            title={`Absent: ${trend.absent}`}
                          >
                            {absentHeight > 12 && trend.absent}
                          </div>
                        )}
                        {trend.late > 0 && (
                          <div
                            className="bg-amber-500 flex items-center justify-center text-[10px] font-semibold text-white w-full"
                            style={{ height: `${(trend.late / total) * 100}%` }}
                            title={`Late: ${trend.late}`}
                          >
                            {lateHeight > 12 && trend.late}
                          </div>
                        )}
                        {trend.onTime > 0 && (
                          <div
                            className="bg-green-500 flex items-center justify-center text-[10px] font-semibold text-white w-full"
                            style={{ height: `${(trend.onTime / total) * 100}%` }}
                            title={`On Time: ${trend.onTime}`}
                          >
                            {onTimeHeight > 12 && trend.onTime}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Day Label */}
                    <div className="text-center pt-2 border-t border-secondary-200 dark:border-secondary-700 w-full">
                      <span className="text-[11px] font-semibold text-secondary-700 dark:text-secondary-300 block">
                        {trend.day}
                      </span>
                      <div className="flex gap-1 justify-center mt-1 text-[9px] font-medium">
                        <span className="text-green-700 dark:text-green-400">{trend.onTime}</span>
                        <span className="text-amber-700 dark:text-amber-400">{trend.late}</span>
                        <span className="text-red-700 dark:text-red-400">{trend.absent}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
