import { useState, useEffect } from 'react';
import axios from '@/api/axios';

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

        presentToday = Array.from(byEmployee.values()).filter(
          (a) => a.status === 'on_time' || a.status === 'present',
        ).length;
        lateToday = Array.from(byEmployee.values()).filter((a) => a.status === 'late').length;
        absentToday = Math.max(totalEmployees - presentToday - lateToday, 0);
      } catch (e) {
        console.error('Error loading attendance today:', e);
      }

      // Pending requests
      let pendingRequests = 0;
      try {
        const reqRes = await axios.get('/attendance-requests', {
          params: { status: 'pending', page: 1, limit: 1 },
        });
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

          const onTime = Array.from(byEmployee.values()).filter(
            (a) => a.status === 'on_time' || a.status === 'present',
          ).length;
          const late = Array.from(byEmployee.values()).filter((a) => a.status === 'late').length;
          const absent = Math.max(totalEmployees - onTime - late, 0);

          trends.push({ date: dateStr, day: dayName, onTime, late, absent });
        } catch {
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

  return {
    stats,
    attendanceTrends,
    loading,
  };
}
