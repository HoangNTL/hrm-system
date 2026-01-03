import React from 'react';

export default function AdminHeader({ selectedDate, today, onDateChange, onTodayClick }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Attendance management</h1>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {selectedDate !== today && (
          <button
            onClick={onTodayClick}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Today
          </button>
        )}
      </div>
    </div>
  );
}
