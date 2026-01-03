import React from 'react';

export default function KpiCards({ kpis, loading }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {kpis.map((item) => (
        <div
          key={item.label}
          className="bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-lg p-4 shadow-sm"
        >
          <p className="text-sm text-secondary-500">{item.label}</p>
          <p className="text-2xl font-semibold text-secondary-900 dark:text-secondary-50 mt-1">
            {item.value}
          </p>
        </div>
      ))}
      {loading && kpis.length === 0 && (
        <div className="text-secondary-500">Loading...</div>
      )}
    </div>
  );
}
