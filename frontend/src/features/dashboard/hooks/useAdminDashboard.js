import { useState, useEffect } from 'react';
import { fetchAllPaginatedItems, normalizePaginatedPayload } from '@/utils/paginatedFetch';
import { dashboardAPI } from '../api/dashboard.api';

export function useAdminDashboard() {
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

      const currentDate = new Date();
      const rangeStart = new Date(currentDate);
      rangeStart.setDate(rangeStart.getDate() - 6);
      const rangeStartStr = rangeStart.toISOString().split('T')[0];
      const today = currentDate.toISOString().split('T')[0];

      const [employeesRes, departmentsRes, reqRes, attendanceRange] = await Promise.all([
        dashboardAPI.getEmployees({ page: 1, limit: 1 }),
        dashboardAPI.getDepartments({ page: 1, limit: 1 }),
        dashboardAPI.getPendingAttendanceRequests({ status: 'pending', page: 1, limit: 1 }),
        fetchAllPaginatedItems(
          (page, limit) =>
            dashboardAPI.getAttendance({
              fromDate: rangeStartStr,
              toDate: today,
              page,
              limit,
            }),
          { pageSize: 250 },
        ),
      ]);

      const employeesPage = normalizePaginatedPayload(employeesRes);
      const departmentsPage = normalizePaginatedPayload(departmentsRes);
      const pendingRequests =
        reqRes?.data?.total ||
        reqRes?.pagination?.total ||
        reqRes?.total ||
        0;

      const totalEmployees = employeesPage.pagination.total || employeesPage.items.length;
      const totalDepartments = departmentsPage.pagination.total || departmentsPage.items.length;

      const statusPriority = { on_time: 2, present: 2, late: 1 };
      const byDate = new Map();
      attendanceRange.forEach((attendance) => {
        const employeeKey =
          attendance.employee_id || attendance.employeeId || attendance.employee?.id || attendance.id;
        const dateKey = String(attendance.date || '').slice(0, 10);
        if (!employeeKey || !dateKey) return;

        if (!byDate.has(dateKey)) {
          byDate.set(dateKey, new Map());
        }

        const dailyMap = byDate.get(dateKey);
        const priority = statusPriority[attendance.status] || 0;
        const current = dailyMap.get(employeeKey);
        if (!current || priority > current.priority) {
          dailyMap.set(employeeKey, { status: attendance.status, priority });
        }
      });

      const trends = [];
      let presentToday = 0;
      let lateToday = 0;
      let absentToday = totalEmployees;

      for (let i = 6; i >= 0; i--) {
        const date = new Date(currentDate);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dailyMap = byDate.get(dateStr) || new Map();
        const statuses = Array.from(dailyMap.values());

        const onTime = statuses.filter(
          (entry) => entry.status === 'on_time' || entry.status === 'present',
        ).length;
        const late = statuses.filter((entry) => entry.status === 'late').length;
        const absent = Math.max(totalEmployees - onTime - late, 0);

        if (dateStr === today) {
          presentToday = onTime;
          lateToday = late;
          absentToday = absent;
        }

        trends.push({ date: dateStr, day: dayName, onTime, late, absent });
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

  return {
    stats,
    attendanceTrends,
    loading,
  };
}
