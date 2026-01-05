import React from 'react';
import Select from '@components/ui/Select';
import { getShiftTime } from './StaffUtils';

export default function ShiftSelector({ shifts, selectedShiftId, shift, onShiftChange }) {
  const currentShift = shifts.find(s => s.id === selectedShiftId) || shift;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-8 mb-6">
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Work shift</h2>
      <div className="mb-4">
        <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">Choose shift:</label>
        <Select
          name="shift"
          value={selectedShiftId || ''}
          onChange={(e) => onShiftChange(e.target.value ? parseInt(e.target.value, 10) : null)}
          options={[
            { value: '', label: '-- Select shift --' },
            ...shifts.map((s) => ({
              value: String(s.id),
              label: `${s.shift_name} (${getShiftTime(s.start_time)} - ${getShiftTime(s.end_time)})`,
            })),
          ]}
        />
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
