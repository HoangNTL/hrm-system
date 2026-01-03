export const formatTime = (date) => {
  if (!date) return '--:--';
  return new Date(date).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

export const getShiftTime = (timeObj) => {
  if (!timeObj) return '--:--';
  const raw = typeof timeObj === 'string' ? timeObj : timeObj.toString();

  // ISO UTC (ends with 'Z') -> add +7 hours (VN has no DST)
  if (raw.includes('T') && /Z$/.test(raw)) {
    const d = new Date(raw);
    const pad = (n) => String(n).padStart(2, '0');
    const hoursVN = (d.getUTCHours() + 7) % 24;
    const minutes = d.getUTCMinutes();
    return `${pad(hoursVN)}:${pad(minutes)}`;
  }

  // Fallback: "HH:MM:SS" or "HH:MM" string
  if (/^\d{2}:\d{2}/.test(raw)) {
    return raw.slice(0, 5);
  }

  return '--:--';
};
