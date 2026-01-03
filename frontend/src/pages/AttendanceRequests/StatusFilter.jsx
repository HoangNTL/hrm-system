import React from 'react';
import { getStatusLabel } from './RequestUtils';

export default function StatusFilter({ statusFilter, onFilterChange }) {
  const statuses = ['', 'pending', 'approved', 'rejected'];

  return (
    <div className="mb-6 flex gap-2">
      {statuses.map((status) => (
        <button
          key={status}
          onClick={() => onFilterChange(status)}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            statusFilter === status
              ? 'bg-blue-600 text-white'
              : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700 hover:border-blue-400'
          }`}
        >
          {status === '' ? 'Tất cả' : getStatusLabel(status)}
        </button>
      ))}
    </div>
  );
}
