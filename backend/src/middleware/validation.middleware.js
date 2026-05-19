import { ApiError } from '../utils/ApiError.js';

export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    const issues = error.errors || error.issues || [];
    const errorMessages = Array.isArray(issues)
      ? issues.map((err) => ({
          field: err.path ? err.path.join('.') : '',
          message: err.message,
        }))
      : [];
    next(new ApiError(400, error.message || 'Validation Error', errorMessages));
  }
};
