# Advanced Rate Limiting with Redis

For production environments, you might want to use Redis for distributed rate limiting:

```javascript
const { RateLimiterRedis } = require('rate-limiter-flexible');
const Redis = require('ioredis');

// Create Redis client
const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost', 
  port: process.env.REDIS_PORT || 6379,
  // Add authentication if needed
  // password: process.env.REDIS_PASSWORD
});

const rateLimiterRedis = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'middleware',
  points: 10, // Number of points
  duration: 1, // Per second
});

const rateLimiterMiddleware = (req, res, next) => {
  rateLimiterRedis.consume(req.ip)
    .then(() => {
      next();
    })
    .catch(() => {
      res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later.'
      });
    });
};

module.exports = rateLimiterMiddleware;
```

This approach allows rate limiting to work across multiple instances of your application.
