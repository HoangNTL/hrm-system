export const formatDateTime = (date) => {
  if (!date) return '--:--';
  const d = new Date(date);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(11, 16);
};
