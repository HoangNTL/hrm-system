import React from 'react';
import { getShiftTime } from './StaffUtils';

export default function ShiftSelector({ shifts, selectedShiftId, shift, onShiftChange }) {
  const currentShift = shifts.find(s => s.id === selectedShiftId) || shift;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-8 mb-6">
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Work shift</h2>
      <div className="mb-4">
        <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">Choose shift:</label>
        <select
          value={selectedShiftId || ''}
          onChange={(e) => onShiftChange(parseInt(e.target.value))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Select shift --</option>
          {shifts.map(s => (
            <option key={s.id} value={s.id}>
              {s.shift_name} ({getShiftTime(s.start_time)} - {getShiftTime(s.end_time)})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-1">Shift</p>
          <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">{currentShift?.shift_name || '—'}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-1">Start</p>
          <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            {getShiftTime(currentShift?.start_time)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-1">End</p>
          <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            {getShiftTime(currentShift?.end_time)}
          </p>
        </div>
      </div>
    </div>
  );
}
