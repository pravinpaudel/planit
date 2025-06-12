// tests/integration/taskRoutes.test.js
const request = require('supertest');
const express = require('express');
const { TaskService } = require('../../src/service/taskService');
const taskRoutes = require('../../src/routes/taskRoute');
const { authMiddleware } = require('../../src/middleware/authMiddleware');

// Mock the services and middleware
jest.mock('../../src/service/taskService');
jest.mock('../../src/middleware/authMiddleware', () => ({
  authMiddleware: jest.fn((req, res, next) => {
    // Mock authenticated user
    req.user = { id: 1, email: 'test@example.com' };
    next();
  }),
}));

// Create an Express app for testing
const app = express();
app.use(express.json());
app.use('/api/tasks', taskRoutes);

describe('Task Routes Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/tasks', () => {
    it('should return tasks for the authenticated user', async () => {
      const mockTasks = [
        {
          id: 1,
          title: 'Test Task',
          description: 'Test Description',
          userId: 1,
          milestones: [],
        },
      ];

      // Mock the service method
      TaskService.getTasksByUserId.mockResolvedValue(mockTasks);

      const response = await request(app).get('/api/tasks');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.objectContaining({
        status: 'success',
        data: mockTasks,
      }));
      expect(TaskService.getTasksByUserId).toHaveBeenCalledWith(1);
    });

    it('should handle errors', async () => {
      // Mock the service method to throw an error
      TaskService.getTasksByUserId.mockRejectedValue(new Error('Failed to get tasks'));

      const response = await request(app).get('/api/tasks');

      expect(response.status).toBe(500);
      expect(response.body).toEqual(expect.objectContaining({
        status: 'error',
        message: 'Failed to get tasks',
      }));
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const mockTask = {
        id: 1,
        title: 'New Task',
        description: 'New Description',
        userId: 1,
      };

      const taskData = {
        title: 'New Task',
        description: 'New Description',
      };

      // Mock the service method
      TaskService.createTask.mockResolvedValue(mockTask);

      const response = await request(app)
        .post('/api/tasks')
        .send(taskData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(expect.objectContaining({
        status: 'success',
        data: mockTask,
      }));
      expect(TaskService.createTask).toHaveBeenCalledWith(taskData, 1);
    });

    it('should handle validation errors', async () => {
      const taskData = {
        // Missing title
        description: 'New Description',
      };

      // Mock the service method to throw an error
      TaskService.createTask.mockRejectedValue(new Error('Title and userId are required'));

      const response = await request(app)
        .post('/api/tasks')
        .send(taskData);

      expect(response.status).toBe(500);
      expect(response.body).toEqual(expect.objectContaining({
        status: 'error',
        message: 'Title and userId are required',
      }));
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should update a task', async () => {
      const mockTask = {
        id: 1,
        title: 'Updated Task',
        description: 'Updated Description',
        userId: 1,
      };

      const taskData = {
        title: 'Updated Task',
        description: 'Updated Description',
      };

      // Mock the service method
      TaskService.updateTask.mockResolvedValue(mockTask);

      const response = await request(app)
        .put('/api/tasks/1')
        .send(taskData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.objectContaining({
        status: 'success',
        data: mockTask,
      }));
      expect(TaskService.updateTask).toHaveBeenCalledWith('1', taskData);
    });

    it('should handle errors when task is not found', async () => {
      const taskData = {
        title: 'Updated Task',
      };

      // Mock the service method to throw an error
      TaskService.updateTask.mockRejectedValue(new Error('Task not found'));

      const response = await request(app)
        .put('/api/tasks/999')
        .send(taskData);

      expect(response.status).toBe(500);
      expect(response.body).toEqual(expect.objectContaining({
        status: 'error',
        message: 'Task not found',
      }));
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete a task', async () => {
      const mockTask = {
        id: 1,
        title: 'Test Task',
        userId: 1,
      };

      // Mock the service method
      TaskService.deleteTask.mockResolvedValue(mockTask);

      const response = await request(app).delete('/api/tasks/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.objectContaining({
        status: 'success',
        data: mockTask,
      }));
      expect(TaskService.deleteTask).toHaveBeenCalledWith('1');
    });

    it('should handle errors when task is not found', async () => {
      // Mock the service method to throw an error
      TaskService.deleteTask.mockRejectedValue(new Error('Task not found'));

      const response = await request(app).delete('/api/tasks/999');

      expect(response.status).toBe(500);
      expect(response.body).toEqual(expect.objectContaining({
        status: 'error',
        message: 'Task not found',
      }));
    });
  });
});
