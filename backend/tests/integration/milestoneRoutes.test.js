// tests/integration/milestoneRoutes.test.js
const request = require('supertest');
const express = require('express');
const { MilestoneService } = require('../../src/service/milestoneService');
const milestoneRoutes = require('../../src/routes/milestoneRoute');
const { authenticateToken } = require('../../src/middleware/authMiddleware');

// Mock the services and middleware
jest.mock('../../src/service/milestoneService');
jest.mock('../../src/middleware/authMiddleware', () => ({
  authenticateToken: jest.fn((req, res, next) => {
    // Mock authenticated user
    req.user = { id: 1, email: 'test@example.com' };
    next();
  }),
}));

// Create an Express app for testing
const app = express();
app.use(express.json());
app.use('/api/milestones', milestoneRoutes);

describe('Milestone Routes Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/milestones/:taskId', () => {
    it('should return milestones for a task', async () => {
      const mockMilestones = [
        {
          id: 1,
          title: 'Test Milestone 1',
          description: 'Test Description 1',
          deadline: new Date('2025-12-31').toISOString(),
          taskId: 1,
        },
        {
          id: 2,
          title: 'Test Milestone 2',
          description: 'Test Description 2',
          deadline: new Date('2025-12-31').toISOString(),
          taskId: 1,
        },
      ];

      // Mock the service method
      MilestoneService.getMilestonesByTaskId.mockResolvedValue(mockMilestones);

      const response = await request(app).get('/api/milestones/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockMilestones);
      expect(MilestoneService.getMilestonesByTaskId).toHaveBeenCalledWith('1');
    });

    it('should handle errors', async () => {
      // Mock the service method to throw an error
      MilestoneService.getMilestonesByTaskId.mockRejectedValue(new Error('Failed to get milestones'));

      const response = await request(app).get('/api/milestones/1');

      expect(response.status).toBe(400);
      expect(response.body).toEqual(expect.objectContaining({
        error: 'Failed to get milestones',
      }));
    });
  });

  describe('POST /api/milestones', () => {
    it('should create a new milestone', async () => {
      const mockMilestone = {
        id: 1,
        title: 'New Milestone',
        description: 'New Description',
        deadline: new Date('2025-12-31').toISOString(),
        taskId: 1,
      };

      const milestoneData = {
        title: 'New Milestone',
        description: 'New Description',
        deadline: '2025-12-31',
        taskId: 1,
      };

      // Mock the service method
      MilestoneService.createMilestone.mockResolvedValue(mockMilestone);

      const response = await request(app)
        .post('/api/milestones')
        .send(milestoneData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockMilestone);
      expect(MilestoneService.createMilestone).toHaveBeenCalledWith(milestoneData);
    });

    it('should handle validation errors', async () => {
      const milestoneData = {
        // Missing title
        description: 'New Description',
        deadline: '2025-12-31',
        taskId: 1,
      };

      // Mock the service method to throw an error
      const errorMessage = 'Missing required fields: title, description, deadline, taskId';
      MilestoneService.createMilestone.mockRejectedValue(new Error(errorMessage));

      const response = await request(app)
        .post('/api/milestones')
        .send(milestoneData);

      expect(response.status).toBe(400);
      expect(response.body).toEqual(expect.objectContaining({
        error: errorMessage,
      }));
    });
  });

  describe('PUT /api/milestones/:milestoneId', () => {
    it('should update a milestone', async () => {
      // Use ISO string format for the deadline to match JSON serialization behavior
      const mockMilestone = {
        id: 1,
        title: 'Updated Milestone',
        description: 'Updated Description',
        deadline: new Date('2025-12-31').toISOString(),
        taskId: 1,
      };

      const milestoneData = {
        title: 'Updated Milestone',
        description: 'Updated Description',
      };

      // Mock the service method
      MilestoneService.updateMilestone.mockResolvedValue(mockMilestone);

      const response = await request(app)
        .put('/api/milestones/1')
        .send(milestoneData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockMilestone);
      expect(MilestoneService.updateMilestone).toHaveBeenCalledWith('1', milestoneData);
    });

    it('should handle errors when milestone is not found', async () => {
      const milestoneData = {
        title: 'Updated Milestone',
      };

      // Mock the service method to throw an error
      MilestoneService.updateMilestone.mockRejectedValue(new Error('Milestone not found'));

      const response = await request(app)
        .put('/api/milestones/999')
        .send(milestoneData);

      expect(response.status).toBe(400);
      expect(response.body).toEqual(expect.objectContaining({
        error: 'Milestone not found',
      }));
    });
  });

  describe('DELETE /api/milestones/:milestoneId', () => {
    it('should delete a milestone', async () => {
      const mockMilestone = {
        id: 1,
        title: 'Test Milestone',
        taskId: 1,
      };

      // Mock the service method
      MilestoneService.deleteMilestone.mockResolvedValue(mockMilestone);

      const response = await request(app).delete('/api/milestones/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockMilestone);
      expect(MilestoneService.deleteMilestone).toHaveBeenCalledWith('1');
    });

    it('should handle errors when milestone is not found', async () => {
      // Mock the service method to throw an error
      MilestoneService.deleteMilestone.mockRejectedValue(new Error('Milestone not found'));

      const response = await request(app).delete('/api/milestones/999');

      expect(response.status).toBe(400);
      expect(response.body).toEqual(expect.objectContaining({
        error: 'Milestone not found',
      }));
    });
  });
});
