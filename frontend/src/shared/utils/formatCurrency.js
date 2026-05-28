export function formatCurrency(value, currency = 'VND', locale = 'vi-VN') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(Number(value || 0));
}
