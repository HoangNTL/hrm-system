/**
 * Error Messages Constants
 * Define user-friendly error messages
 * Do not expose sensitive information to frontend
 */

export const ErrorMessages = {
  // General errors
  INTERNAL_SERVER_ERROR: 'An error occurred. Please try again later',
  BAD_REQUEST: 'Invalid request',
  VALIDATION_ERROR: 'Invalid data',
  NOT_FOUND: 'Data not found',
  FORBIDDEN: 'You do not have permission to perform this action',
  UNAUTHORIZED: 'Please login to continue',

  // Auth errors
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid email or password',
    TOKEN_EXPIRED: 'Session expired. Please login again',
    TOKEN_INVALID: 'Invalid token',
    TOKEN_REQUIRED: 'Please login to continue',
    ACCOUNT_LOCKED: 'Account is locked. Please contact administrator',
    ACCOUNT_DISABLED: 'Account has been disabled',
    PASSWORD_WRONG: 'Current password is incorrect',
    PASSWORD_CHANGE_FAILED: 'Failed to change password. Please try again',
    LOGOUT_FAILED: 'Logout failed. Please try again',
  },

  // User errors
  USER: {
    NOT_FOUND: 'User not found',
    EMAIL_EXISTS: 'Email is already in use',
    CREATE_FAILED: 'Failed to create user',
    UPDATE_FAILED: 'Failed to update user',
    DELETE_FAILED: 'Failed to delete user',
    INVALID_ROLE: 'Invalid role',
  },

  // Employee errors
  EMPLOYEE: {
    NOT_FOUND: 'Employee not found',
    CREATE_FAILED: 'Failed to create employee',
    UPDATE_FAILED: 'Failed to update employee',
    DELETE_FAILED: 'Failed to delete employee',
    EMAIL_EXISTS: 'Employee email already exists',
    PHONE_EXISTS: 'Phone number is already in use',
    FETCH_FAILED: 'Failed to fetch employee data',
  },

  // Department errors
  DEPARTMENT: {
    NOT_FOUND: 'Department not found',
    CREATE_FAILED: 'Failed to create department',
    UPDATE_FAILED: 'Failed to update department',
    DELETE_FAILED: 'Failed to delete department',
    NAME_EXISTS: 'Department name already exists',
    HAS_EMPLOYEES: 'Cannot delete department with existing employees',
  },

  // Position errors
  POSITION: {
    NOT_FOUND: 'Position not found',
    CREATE_FAILED: 'Failed to create position',
    UPDATE_FAILED: 'Failed to update position',
    DELETE_FAILED: 'Failed to delete position',
    NAME_EXISTS: 'Position name already exists',
    HAS_EMPLOYEES: 'Cannot delete position with existing employees',
  },

  // Shift errors
  SHIFT: {
    NOT_FOUND: 'Shift not found',
    CREATE_FAILED: 'Failed to create shift',
    UPDATE_FAILED: 'Failed to update shift',
    DELETE_FAILED: 'Failed to delete shift',
    NAME_EXISTS: 'Shift name already exists',
    INVALID_TIME: 'Invalid shift time',
  },

  // Attendance errors
  ATTENDANCE: {
    NOT_FOUND: 'Attendance record not found',
    CHECK_IN_FAILED: 'Check-in failed. Please try again',
    CHECK_OUT_FAILED: 'Check-out failed. Please try again',
    ALREADY_CHECKED_IN: 'You have already checked in today',
    NOT_CHECKED_IN: 'You have not checked in today',
    ALREADY_CHECKED_OUT: 'You have already checked out today',
    UPDATE_FAILED: 'Failed to update attendance',
    DELETE_FAILED: 'Failed to delete attendance record',
    FETCH_FAILED: 'Failed to fetch attendance data',
    INVALID_SHIFT: 'Invalid shift',
    TOO_EARLY: 'Too early to check in',
    TOO_LATE: 'Too late to check in',
  },

  // Attendance Request errors
  ATTENDANCE_REQUEST: {
    NOT_FOUND: 'Request not found',
    CREATE_FAILED: 'Failed to create request',
    APPROVE_FAILED: 'Failed to approve request',
    REJECT_FAILED: 'Failed to reject request',
    ALREADY_PROCESSED: 'Request has already been processed',
    INVALID_STATUS: 'Invalid request status',
  },

  // Contract errors
  CONTRACT: {
    NOT_FOUND: 'Contract not found',
    CREATE_FAILED: 'Failed to create contract',
    UPDATE_FAILED: 'Failed to update contract',
    DELETE_FAILED: 'Failed to delete contract',
    ALREADY_EXISTS: 'Employee already has an active contract',
    INVALID_DATE: 'Invalid contract date',
  },

  // Payroll errors
  PAYROLL: {
    FETCH_FAILED: 'Failed to fetch payroll data',
    CALCULATE_FAILED: 'Failed to calculate payroll',
    EXPORT_FAILED: 'Failed to export payroll',
    PAYSLIP_FAILED: 'Failed to fetch payslip',
    INVALID_PERIOD: 'Invalid payroll period',
  },

  // Database errors
  DATABASE: {
    CONNECTION_FAILED: 'Database connection failed',
    QUERY_FAILED: 'Database query failed',
    TRANSACTION_FAILED: 'Transaction failed',
  },
};

/**
 * Helper function to get message by error code
 * @param {string} category - Error category (AUTH, USER, etc.)
 * @param {string} code - Error code
 * @returns {string} - Error message
 */
export const getErrorMessage = (category, code) => {
  if (ErrorMessages[category] && ErrorMessages[category][code]) {
    return ErrorMessages[category][code];
  }
  return ErrorMessages.INTERNAL_SERVER_ERROR;
};

/**
 * Helper function to create safe error message
 * Only return error.message if it's an ApiError (developer-defined error)
 * Other errors return default message
 * @param {Error} error - Error object
 * @param {string} defaultMessage - Default message
 * @returns {string} - Safe error message
 */
export const getSafeErrorMessage = (error, defaultMessage = ErrorMessages.INTERNAL_SERVER_ERROR) => {
  // If ApiError (has isOperational = true), return its message
  if (error.isOperational) {
    return error.message;
  }
  // Other errors (database, runtime, etc.) return default message
  return defaultMessage;
};

export default ErrorMessages;
