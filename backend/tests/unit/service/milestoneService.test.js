// tests/unit/service/milestoneService.test.js
const { MilestoneService } = require('../../../src/service/milestoneService');
const { prismaClient } = require('../../../src/utils/db');

// Mock the dependencies
jest.mock('../../../src/utils/db', () => ({
  prismaClient: {
    milestone: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('MilestoneService', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createMilestone', () => {
    it('should create a milestone successfully', async () => {
      // Arrange
      const mockMilestone = {
        id: 1,
        title: 'Test Milestone',
        description: 'Test Description',
        deadline: new Date('2025-12-31'),
        taskId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const milestoneData = {
        title: 'Test Milestone',
        description: 'Test Description',
        deadline: '2025-12-31',
        taskId: 1,
      };

      prismaClient.milestone.create.mockResolvedValue(mockMilestone);

      // Act
      const result = await MilestoneService.createMilestone(milestoneData);

      // Assert
      expect(prismaClient.milestone.create).toHaveBeenCalledWith({
        data: {
          title: 'Test Milestone',
          description: 'Test Description',
          deadline: expect.any(Date),
          taskId: 1,
        },
      });
      expect(result).toEqual(mockMilestone);
    });

    it('should throw an error if required fields are missing', async () => {
      // Test missing title
      await expect(
        MilestoneService.createMilestone({
          description: 'Test Description',
          deadline: '2025-12-31',
          taskId: 1,
        })
      ).rejects.toThrow('Missing required fields: title, description, deadline, taskId');

      // Test missing description
      await expect(
        MilestoneService.createMilestone({
          title: 'Test Milestone',
          deadline: '2025-12-31',
          taskId: 1,
        })
      ).rejects.toThrow('Missing required fields: title, description, deadline, taskId');

      // Test missing deadline
      await expect(
        MilestoneService.createMilestone({
          title: 'Test Milestone',
          description: 'Test Description',
          taskId: 1,
        })
      ).rejects.toThrow('Missing required fields: title, description, deadline, taskId');

      // Test missing taskId
      await expect(
        MilestoneService.createMilestone({
          title: 'Test Milestone',
          description: 'Test Description',
          deadline: '2025-12-31',
        })
      ).rejects.toThrow('Missing required fields: title, description, deadline, taskId');
    });

    it('should throw an error if description is not a string', async () => {
      await expect(
        MilestoneService.createMilestone({
          title: 'Test Milestone',
          description: 123, // Not a string
          deadline: '2025-12-31',
          taskId: 1,
        })
      ).rejects.toThrow('Description must be a string');
    });

    it('should handle database errors', async () => {
      // Arrange
      const errorMessage = 'Database connection failed';
      prismaClient.milestone.create.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(
        MilestoneService.createMilestone({
          title: 'Test Milestone',
          description: 'Test Description',
          deadline: '2025-12-31',
          taskId: 1,
        })
      ).rejects.toThrow(`Error creating milestone: ${errorMessage}`);
    });
  });

  describe('getMilestonesByTaskId', () => {
    it('should get milestones successfully', async () => {
      // Arrange
      const mockMilestones = [
        {
          id: 1,
          title: 'Test Milestone 1',
          description: 'Test Description 1',
          deadline: new Date('2025-12-31'),
          taskId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          title: 'Test Milestone 2',
          description: 'Test Description 2',
          deadline: new Date('2025-12-31'),
          taskId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      prismaClient.milestone.findMany.mockResolvedValue(mockMilestones);

      // Act
      const result = await MilestoneService.getMilestonesByTaskId(1);

      // Assert
      expect(prismaClient.milestone.findMany).toHaveBeenCalledWith({
        where: { taskId: 1 },
        orderBy: { createdAt: 'asc' },
      });
      expect(result).toEqual(mockMilestones);
    });

    it('should throw an error if taskId is not provided', async () => {
      await expect(MilestoneService.getMilestonesByTaskId(null)).rejects.toThrow(
        'Task ID is required'
      );
    });

    it('should handle database errors', async () => {
      // Arrange
      const errorMessage = 'Database connection failed';
      prismaClient.milestone.findMany.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(MilestoneService.getMilestonesByTaskId(1)).rejects.toThrow(
        `Error fetching milestones: ${errorMessage}`
      );
    });
  });

  // Add tests for other milestone service methods (update, delete, etc.)
});
