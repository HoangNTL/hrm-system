import React from 'react';

export default function WorkInfoTab({ profile }) {
  return (
    <div className="space-y-1">
      {/* Department */}
      <div className="grid grid-cols-3 gap-4 py-3 border-b border-secondary-100 dark:border-secondary-700">
        <div className="text-sm text-secondary-600 dark:text-secondary-400">Department</div>
        <div className="col-span-2">
          <p className="text-sm font-medium text-secondary-900 dark:text-secondary-50">
            {profile?.employee?.department?.name || '—'}
          </p>
        </div>
      </div>

      {/* Position */}
      <div className="grid grid-cols-3 gap-4 py-3 border-b border-secondary-100 dark:border-secondary-700">
        <div className="text-sm text-secondary-600 dark:text-secondary-400">Position</div>
        <div className="col-span-2">
          <p className="text-sm font-medium text-secondary-900 dark:text-secondary-50">
            {profile?.employee?.position?.name || '—'}
          </p>
        </div>
      </div>

      {/* Hire Date */}
      <div className="grid grid-cols-3 gap-4 py-3 border-b border-secondary-100 dark:border-secondary-700">
        <div className="text-sm text-secondary-600 dark:text-secondary-400">Hire Date</div>
        <div className="col-span-2">
          <p className="text-sm font-medium text-secondary-900 dark:text-secondary-50">
            {profile?.employee?.hire_date
              ? new Date(profile.employee.hire_date).toLocaleDateString('vi-VN')
              : '—'}
          </p>
        </div>
      </div>

      {/* Work Status */}
      <div className="grid grid-cols-3 gap-4 py-3">
        <div className="text-sm text-secondary-600 dark:text-secondary-400">Work Status</div>
        <div className="col-span-2">
          <p className="text-sm font-medium text-secondary-900 dark:text-secondary-50 capitalize">
            {profile?.employee?.work_status || '—'}
          </p>
        </div>
      </div>
    </div>
  );
}
