/**
 * Convert API error to user-friendly message based on status code
 * @param {Object} error - Error object from API (formatted by axios interceptor)
 * @returns {string} User-friendly error message
 */
export const handleAPIError = (error) => {
  if (!error) return 'An unexpected error occurred.';

  const status = error.status || error.response?.status;

  // Network errors (no response from server)
  if (!status) {
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return 'Request timeout. Please try again.';
    }
    if (error.message?.toLowerCase().includes('network')) {
      return 'Network error. Please check your connection.';
    }
  }

  // HTTP status code based errors
  switch (status) {
    case 400:
      return error.message || 'Bad request. Please check your input.';
    case 401:
      return 'Session expired. Please login again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return error.message || 'Resource not found.';
    case 409:
      return error.message || 'Conflict. Resource already exists.';
    case 422:
      return error.message || 'Validation error. Please check your input.';
    case 429:
      return 'Too many requests. Please wait a moment.';
    case 500:
      return 'Server error. Please try again later.';
    case 502:
      return 'Server is temporarily unavailable. Please try again.';
    case 503:
      return 'Service unavailable. Please try again later.';
    case 504:
      return 'Server timeout. Please try again.';
    default:
      return error.message || 'An unexpected error occurred.';
  }
};

/**
 * Handle mutation errors in forms/modals
 * Sets field errors and global error from API response
 *
 * @param {Object} error - Error object from API
 * @param {Function} setFieldErrors - State setter for field-level errors
 * @param {Function} setGlobalError - State setter for global error message
 * @param {string} fallbackMessage - Fallback message if error.message is empty
 */
export const handleMutationError = (error, { setFieldErrors, setGlobalError, fallbackMessage = 'An error occurred' } = {}) => {
  // Set field-level validation errors if present
  if (error?.errors && Object.keys(error.errors).length > 0 && setFieldErrors) {
    setFieldErrors(error.errors);
  }

  // Set global error message
  if (setGlobalError) {
    const message = error?.message || fallbackMessage;
    setGlobalError(message);
  }

  return error;
};
