import React from 'react';

// Color palette for different items
const colorPalette = ['indigo', 'blue', 'cyan', 'teal', 'green', 'emerald', 'violet'];

const getBarColor = (index) => {
  const colors = {
    indigo: 'bg-indigo-500',
    blue: 'bg-blue-500',
    cyan: 'bg-cyan-500',
    teal: 'bg-teal-500',
    green: 'bg-green-500',
    emerald: 'bg-emerald-500',
    violet: 'bg-violet-500',
  };
  return colors[colorPalette[index % colorPalette.length]];
};

function BarRow({ label, value, display, max, colorIndex }) {
  const safeMax = max > 0 ? max : 1;
  const pct = Math.min(Math.max(((value || 0) / safeMax) * 100, 0), 100);
  const barColor = getBarColor(colorIndex);
  const shown = display ?? value;
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm text-secondary-600 dark:text-secondary-300">
        <span>{label}</span>
        <span className="font-semibold text-secondary-900 dark:text-secondary-50">{shown}</span>
      </div>
      <div className="h-2 w-full bg-secondary-100 dark:bg-secondary-700 rounded overflow-hidden">
        <div
          className={`h-2 ${barColor} rounded`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function DepartmentChart({ title, description, data, maxValue, type = 'count' }) {
  const formatMillions = (value) => {
    const num = Number(value) || 0;
    const opts = num >= 10
      ? { maximumFractionDigits: 0 }
      : { minimumFractionDigits: 2, maximumFractionDigits: 2 };
    return `${num.toLocaleString(undefined, opts)} M`;
  };

  return (
    <div className="bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-semibold text-secondary-900 dark:text-secondary-50">{title}</h2>
          <p className="text-sm text-secondary-500">{description}</p>
        </div>
      </div>
      <div className="space-y-3">
        {data.map((item, idx) => (
          <BarRow
            key={item.name}
            label={item.name}
            value={type === 'count' ? item.late : item.value}
            display={type === 'count' ? item.late : formatMillions(item.value)}
            max={maxValue}
            colorIndex={idx}
          />
        ))}
        {data.length === 0 && (
          <div className="text-secondary-500 text-sm">No data</div>
        )}
      </div>
    </div>
  );
}
