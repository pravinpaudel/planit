// tests/e2e/setup.js
const { execSync } = require('child_process');
const { prismaClient } = require('../../src/utils/db');

// Global setup - runs once before all tests
beforeAll(async () => {
  // Set up test database if needed
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('E2E tests should only be run with NODE_ENV=test');
  }

  try {
    // You could reset your test database here
    // For example:
    // await prismaClient.$executeRaw`TRUNCATE "Task" RESTART IDENTITY CASCADE`;
    // await prismaClient.$executeRaw`TRUNCATE "User" RESTART IDENTITY CASCADE`;
    
    console.log('Test database set up successfully');
  } catch (error) {
    console.error('Error setting up test database:', error);
    throw error;
  }
});

// Global teardown - runs once after all tests
afterAll(async () => {
  // Clean up test database if needed
  await prismaClient.$disconnect();
});
