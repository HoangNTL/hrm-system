export function formatDate(value, locale = 'en-US', options = {}) {
  if (!value) {
    return '';
  }

  return new Intl.DateTimeFormat(locale, options).format(new Date(value));
}
