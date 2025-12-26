export const handleAPIError = (error) => {
  if (!error) return 'An unexpected error occurred.';
  
  const status = error.status || error.response?.status;
  switch (status) {
    case 401:
      return 'Unauthorized. Please login again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'Resource not found.';
    case 422:
      return 'Validation error. Please check your input.';
    case 500:
      return 'Server error. Please try again later.';
    default:
      return error.message || 'An unexpected error occurred.';
  }
};
