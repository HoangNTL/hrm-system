import React from 'react';

export default function PersonalInfoTab({ profile, editing, editData, onEditDataChange }) {
  return (
    <div className="space-y-1">
      {/* Full Name */}
      <div className="grid grid-cols-3 gap-4 py-3 border-b border-secondary-100 dark:border-secondary-700">
        <div className="text-sm text-secondary-600 dark:text-secondary-400">Full Name</div>
        <div className="col-span-2">
          {editing ? (
            <input
              type="text"
              value={editData.full_name}
              onChange={(e) => onEditDataChange('full_name', e.target.value)}
              className="w-full rounded border border-secondary-300 dark:border-secondary-600 bg-white dark:bg-secondary-900 px-3 py-1.5 text-sm text-secondary-900 dark:text-secondary-50"
            />
          ) : (
            <p className="text-sm font-medium text-secondary-900 dark:text-secondary-50">
              {profile?.employee?.full_name || '—'}
            </p>
          )}
        </div>
      </div>

      {/* Email */}
      <div className="grid grid-cols-3 gap-4 py-3 border-b border-secondary-100 dark:border-secondary-700">
        <div className="text-sm text-secondary-600 dark:text-secondary-400">Email</div>
        <div className="col-span-2">
          <p className="text-sm font-medium text-secondary-900 dark:text-secondary-50">
            {profile?.employee?.email || profile?.email || '—'}
          </p>
        </div>
      </div>

      {/* Phone */}
      <div className="grid grid-cols-3 gap-4 py-3 border-b border-secondary-100 dark:border-secondary-700">
        <div className="text-sm text-secondary-600 dark:text-secondary-400">Phone</div>
        <div className="col-span-2">
          {editing ? (
            <input
              type="tel"
              value={editData.phone}
              onChange={(e) => onEditDataChange('phone', e.target.value)}
              className="w-full rounded border border-secondary-300 dark:border-secondary-600 bg-white dark:bg-secondary-900 px-3 py-1.5 text-sm text-secondary-900 dark:text-secondary-50"
            />
          ) : (
            <p className="text-sm font-medium text-secondary-900 dark:text-secondary-50">
              {profile?.employee?.phone || '—'}
            </p>
          )}
        </div>
      </div>

      {/* Gender */}
      <div className="grid grid-cols-3 gap-4 py-3 border-b border-secondary-100 dark:border-secondary-700">
        <div className="text-sm text-secondary-600 dark:text-secondary-400">Gender</div>
        <div className="col-span-2">
          {editing ? (
            <select
              value={editData.gender}
              onChange={(e) => onEditDataChange('gender', e.target.value)}
              className="w-full rounded border border-secondary-300 dark:border-secondary-600 bg-white dark:bg-secondary-900 px-3 py-1.5 text-sm text-secondary-900 dark:text-secondary-50"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          ) : (
            <p className="text-sm font-medium text-secondary-900 dark:text-secondary-50 capitalize">
              {profile?.employee?.gender || '—'}
            </p>
          )}
        </div>
      </div>

      {/* Date of Birth */}
      <div className="grid grid-cols-3 gap-4 py-3 border-b border-secondary-100 dark:border-secondary-700">
        <div className="text-sm text-secondary-600 dark:text-secondary-400">Date of Birth</div>
        <div className="col-span-2">
          {editing ? (
            <input
              type="date"
              value={editData.dob}
              onChange={(e) => onEditDataChange('dob', e.target.value)}
              className="w-full rounded border border-secondary-300 dark:border-secondary-600 bg-white dark:bg-secondary-900 px-3 py-1.5 text-sm text-secondary-900 dark:text-secondary-50"
            />
          ) : (
            <p className="text-sm font-medium text-secondary-900 dark:text-secondary-50">
              {profile?.employee?.dob
                ? new Date(profile.employee.dob).toLocaleDateString('vi-VN')
                : '—'}
            </p>
          )}
        </div>
      </div>

      {/* Address */}
      <div className="grid grid-cols-3 gap-4 py-3">
        <div className="text-sm text-secondary-600 dark:text-secondary-400">Address</div>
        <div className="col-span-2">
          {editing ? (
            <textarea
              value={editData.address}
              onChange={(e) => onEditDataChange('address', e.target.value)}
              className="w-full rounded border border-secondary-300 dark:border-secondary-600 bg-white dark:bg-secondary-900 px-3 py-1.5 text-sm text-secondary-900 dark:text-secondary-50"
              rows="2"
            />
          ) : (
            <p className="text-sm font-medium text-secondary-900 dark:text-secondary-50">
              {profile?.employee?.address || '—'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
