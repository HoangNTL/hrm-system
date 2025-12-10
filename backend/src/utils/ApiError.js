export default class ApiError extends Error {
  constructor(status, message, errors = null) {
    super(message);
    this.status = status; // HTTP status code
    this.errors = errors; // additional error details
    this.isOperational = true; // to distinguish operational errors from programming errors
  }
}
