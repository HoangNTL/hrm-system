export const getRequestTypeLabel = (type) => {
  switch (type) {
    case 'forgot_checkin':
      return 'Quên check-in';
    case 'forgot_checkout':
      return 'Quên check-out';
    case 'edit_time':
      return 'Sửa giờ làm';
    case 'leave':
      return 'Xin nghỉ';
    default:
      return type;
  }
};

export const formatDateTime = (date) => {
  if (!date) return '--';
  return new Date(date).toLocaleString('vi-VN');
};
