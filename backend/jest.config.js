// jest.config.js
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!**/node_modules/**',
    '!**/vendor/**',
  ],
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 70,
      functions: 70,
      lines: 70,
    },
  },
  coverageReporters: ['text', 'lcov', 'clover', 'html'],
  verbose: true,
  // Setup files if needed
  // setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
};
