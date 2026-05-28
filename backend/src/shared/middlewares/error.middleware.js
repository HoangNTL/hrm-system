import { ErrorMessages, getSafeErrorMessage } from '../../utils/errorMessages.js';
import logger from '../utils/logger.js';
import response from '../utils/response.js';

export const errorHandler = (err, req, res, next) => {
  logger.error(err);

  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || 500;
  const errors = err.errors || null;
  const isDev = process.env.NODE_ENV === 'development';

  const message = isDev
    ? err.message || ErrorMessages.INTERNAL_SERVER_ERROR
    : getSafeErrorMessage(err, getDefaultMessageByStatus(status));

  return response.fail(res, status, message, errors);
};

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
