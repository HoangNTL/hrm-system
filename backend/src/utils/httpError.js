import ApiError from './ApiError.js';

export const badRequest = (msg = 'Bad request') => {
  throw new ApiError(400, msg);
};

export const unauthorized = (msg = 'Unauthorized') => {
  throw new ApiError(401, msg);
};

export const notFound = (msg = 'Not found') => {
  throw new ApiError(404, msg);
};

export const serverError = (msg = 'Server error') => {
  throw new ApiError(500, msg);
};
