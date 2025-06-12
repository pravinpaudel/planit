// tests/setup.js
// This file contains setup code that will be executed before running tests

const { prismaClient } = require('../src/utils/db');

// Global beforeAll
beforeAll(async () => {
  // Any setup that should happen before all tests
  // For example, you might want to set up a test database
});

// Global afterAll
afterAll(async () => {
  // Any cleanup that should happen after all tests
  await prismaClient.$disconnect();
});

// Mock environment variables if needed
process.env.JWT_SECRET = 'test-secret';
process.env.NODE_ENV = 'test';
