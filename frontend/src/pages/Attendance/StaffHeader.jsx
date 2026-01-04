import React from 'react';
import Icon from '@components/ui/Icon';
import { formatDate, formatTime } from './StaffUtils';

export default function StaffHeader({ currentTime }) {
  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">Attendance</h1>
        <p className="text-gray-600">{formatDate(new Date())}</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-8 mb-6">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Icon name="clock" className="w-6 h-6 text-blue-500" />
          <p className="text-gray-600 dark:text-gray-300 font-medium">Current time</p>
        </div>
        <div className="text-center">
          <p className="text-6xl font-bold text-blue-600 font-mono">
            {formatTime(currentTime)}
          </p>
        </div>
      </div>
    </>
  );
}
