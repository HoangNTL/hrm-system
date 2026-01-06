/**
 * Utility functions for calendar operations
 */

export const buildCalendar = (year, monthIndex) => {
  const firstDay = new Date(year, monthIndex, 1);
  const startWeekday = (firstDay.getDay() + 6) % 7; // Monday=0
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, monthIndex, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
};

export const formatTimeShort = (date) => {
  if (!date) return '--:--';
  const d = new Date(date);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(11, 16);
};

export const getDaySummary = (records) => {
  if (!records || records.length === 0) {
    return {
      label: 'Not recorded',
      color: 'bg-gray-50 text-gray-600 border-gray-200',
      headerColor: 'bg-gray-200 text-gray-800',
      lateMinutes: 0,
      totalHours: 0,
      earliest: null,
      latest: null,
    };
  }

  const anyAbsent = records.some(r => r.status === 'absent');
  const anyLate = records.some(r => r.status === 'late');
  const totalHours = records.reduce((sum, r) => sum + (parseFloat(r.work_hours) || 0), 0);
  const lateMinutes = records.reduce((sum, r) => sum + (r.late_minutes || 0), 0);
  const times = records.flatMap(r => [r.check_in, r.check_out].filter(Boolean));
  const dates = times.map(t => new Date(t));
  const earliest = dates.length ? new Date(Math.min(...dates)) : null;
  const latest = dates.length ? new Date(Math.max(...dates)) : null;

  let headerColor = 'bg-green-500 text-white';
  if (anyAbsent) headerColor = 'bg-red-500 text-white';
  else if (anyLate) headerColor = 'bg-purple-500 text-white';

  let label = 'On time';
  if (anyAbsent) label = 'Absent';
  else if (anyLate) label = 'Late';

  return {
    label,
    color: 'bg-white text-gray-800 border-gray-200',
    headerColor,
    lateMinutes,
    totalHours,
    earliest,
    latest,
  };
};
