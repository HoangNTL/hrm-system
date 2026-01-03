import React from 'react';
import Icon from '@components/ui/Icon';

export default function ChangePasswordModal({
  isOpen,
  profile,
  pwdForm,
  showCurrentPassword,
  showNewPassword,
  showConfirmPassword,
  onClose,
  onSubmit,
  onPasswordFormChange,
  onTogglePasswordVisibility,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-50">
            Change Password
          </h3>
          <button
            onClick={onClose}
            className="text-secondary-500 hover:text-secondary-700"
          >
            ✕
          </button>
        </div>

        {profile?.must_change_password && (
          <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded text-sm text-amber-800 dark:text-amber-100">
            You are using a temporary password. Please set a new password.
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          {!profile?.must_change_password && (
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                Current Password *
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={pwdForm.currentPassword}
                  onChange={(e) => onPasswordFormChange('currentPassword', e.target.value)}
                  className="w-full rounded border border-secondary-300 dark:border-secondary-600 bg-white dark:bg-secondary-900 px-3 py-2 pr-10 text-sm"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => onTogglePasswordVisibility('current')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-500 hover:text-secondary-700 dark:hover:text-secondary-300"
                >
                  <Icon name={showCurrentPassword ? "eye-off" : "eye"} className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
              New Password *
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={pwdForm.newPassword}
                onChange={(e) => onPasswordFormChange('newPassword', e.target.value)}
                className="w-full rounded border border-secondary-300 dark:border-secondary-600 bg-white dark:bg-secondary-900 px-3 py-2 pr-10 text-sm"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => onTogglePasswordVisibility('new')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-500 hover:text-secondary-700 dark:hover:text-secondary-300"
              >
                <Icon name={showNewPassword ? "eye-off" : "eye"} className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
              Confirm Password *
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={pwdForm.confirmPassword}
                onChange={(e) => onPasswordFormChange('confirmPassword', e.target.value)}
                className="w-full rounded border border-secondary-300 dark:border-secondary-600 bg-white dark:bg-secondary-900 px-3 py-2 pr-10 text-sm"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => onTogglePasswordVisibility('confirm')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-500 hover:text-secondary-700 dark:hover:text-secondary-300"
              >
                <Icon name={showConfirmPassword ? "eye-off" : "eye"} className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded border border-secondary-200 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-700 transition-colors"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
