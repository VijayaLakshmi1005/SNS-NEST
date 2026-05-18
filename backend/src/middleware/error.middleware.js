import { ApiError } from '../utils/ApiError.js';

export const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, err?.errors || [], err.stack);
  }

  const response = {
    success: false,
    message: error.message,
    data: null,
    error: {
      statusCode: error.statusCode,
      errors: error.errors,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }
  };

  // Log error stack for devs
  console.error(`[Error Boundary]: ${err.stack || err.message}`);

  return res.status(error.statusCode).json(response);
};
