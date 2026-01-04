import React from 'react';

export default function SecurityTab({ profile, onChangePasswordClick }) {
  return (
    <div className="space-y-1">
      {/* Password */}
      <div className="grid grid-cols-3 gap-4 py-3">
        <div className="text-sm text-secondary-600 dark:text-secondary-400">Password</div>
        <div className="col-span-2 flex items-center justify-between">
          <p className="text-sm font-medium text-secondary-900 dark:text-secondary-50">
            {profile?.must_change_password ? '⚠ Change required' : 'Strong password'}
          </p>
          <button
            onClick={onChangePasswordClick}
            className="px-4 py-1.5 rounded bg-primary-600 text-white hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            Change Password
          </button>
        </div>
      </div>
    </div>
  );
}
