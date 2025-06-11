/**
 * Global error handling middleware
 */
const { formatErrorResponse } = require('../utils/errors');

function errorHandler(err, req, res, next) {
  console.error(`[${new Date().toISOString()}] Error:`, err);
  
  // Format the error response
  const { status, body } = formatErrorResponse(err);
  
  // Add request details in non-production environments
  if (process.env.NODE_ENV !== 'production') {
    body.request = {
      method: req.method,
      path: req.path,
      query: req.query,
      body: req.body
    };
  }
  
  // Send the response
  res.status(status).json(body);
}

module.exports = errorHandler;
