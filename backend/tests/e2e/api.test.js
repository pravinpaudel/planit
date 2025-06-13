// tests/e2e/api.test.js
const request = require('supertest');
const { prismaClient } = require('../../src/utils/db');
const app = require('../../src/app'); // You'll need to export your Express app from a separate file

// This test requires:
// 1. A test database that can be reset between tests
// 2. The app to be configured to use this test database
// 3. Authentication to be mocked or real tokens to be generated

describe('End-to-End API Tests', () => {
  let authToken;
  let userId;
  let taskId;
  
  // Helper function to log response information
  const logResponseDebug = (response, operation) => {
    if (process.env.DEBUG_TESTS) {
      console.log(`\n[${operation}] Response status: ${response.status}`);
      console.log(`[${operation}] Response body:`, JSON.stringify(response.body, null, 2));
    }
  };

  // Before all tests, set up a test user and get auth token
  beforeAll(async () => {
    try {
      // First clear test data if needed
      await prismaClient.milestone.deleteMany({});
      await prismaClient.task.deleteMany({});
      await prismaClient.refreshToken.deleteMany({});
      await prismaClient.user.deleteMany({});

      // Create a test user using the registration endpoint
      const userCredentials = {
        email: 'e2e-test@example.com',
        firstName: 'E2E',
        lastName: 'Test',
        password: 'TestPassword123!'
      };

      const registerResponse = await request(app)
        .post('/api/users/register')
        .send(userCredentials);

      logResponseDebug(registerResponse, 'USER_REGISTER');
      
      if (registerResponse.status !== 201 && registerResponse.status !== 200) {
        throw new Error(`Failed to register test user: ${JSON.stringify(registerResponse.body)}`);
      }

      // We'll need to decode the JWT token to get the userId
      // For simplicity, we'll get the userId when we create our first task
      
      // Get auth token by calling the login endpoint
      const loginResponse = await request(app)
        .post('/api/users/login')
        .send({
          email: userCredentials.email,
          password: userCredentials.password
        });

      logResponseDebug(loginResponse, 'USER_LOGIN');
      
      if (loginResponse.status !== 200) {
        throw new Error(`Failed to login as test user: ${JSON.stringify(loginResponse.body)}`);
      }

      // Store the token for subsequent requests
      authToken = loginResponse.body.accessToken;
      
      if (!authToken) {
        throw new Error(`No auth token received in login response: ${JSON.stringify(loginResponse.body)}`);
      }
      
      console.log('Successfully authenticated test user');
    } catch (error) {
      console.error('E2E test setup failed:', error);
      // Re-throw the error to fail the tests immediately rather than having confusing failures later
      throw error;
    }
  });

  // After all tests, clean up the database
  afterAll(async () => {
    await prismaClient.milestone.deleteMany({});
    await prismaClient.task.deleteMany({});
    await prismaClient.refreshToken.deleteMany({});
    await prismaClient.user.deleteMany({});
    await prismaClient.$disconnect();
  });

  // Test the full task creation flow
  it('should create a task for the authenticated user', async () => {
    const taskData = {
      title: 'E2E Test Task',
      description: 'Created during E2E testing'
    };

    const response = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${authToken}`)
      .send(taskData);
      
    logResponseDebug(response, 'CREATE_TASK');

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toBe(taskData.title);
    expect(response.body.description).toBe(taskData.description);
    
    // Store the task ID and user ID for future tests
    taskId = response.body.id;
    userId = response.body.userId;
    
    console.log(`Created test task with ID: ${taskId} for user ID: ${userId}`);
  });

  // Test getting tasks
  it('should fetch tasks for the authenticated user', async () => {
    const response = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${authToken}`);
      
    logResponseDebug(response, 'GET_TASKS');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0].title).toBe('E2E Test Task');
  });

  // Test updating a task
  it('should update a task', async () => {
    const updateData = {
      title: 'Updated E2E Test Task',
      description: 'Updated during E2E testing'
    };

    const response = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updateData);
      
    logResponseDebug(response, 'UPDATE_TASK');

    expect(response.status).toBe(200);
    expect(response.body.title).toBe(updateData.title);
    expect(response.body.description).toBe(updateData.description);
  });

  // Test creating a milestone for the task
  it('should create a milestone for a task', async () => {
    const milestoneData = {
      title: 'E2E Test Milestone',
      description: 'Created during E2E testing',
      deadline: new Date('2025-12-31').toISOString(),
      taskId
    };

    const response = await request(app)
      .post('/api/milestones')
      .set('Authorization', `Bearer ${authToken}`)
      .send(milestoneData);
      
    logResponseDebug(response, 'CREATE_MILESTONE');

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toBe(milestoneData.title);
    expect(response.body.taskId).toBe(taskId);
  });

  // Test fetching milestones for a task
  it('should fetch milestones for a task', async () => {
    const response = await request(app)
      .get(`/api/milestones/${taskId}`)
      .set('Authorization', `Bearer ${authToken}`);
      
    logResponseDebug(response, 'GET_MILESTONES');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0].title).toBe('E2E Test Milestone');
  });

  // Test deleting a task
  it('should delete a task', async () => {
    const response = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${authToken}`);
      
    logResponseDebug(response, 'DELETE_TASK');

    expect(response.status).toBe(204);

    // Verify task no longer exists
    const verifyResponse = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${authToken}`);
      
    logResponseDebug(verifyResponse, 'VERIFY_TASK_DELETION');
    
    const deletedTask = verifyResponse.body.find(task => task.id === taskId);
    expect(deletedTask).toBeUndefined();
  });
});
