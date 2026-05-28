import React from 'react';
import DepartmentChart from './DepartmentChart';

const formatMillions = (value) => {
  const num = Number(value) || 0;
  const opts = num >= 10
    ? { maximumFractionDigits: 0 }
    : { minimumFractionDigits: 2, maximumFractionDigits: 2 };
  return `${num.toLocaleString(undefined, opts)} M`;
};

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

export default function PayrollByDeptChart({ data, maxValue, selectedMonth, onMonthChange }) {
  return (
    <div className="bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-semibold text-secondary-900 dark:text-secondary-50">
            Payroll by department
          </h2>
          <p className="text-sm text-secondary-500">Gross payroll by month</p>
        </div>
        <div className="flex items-center gap-3 text-sm text-secondary-500">
          <label className="flex items-center gap-2">
            <span>Month</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={onMonthChange}
              className="border border-secondary-200 dark:border-secondary-600 rounded px-2 py-1 text-sm bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </label>
          <span>Unit: million VND</span>
        </div>
      </div>
      <div className="space-y-3 max-w-2xl mx-auto w-full">
        {data.map((d, idx) => (
          <BarRow
            key={d.name}
            label={d.name}
            value={d.value}
            display={formatMillions(d.value)}
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
