import Icon from '@/components/ui/Icon';
import { useAdminDashboard } from './useAdminDashboard';

export default function AdminDashboard() {
  const { stats, attendanceTrends, loading } = useAdminDashboard();

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
