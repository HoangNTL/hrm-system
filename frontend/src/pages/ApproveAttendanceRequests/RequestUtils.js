export const getRequestTypeLabel = (type) => {
  switch (type) {
    case 'forgot_checkin':
      return 'Forgot check-in';
    case 'forgot_checkout':
      return 'Forgot check-out';
    case 'edit_time':
      return 'Edit working time';
    case 'leave':
      return 'Leave request';
    default:
      return type;
  }
};

export const formatDateTime = (date) => {
  if (!date) return '--';
  return new Date(date).toLocaleString('en-GB');
};
