import React from 'react';

export default function StatsBadges({ stats }) {
  const badges = [
    {
      label: 'Shifts',
      value: `${stats.workedShifts}/${stats.totalShifts}`,
      color: 'bg-emerald-100 text-emerald-700 border border-emerald-200'
    },
    {
      label: 'Late',
      value: stats.lateCount,
      color: 'bg-amber-100 text-amber-700 border border-amber-200'
    },
    {
      label: 'Late mins',
      value: stats.totalLateMinutes,
      color: 'bg-amber-50 text-amber-700 border border-amber-100'
    },
    {
      label: 'Absent',
      value: stats.absentCount,
      color: 'bg-rose-50 text-rose-700 border border-rose-100'
    },
    {
      label: 'Hours',
      value: stats.totalHours.toFixed(1),
      color: 'bg-blue-50 text-blue-700 border border-blue-100'
    }
  ];

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm mb-4">
      {badges.map(item => (
        <span key={item.label} className={`px-3 py-2 font-semibold inline-flex items-center gap-2 ${item.color}`}>
          <span className="text-xs uppercase tracking-wide text-gray-600">{item.label}</span>
          <span className="text-base">{item.value}</span>
        </span>
      ))}
    </div>
  );
}
