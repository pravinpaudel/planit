# Testing Documentation for PlanIt Backend

## Overview

This document outlines the testing strategy and implementation for the PlanIt backend application. The testing approach is divided into three layers:

1. **Unit Tests** - Testing individual components in isolation
2. **Integration Tests** - Testing interactions between components
3. **End-to-End (E2E) Tests** - Testing the complete flow of the application

## Test Setup

The project uses Jest as the testing framework along with the following tools:

- **Jest**: Testing framework
- **Supertest**: HTTP assertion library for API testing
- **Jest Mock Extended**: Enhanced mocking capabilities

## Test Structure

```
tests/
├── setup.js                 # Global setup for all tests
├── e2e/                     # End-to-end tests
│   ├── setup.js             # E2E specific setup
│   └── api.test.js          # Full API tests
├── integration/             # Integration tests
│   ├── taskRoutes.test.js   # Task API tests
│   └── milestoneRoutes.test.js  # Milestone API tests
└── unit/                    # Unit tests
    ├── controllers/         # Controller tests
    │   ├── taskController.test.js
    │   └── milestoneController.test.js
    ├── middleware/          # Middleware tests
    │   └── authMiddleware.test.js
    ├── service/             # Service tests
    │   ├── taskService.test.js
    │   ├── userService.test.js
    │   └── milestoneService.test.js
    └── utils/               # Utility function tests
        └── validation.test.js
```

## Running Tests

You can run tests using the provided test script:

```bash
# Run all tests
./test.sh

# Run specific test types
./test.sh --unit       # Only unit tests
./test.sh --integration # Only integration tests
./test.sh --e2e        # Only end-to-end tests

# Additional options
./test.sh --watch      # Run in watch mode
./test.sh --coverage   # Generate coverage reports

# Combine options
./test.sh --unit --coverage
```

Or use npm scripts directly:

```bash
npm test               # Run all tests
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Run tests with coverage
```

## Unit Testing

Unit tests focus on testing individual components in isolation. Dependencies are mocked to ensure true unit testing.

### Example: Service Tests

Service tests mock the database client (Prisma) to test service logic without actual database operations:

```javascript
// Example from taskService.test.js
describe('createTask', () => {
  it('should create a task successfully', async () => {
    const mockTask = {
      id: 1,
      title: 'Test Task',
      description: 'Test Description',
      userId: 1,
    };

    // Mock dependencies
    UserService.getUserById.mockResolvedValue({ id: 1 });
    prismaClient.task.create.mockResolvedValue(mockTask);

    // Call the service method
    const result = await TaskService.createTask(
      { title: 'Test Task', description: 'Test Description' },
      1
    );

    // Verify results
    expect(result).toEqual(mockTask);
  });
});
```

### Controller Tests

Controller tests focus on how controllers handle requests and responses:

```javascript
// Example from taskController.test.js
describe('createTask', () => {
  it('should create a task successfully', async () => {
    const mockTask = { id: 1, title: 'Test Task' };
    
    // Setup request and mocks
    req.body = { title: 'Test Task' };
    TaskService.createTask.mockResolvedValue(mockTask);

    // Call controller
    await taskController.createTask(req, res);

    // Verify response
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockTask);
  });
});
```

## Integration Testing

Integration tests verify that different components work together correctly. They test the HTTP layer and routing of the application.

```javascript
// Example from taskRoutes.test.js
describe('POST /api/tasks', () => {
  it('should create a new task', async () => {
    const mockTask = { id: 1, title: 'New Task' };
    TaskService.createTask.mockResolvedValue(mockTask);

    const response = await request(app)
      .post('/api/tasks')
      .send({ title: 'New Task' });

    expect(response.status).toBe(201);
    expect(response.body).toEqual(mockTask);
  });
});
```

## End-to-End Testing

E2E tests verify the complete flow of the application with real database interactions. They ensure that all components work together in a production-like environment.

```javascript
// Example from api.test.js
it('should create a task for the authenticated user', async () => {
  const response = await request(app)
    .post('/api/tasks')
    .set('Authorization', `Bearer ${authToken}`)
    .send({ title: 'E2E Test Task' });

  expect(response.status).toBe(201);
  expect(response.body).toHaveProperty('id');
});
```

## Test Coverage

Code coverage reports help identify areas of the codebase that might need more testing. Coverage targets:

- **Statements**: 70%
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%

To view detailed coverage reports, run:

```bash
npm run test:coverage
```

This will generate HTML reports in the `coverage/` directory.

## Best Practices

1. **Test Isolation**: Each test should be independent and not affect other tests
2. **Clear Arrange-Act-Assert**: Structure tests with clear setup, action, and verification phases
3. **Mock External Dependencies**: Use mocks for external services, databases, etc.
4. **Test Edge Cases**: Include tests for error conditions and edge cases
5. **Keep Tests Fast**: Tests should execute quickly to encourage frequent running

## Continuous Integration

Tests are automatically run in the CI pipeline on each push to ensure code quality is maintained.
