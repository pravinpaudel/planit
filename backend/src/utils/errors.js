/**
 * Custom error classes and error handling utilities
 */

/**
 * Base application error class
 */
class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error for invalid input data (400)
 */
class BadRequestError extends AppError {
  constructor(message, code = 'BAD_REQUEST') {
    super(message, 400, code);
  }
}

/**
 * Error for authentication failures (401)
 */
class UnauthorizedError extends AppError {
  constructor(message, code = 'UNAUTHORIZED') {
    super(message, 401, code);
  }
}

/**
 * Error for authorization failures (403)
 */
class ForbiddenError extends AppError {
  constructor(message, code = 'FORBIDDEN') {
    super(message, 403, code);
  }
}

/**
 * Error for resources not found (404)
 */
class NotFoundError extends AppError {
  constructor(message, code = 'NOT_FOUND') {
    super(message, 404, code);
  }
}

/**
 * Error for conflict situations (409)
 */
class ConflictError extends AppError {
  constructor(message, code = 'CONFLICT') {
    super(message, 409, code);
  }
}

/**
 * Format error response for API
 */
function formatErrorResponse(error) {
  // Determine if error is one of our custom errors or something else
  const isOperationalError = error instanceof AppError;
  
  return {
    status: error.statusCode || 500,
    body: {
      error: {
        message: isOperationalError ? error.message : 'Internal Server Error',
        code: error.code || 'INTERNAL_ERROR',
        ...(process.env.NODE_ENV !== 'production' && !isOperationalError && { stack: error.stack })
      }
    }
  };
}

module.exports = {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  formatErrorResponse
};
