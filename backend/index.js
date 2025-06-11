require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { prismaClient } = require('./src/utils/db');

const userRoute = require('./src/routes/userRoute');
const taskRoute = require('./src/routes/taskRoute');
const milestoneRoute = require('./src/routes/milestoneRoute');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/users', userRoute);
app.use('/api/tasks', taskRoute);
app.use('/api/milestones', milestoneRoute);

app.get('/', (req, res) => {
  res.send('Welcome to the backend server!');
});

const errorMiddleware = require('./src/middleware/errorMiddleware');
const { NotFoundError } = require('./src/utils/errors');

// Not found handler - must come before error handler
app.use((req, res, next) => {
  next(new NotFoundError(`Route not found: ${req.method} ${req.originalUrl}`));
});

// Global error handler
app.use(errorMiddleware);

// Connect to the database and start the server
async function startServer() {
  try {
    // Verify database connection
    await prismaClient.$connect();
    console.log('Connected to the database');
    
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  await prismaClient.$disconnect();
  console.log('Database disconnected');
  process.exit(0);
});

startServer();