import response from '../utils/response.js';
import logger from '../utils/logger.js';

/**
 * Middleware: Error Handler
 * Catches errors thrown in the application and sends appropriate HTTP responses.
 */
export const errorHandler = (err, req, res, next) => {
  // Log error
  logger.error(err);

  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  const errors = err.errors || null;

  return response.fail(res, status, message, errors);
};
