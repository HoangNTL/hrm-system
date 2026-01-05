import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/Icon';
import Table from '@components/ui/Table';
import Button from '@components/ui/Button';
import { useStaffDashboard } from './useStaffDashboard';

export default function StaffDashboard() {
  const navigate = useNavigate();
  const {
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
  } = useStaffDashboard();

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
              <Icon
                name="calendar-x"
                className="w-16 h-16 text-secondary-400 dark:text-secondary-600 mx-auto mb-4"
              />
              <p className="text-secondary-500">No attendance records this month</p>
            </div>
          ) : (
            <Table
              columns={[
                {
                  key: 'date',
                  label: 'Date',
                  render: (_cell, row) => (
                    <span className="text-sm text-secondary-900 dark:text-secondary-50 font-medium">
                      {formatDate(row.date)}
                    </span>
                  ),
                },
                {
                  key: 'checkIn',
                  label: 'Check In',
                  render: (_cell, row) => (
                    <span className="text-sm text-secondary-600 dark:text-secondary-400">
                      {row.check_in || row.check_in_time || row.checkInTime || '-'}
                    </span>
                  ),
                },
                {
                  key: 'checkOut',
                  label: 'Check Out',
                  render: (_cell, row) => (
                    <span className="text-sm text-secondary-600 dark:text-secondary-400">
                      {row.check_out || row.check_out_time || row.checkOutTime || '-'}
                    </span>
                  ),
                },
                {
                  key: 'hours',
                  label: 'Hours',
                  render: (_cell, row) => {
                    const hours =
                      row.total_hours ||
                      row.totalHours ||
                      row.work_hours ||
                      row.workHours;
                    return (
                      <span className="text-sm text-secondary-600 dark:text-secondary-400">
                        {hours ? `${hours}h` : '-'}
                      </span>
                    );
                  },
                },
                {
                  key: 'status',
                  label: 'Status',
                  render: (_cell, row) => (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        row.status,
                      )}`}
                    >
                      {getStatusLabel(row.status)}
                    </span>
                  ),
                },
              ]}
              data={recentAttendance}
            />
          )}
        </div>
        {recentAttendance.length > 0 && (
          <div className="px-6 py-4 border-t border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-900/30 flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => navigate('/attendance-history')}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              View All →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
