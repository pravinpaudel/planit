const app = require('./src/app');
const { prismaClient } = require('./src/utils/db');
const port = process.env.PORT || 3000;

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
    console.log('✅ Connected to the database');
    
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  await prismaClient.$disconnect();
  console.log('✅ Database disconnected');
  process.exit(0);
});

startServer();