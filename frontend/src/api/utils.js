// Export utility functions
export const handleAPIError = (error) => {
  if (error.status === 401) {
    return 'Unauthorized. Please login again.';
  }
  if (error.status === 403) {
    return 'You do not have permission to perform this action.';
  }
  if (error.status === 404) {
    return 'Resource not found.';
  }
  if (error.status === 422) {
    return 'Validation error. Please check your input.';
  }
  if (error.status === 500) {
    return 'Server error. Please try again later.';
  }
  return error.message || 'An unexpected error occurred.';
};