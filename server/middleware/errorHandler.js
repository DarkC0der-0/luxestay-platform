// server/middleware/errorHandler.js

const errorHandler = (err, req, res, next) => {
  console.error(err);

  // Default internal server error
  let statusCode = err.statusCode || 500;
  let code = err.code || 'INTERNAL_SERVER_ERROR';
  let message = err.message || 'An unexpected error occurred.';

  // Handle PostgreSQL exclusion constraint (double booking)
  if (err.code === '23P01') {
    statusCode = 409;
    code = 'DOUBLE_BOOKING_CONFLICT';
    message = 'The selected dates are no longer available.';
  }

  // Handle Zod Validation Errors
  if (err.name === 'ZodError' || (err.errors && Array.isArray(err.errors))) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    try {
      const issues = err.issues || err.errors;
      message = issues.map(e => `${e.path ? e.path.join('.') : 'error'}: ${e.message}`).join(', ');
    } catch (mapErr) {
      message = 'Validation failed';
    }
  }

  // Handle JWT Auth Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'UNAUTHORIZED';
    message = 'Invalid authentication token.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'UNAUTHORIZED';
    message = 'Authentication token expired.';
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      status: statusCode
    }
  });
};

module.exports = errorHandler;
