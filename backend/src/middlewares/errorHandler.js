import response from '../utils/response.js';
import logger from '../utils/logger.js';
import { ErrorMessages, getSafeErrorMessage } from '../utils/errorMessages.js';

/**
 * Middleware: Error Handler
 * Catches errors thrown in the application and sends appropriate HTTP responses.
 * - Development: trả về message chi tiết để debug
 * - Production: trả về message chung, không expose thông tin nhạy cảm
 */
export const errorHandler = (err, req, res, next) => {
  // Log error (luôn log đầy đủ để debug)
  logger.error(err);

  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || 500;
  const errors = err.errors || null;
  const isDev = process.env.NODE_ENV === 'development';

  // Xác định message trả về
  let message;
  if (isDev) {
    // Development: trả về message chi tiết
    message = err.message || ErrorMessages.INTERNAL_SERVER_ERROR;
  } else {
    // Production: dùng helper để trả về message an toàn
    message = getSafeErrorMessage(err, getDefaultMessageByStatus(status));
  }

  return response.fail(res, status, message, errors);
};

/**
 * Lấy message mặc định theo HTTP status code
 */
function getDefaultMessageByStatus(status) {
  switch (status) {
    case 400:
      return ErrorMessages.BAD_REQUEST;
    case 401:
      return ErrorMessages.UNAUTHORIZED;
    case 403:
      return ErrorMessages.FORBIDDEN;
    case 404:
      return ErrorMessages.NOT_FOUND;
    default:
      return ErrorMessages.INTERNAL_SERVER_ERROR;
  }
}
