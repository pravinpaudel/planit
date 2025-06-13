# Advanced Testing Techniques

This document provides examples of advanced testing techniques that can be used in the PlanIt project.

## Table of Contents

- [Advanced Mocking](#advanced-mocking)
- [Custom Matchers](#custom-matchers)
- [Snapshot Testing](#snapshot-testing)
- [Test Fixtures](#test-fixtures)
- [Parameterized Tests](#parameterized-tests)
- [Code Coverage Analysis](#code-coverage-analysis)

## Advanced Mocking

### Mock Implementation

```javascript
// Mock a function with complex behavior
jest.mock('../src/utils/logger', () => ({
  log: jest.fn().mockImplementation((level, message) => {
    if (level === 'error') {
      console.error(message);
    }
    return true;
  })
}));

// Reset implementation between tests
beforeEach(() => {
  require('../src/utils/logger').log.mockClear();
});
```

### Mock Return Values Based on Arguments

```javascript
const mockFn = jest.fn()
  .mockReturnValueOnce('first call')
  .mockReturnValueOnce('second call')
  .mockReturnValue('default');

console.log(mockFn(), mockFn(), mockFn(), mockFn());
// 'first call', 'second call', 'default', 'default'

// Conditional mocks
const userService = require('../src/service/userService');
userService.getUserById = jest.fn().mockImplementation((id) => {
  if (id === 1) {
    return Promise.resolve({ id: 1, name: 'Admin User' });
  } else if (id > 1 && id < 100) {
    return Promise.resolve({ id, name: 'Regular User' });
  } else {
    return Promise.resolve(null);
  }
});
```

### Spy on Method Calls

```javascript
// Spying on a method
const spy = jest.spyOn(TaskService, 'createTask');
await TaskController.createTask(req, res);
expect(spy).toHaveBeenCalledWith(req.body, req.user.id);
spy.mockRestore(); // Don't forget to restore the original method
```

## Custom Matchers

Custom matchers can make tests more readable and expressive.

```javascript
// Create custom matchers in tests/setup.js
expect.extend({
  toBeValidTask(received) {
    const pass = (
      received &&
      typeof received.id === 'number' &&
      typeof received.title === 'string' &&
      typeof received.userId === 'number'
    );
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid task`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid task`,
        pass: false,
      };
    }
  },
});

// Then use in tests
it('should return a valid task', async () => {
  const task = await TaskService.getTaskById(1);
  expect(task).toBeValidTask();
});
```

## Snapshot Testing

Snapshot testing is useful for testing UI components or API responses.

```javascript
it('should match the expected response structure', async () => {
  const response = await request(app).get('/api/tasks/1');
  
  // This will create a snapshot file the first time
  // and compare against it in subsequent runs
  expect(response.body).toMatchSnapshot();
});

// Updating snapshots when APIs change deliberately
// Run: jest --updateSnapshot
```

## Test Fixtures

Using fixtures keeps your tests clean and maintainable.

```javascript
// tests/fixtures/tasks.js
module.exports = {
  validTask: {
    id: 1,
    title: 'Test Task',
    description: 'Test Description',
    userId: 1,
  },
  invalidTask: {
    id: 'not-a-number',
    title: 123, // Should be string
  },
  taskList: [
    { id: 1, title: 'Task 1', userId: 1 },
    { id: 2, title: 'Task 2', userId: 1 },
  ]
};

// In your test file
const fixtures = require('../../fixtures/tasks');

it('should validate a task', () => {
  const { validTask, invalidTask } = fixtures;
  expect(validateTask(validTask)).toBeTruthy();
  expect(validateTask(invalidTask)).toBeFalsy();
});
```

## Parameterized Tests

Parameterized tests let you run the same test with different inputs.

```javascript
describe('validateEmail', () => {
  const testCases = [
    { email: 'user@example.com', expected: true },
    { email: 'invalid-email', expected: false },
    { email: 'user@example', expected: false },
    { email: '', expected: false },
    { email: null, expected: false },
  ];

  test.each(testCases)(
    'validates that %p returns $expected',
    ({ email, expected }) => {
      expect(isValidEmail(email)).toBe(expected);
    }
  );
});
```

## Code Coverage Analysis

Advanced coverage analysis can help you identify code paths that aren't being tested.

```bash
# Generate coverage with more details
npx jest --coverage --coverageReporters="text" --coverageReporters="html" --collectCoverageFrom="src/**/*.js"

# Enforce coverage thresholds
npx jest --coverage --coverageThreshold='{"global":{"statements":80,"branches":80,"functions":80,"lines":80}}'
```

Coverage reports can be found in the `coverage/` directory after running the coverage command.

### Branch Coverage

Pay special attention to branch coverage, which tells you if all code paths are being tested:

```javascript
function processValue(value) {
  if (value < 0) {
    return 'negative';
  } else if (value === 0) {
    return 'zero';
  } else {
    return 'positive';
  }
}

// To achieve 100% branch coverage, test all cases
test('processes negative values', () => {
  expect(processValue(-1)).toBe('negative');
});

test('processes zero', () => {
  expect(processValue(0)).toBe('zero');
});

test('processes positive values', () => {
  expect(processValue(1)).toBe('positive');
});
```
