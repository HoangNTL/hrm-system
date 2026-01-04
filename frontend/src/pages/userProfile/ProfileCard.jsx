import React from 'react';
import Icon from '@components/ui/Icon';

export default function ProfileCard({ 
  initials, 
  profile, 
  editing, 
  onEditClick, 
  onSave, 
  onCancel 
}) {
  return (
    <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 p-6">
      {/* Avatar */}
      <div className="flex justify-center mb-4">
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
          {initials}
        </div>
      </div>

      {/* Basic Info */}
      <div className="space-y-4 text-center">
        <div>
          <p className="text-xs text-secondary-500 dark:text-secondary-400 mb-1">Full Name</p>
          <p className="font-semibold text-secondary-900 dark:text-secondary-50">
            {profile?.employee?.full_name || 'User'}
          </p>
        </div>

        <div>
          <p className="text-xs text-secondary-500 dark:text-secondary-400 mb-1">Gender</p>
          <p className="font-semibold text-secondary-900 dark:text-secondary-50 capitalize">
            {profile?.employee?.gender || '—'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-secondary-200 dark:border-secondary-700">
          {editing ? (
            <div className="space-y-2">
              <button
                onClick={onSave}
                className="w-full px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-700 transition-colors font-medium"
              >
                Save Changes
              </button>
              <button
                onClick={onCancel}
                className="w-full px-4 py-2 rounded border border-secondary-200 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={onEditClick}
              className="w-full px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <Icon name="edit" className="w-4 h-4" />
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
