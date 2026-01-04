import React from 'react';
import Icon from '@components/ui/Icon';
import { formatDateTime } from './AdminUtils';

export default function EmployeeList({ loading, employees, expandedEmployee, onToggleExpanded }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-10 text-gray-600">
        <Icon name="loader" className="w-6 h-6 animate-spin mr-2" /> Loading...
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="bg-white rounded-lg p-8 text-center text-gray-600">
        No attendance data for this day
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="w-full px-4 py-3 flex items-center gap-4 text-xs font-semibold text-gray-600 uppercase tracking-wide">
          <div className="flex-shrink-0 w-5" />
          <div className="flex-1">Employee</div>
          <div className="min-w-[150px]">Department</div>
          <div className="min-w-[80px] text-center">Shifts</div>
          <div className="min-w-[80px] text-center">Hours</div>
          <div className="min-w-[120px]">Status</div>
        </div>
      </div>

      {/* Employee rows */}
      {employees.map(group => (
        <div key={group.employee.id} className="bg-white rounded-lg border-2 border-gray-200 shadow-sm overflow-hidden hover:border-blue-300 transition">
          {/* Employee Row */}
          <button
            onClick={() => onToggleExpanded(group.employee.id)}
            className="w-full px-4 py-2.5 flex items-center gap-4 hover:bg-blue-50 transition"
          >
            <div className="flex-shrink-0">
              {expandedEmployee === group.employee.id ? (
                <Icon name="chevron-up" className="w-5 h-5 text-gray-600" />
              ) : (
                <Icon name="chevron-down" className="w-5 h-5 text-gray-600" />
              )}
            </div>

            {/* Employee Info */}
            <div className="flex-1 text-left">
              <h3 className="text-base font-semibold text-gray-900">{group.employee.full_name}</h3>
              <p className="text-xs text-gray-500">{group.employee.email}</p>
            </div>

            {/* Department */}
            <div className="text-sm text-gray-600 min-w-[150px]">
              {group.employee.department?.name || group.employee.department?.department_name || 'N/A'}
            </div>

            {/* Shift count */}
            <div className="text-sm font-semibold text-gray-800 min-w-[80px] text-center">
              {group.records.length} shifts
            </div>

            {/* Total hours */}
            <div className="text-sm font-semibold text-blue-600 min-w-[80px] text-center">
              {group.totalHours.toFixed(1)}h
            </div>

            {/* Status badge */}
            <div className="min-w-[120px]">
              {group.status === 'late' && (
                <span className="inline-block px-3 py-1 bg-amber-100 border border-amber-300 text-amber-800 text-xs font-semibold rounded-full">
                  Late {group.lateCount}
                </span>
              )}
              {group.status === 'absent' && (
                <span className="inline-block px-3 py-1 bg-rose-100 border border-rose-300 text-rose-800 text-xs font-semibold rounded-full">
                  Absent
                </span>
              )}
              {group.status === 'on-time' && (
                <span className="inline-block px-3 py-1 bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-semibold rounded-full">
                  On time
                </span>
              )}
            </div>
          </button>

          {/* Expanded Details */}
          {expandedEmployee === group.employee.id && (
            <div className="bg-blue-50 border-t-2 border-blue-200 px-4 py-3 space-y-3">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-300 text-gray-600 font-semibold">
                      <th className="text-left py-2 px-2">Shift</th>
                      <th className="text-center py-2 px-2">Check-in</th>
                      <th className="text-center py-2 px-2">Check-out</th>
                      <th className="text-center py-2 px-2">Hours</th>
                      <th className="text-center py-2 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.records.map(record => (
                      <tr key={record.id} className="border-b border-gray-200 hover:bg-white transition">
                        <td className="py-3 px-2 font-semibold text-gray-800">
                          {record.shift?.shift_name || 'Shift'}
                        </td>
                        <td className="py-3 px-2 text-center font-mono text-green-600">
                          {formatDateTime(record.check_in)}
                        </td>
                        <td className="py-3 px-2 text-center font-mono text-orange-600">
                          {formatDateTime(record.check_out) || '--:--'}
                        </td>
                        <td className="py-3 px-2 text-center font-semibold text-blue-600">
                          {parseFloat(record.work_hours).toFixed(2)}h
                        </td>
                        <td className="py-3 px-2 text-center">
                          {record.status === 'late' && (
                            <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded">
                              Late
                            </span>
                          )}
                          {record.status === 'absent' && (
                            <span className="inline-block px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">
                              Absent
                            </span>
                          )}
                          {record.status === 'on-time' && (
                            <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                              On time
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
