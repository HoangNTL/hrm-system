import React from 'react';
import Button from '@components/ui/Button';

export default function SecurityTab({ profile, onChangePasswordClick }) {
  const isMustChange = profile?.must_change_password;

  return (
    <div className="space-y-1">
      {/* Password */}
      <div className="grid grid-cols-3 gap-4 py-3">
        <div className="text-sm text-secondary-600 dark:text-secondary-400">Password</div>
        <div className="col-span-2 flex items-center justify-between">
          <p className="text-sm font-medium text-secondary-900 dark:text-secondary-50">
            {isMustChange ? '⚠ Change required' : 'Strong password'}
          </p>
          <Button
            onClick={onChangePasswordClick}
            size="sm"
          >
            Change Password
          </Button>
        </div>
      </div>
    </div>
  );
}
