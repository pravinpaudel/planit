const rateLimit = require('express-rate-limit');

/**
 * Creates a rate limiter middleware with custom configuration
 * @param {Object} options - Rate limiting options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Maximum number of requests in the time window
 * @param {string} options.message - Message to send when rate limit is exceeded
 * @returns {Function} Rate limiter middleware
 */
const createRateLimiter = (options = {}) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes by default
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: 'Too many requests, please try again later.',
  };

  // Merge default options with provided options
  const limiterOptions = { ...defaultOptions, ...options };
  
  return rateLimit(limiterOptions);
};

// Pre-configured limiters for different scenarios
const publicEndpointLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 30 requests per 15 minutes
  message: 'Too many requests to public endpoints, please try again later.'
});

const sharingEndpointLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 share creations per hour
  message: 'You have created too many share links recently. Please try again later.'
});

// You can add more specialized limiters here

module.exports = {
  createRateLimiter,
  publicEndpointLimiter,
  sharingEndpointLimiter
};
