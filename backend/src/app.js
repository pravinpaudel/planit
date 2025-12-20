// src/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const userRoute = require('./routes/userRoute');
const taskRoute = require('./routes/taskRoute');
const milestoneRoute = require('./routes/milestoneRoute');
const analyticsRoute = require('./routes/analyticsRoute');
const errorHandler = require('./middleware/errorMiddleware');

const app = express();

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(express.json());

// Enable if app is behind a reverse proxy (like Nginx or Heroku)
// This ensures rate limiting works correctly with the actual client IP
app.set('trust proxy', 1);

// Request logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// Routes
app.use('/api/users', userRoute);
app.use('/api/tasks', taskRoute);
app.use('/api/milestones', milestoneRoute);
app.use('/api/analytics', analyticsRoute);

app.get('/', (req, res) => {
  res.send('<h2>Welcome to the backend server!</h2>');
});

// Error handler middleware - must be last
app.use(errorHandler);

module.exports = app;
