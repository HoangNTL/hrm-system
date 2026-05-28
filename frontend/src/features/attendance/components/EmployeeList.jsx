import React from 'react';
import Icon from '@components/ui/Icon';
import Table from '@components/ui/Table';
import { formatDateTime } from './AdminUtils';

export default function EmployeeList({ loading, employees, expandedEmployee, onToggleExpanded }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-10 text-gray-600 dark:text-secondary-300">
        <Icon name="loader" className="w-6 h-6 animate-spin mr-2" /> Loading...
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="bg-white dark:bg-secondary-800 rounded-lg p-8 text-center text-gray-600 dark:text-secondary-300">
        No attendance data for this day
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header row using basic flex, keeps expandable layout */}
      <div className="bg-white dark:bg-secondary-800 rounded-lg border border-gray-200 dark:border-secondary-700">
        <div className="w-full px-4 py-3 flex items-center gap-4 text-xs font-semibold text-gray-600 dark:text-secondary-300 uppercase tracking-wide">
          <div className="flex-shrink-0 w-5" />
          <div className="flex-1">Employee</div>
          <div className="min-w-[150px]">Department</div>
          <div className="min-w-[80px] text-center">Shifts</div>
          <div className="min-w-[80px] text-center">Hours</div>
          <div className="min-w-[120px]">Status</div>
        </div>
      </div>

      {/* Employee rows */}
      {employees.map((group) => (
        <div
          key={group.employee.id}
          className="bg-white dark:bg-secondary-800 rounded-lg border-2 border-gray-200 dark:border-secondary-700 shadow-sm overflow-hidden hover:border-primary-300 transition"
        >
          {/* Employee Row */}
          <button
            onClick={() => onToggleExpanded(group.employee.id)}
            className="w-full px-4 py-2.5 flex items-center gap-4 hover:bg-primary-50 dark:hover:bg-secondary-700/40 transition"
          >
            <div className="flex-shrink-0">
              {expandedEmployee === group.employee.id ? (
                <Icon name="chevron-up" className="w-5 h-5 text-gray-600 dark:text-secondary-200" />
              ) : (
                <Icon name="chevron-down" className="w-5 h-5 text-gray-600 dark:text-secondary-200" />
              )}
            </div>

            {/* Employee Info */}
            <div className="flex-1 text-left">
              <h3 className="text-base font-semibold text-gray-900 dark:text-secondary-50">
                {group.employee.full_name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-secondary-300">
                {group.employee.email}
              </p>
            </div>

            {/* Department */}
            <div className="text-sm text-gray-600 dark:text-secondary-200 min-w-[150px]">
              {group.employee.department?.name ||
                group.employee.department?.department_name ||
                'N/A'}
            </div>

            {/* Shift count */}
            <div className="text-sm font-semibold text-gray-800 dark:text-secondary-50 min-w-[80px] text-center">
              {group.records.length} shifts
            </div>

            {/* Total hours */}
            <div className="text-sm font-semibold text-blue-600 dark:text-primary-300 min-w-[80px] text-center">
              {group.totalHours.toFixed(1)}h
            </div>

            {/* Status badge */}
            <div className="min-w-[120px]">
              {group.status === 'late' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 border border-amber-300 text-amber-800 text-xs font-semibold rounded-full">
                  <Icon name="alert-circle" className="w-4 h-4" />
                  <span>Late {group.lateCount}</span>
                </span>
              )}
              {group.status === 'absent' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-100 border border-rose-300 text-rose-800 text-xs font-semibold rounded-full">
                  <Icon name="x-circle" className="w-4 h-4" />
                  <span>Absent</span>
                </span>
              )}
              {group.status === 'on-time' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-semibold rounded-full">
                  <Icon name="check-circle" className="w-4 h-4" />
                  <span>On time</span>
                </span>
              )}
            </div>
          </button>

          {/* Expanded Details using shared Table component */}
          {expandedEmployee === group.employee.id && (
            <div className="bg-primary-50/60 dark:bg-secondary-900 border-t-2 border-primary-200 px-4 py-3 space-y-3">
              <Table
                columns={[
                  {
                    key: 'shift',
                    label: 'Shift',
                    render: (_value, row) => (
                      <span className="font-semibold text-gray-800 dark:text-secondary-50">
                        {row.shift?.shift_name || 'Shift'}
                      </span>
                    ),
                  },
                  {
                    key: 'check_in',
                    label: 'Check-in',
                    render: (value) => (
                      <span className="font-mono text-green-600 dark:text-emerald-400">
                        {formatDateTime(value)}
                      </span>
                    ),
                  },
                  {
                    key: 'check_out',
                    label: 'Check-out',
                    render: (value) => (
                      <span className="font-mono text-orange-600 dark:text-amber-400">
                        {formatDateTime(value) || '--:--'}
                      </span>
                    ),
                  },
                  {
                    key: 'work_hours',
                    label: 'Hours',
                    render: (value) => (
                      <span className="font-semibold text-blue-600 dark:text-primary-300">
                        {parseFloat(value).toFixed(2)}h
                      </span>
                    ),
                  },
                  {
                    key: 'status',
                    label: 'Status',
                    render: (value) => (
                      <div className="flex justify-center">
                        {value === 'late' && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded">
                            <Icon name="alert-circle" className="w-4 h-4" />
                            <span>Late</span>
                          </span>
                        )}
                        {value === 'absent' && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">
                            <Icon name="x-circle" className="w-4 h-4" />
                            <span>Absent</span>
                          </span>
                        )}
                        {value === 'on-time' && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                            <Icon name="check-circle" className="w-4 h-4" />
                            <span>On time</span>
                          </span>
                        )}
                      </div>
                    ),
                  },
                ]}
                data={group.records}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
