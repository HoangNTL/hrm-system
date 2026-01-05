export const getStatusColor = (status) => {
  switch (status) {
    case 'pending':
      return 'bg-amber-50 border-amber-200 text-amber-700';
    case 'approved':
      return 'bg-green-50 border-green-200 text-green-700';
    case 'rejected':
      return 'bg-red-50 border-red-200 text-red-700';
    default:
      return 'bg-gray-50 border-gray-200 text-gray-700';
  }
};

export const getStatusLabel = (status) => {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Rejected';
    default:
      return status;
  }
};

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
  return new Date(date).toLocaleString('en-US');
};
