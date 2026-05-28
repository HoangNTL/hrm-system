import React from 'react';

// Color based on percentage (red -> yellow -> green)
const getTrendBarColor = (percentage) => {
  if (percentage < 50) return 'bg-red-500';
  if (percentage < 75) return 'bg-yellow-500';
  return 'bg-green-500';
};

export default function AttendanceTrendChart({ data }) {
  return (
    <div className="bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-semibold text-secondary-900 dark:text-secondary-50">
            Attendance trend (last 7 days)
          </h2>
          <p className="text-sm text-secondary-500">On-time percentage</p>
        </div>
      </div>
      <div className="flex items-end gap-2 h-48 w-full">
        {data.map((item, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full">
            <div className="flex-1 flex items-end w-full">
              <div
                className={`w-full ${getTrendBarColor(item.value)} rounded`}
                style={{ height: `${item.value}%` }}
              />
            </div>
            <span className="text-xs text-secondary-500 whitespace-nowrap">
              {item.label} ({item.value}%)
            </span>
          </div>
        ))}
        {data.length === 0 && (
          <div className="text-secondary-500 text-sm">No data</div>
        )}
      </div>
    </div>
  );
}
