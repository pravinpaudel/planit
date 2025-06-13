// tests/unit/service/taskService.test.js
const { TaskService } = require('../../../src/service/taskService');
const { UserService } = require('../../../src/service/userService');
const { prismaClient } = require('../../../src/utils/db');

// Mock the dependencies
jest.mock('../../../src/service/userService');
jest.mock('../../../src/utils/db', () => ({
  prismaClient: {
    task: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('TaskService', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTask', () => {
    it('should create a task successfully', async () => {
      const mockTask = {
        id: 1,
        title: 'Test Task',
        description: 'Test Description',
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock user service to return a user
      UserService.getUserById.mockResolvedValue({ id: 1, name: 'Test User' });
      
      // Mock the prisma create function
      prismaClient.task.create.mockResolvedValue(mockTask);

      const result = await TaskService.createTask(
        { title: 'Test Task', description: 'Test Description' },
        1
      );

      expect(UserService.getUserById).toHaveBeenCalledWith(1);
      expect(prismaClient.task.create).toHaveBeenCalledWith({
        data: {
          title: 'Test Task',
          description: 'Test Description',
          userId: 1,
        },
      });
      expect(result).toEqual(mockTask);
    });

    it('should throw an error if title is not provided', async () => {
      await expect(async () => {
        await TaskService.createTask({ description: 'Test Description' }, 1);
      }).rejects.toThrow('Title and userId are required');
    });

    it('should throw an error if userId is not provided', async () => {
      await expect(async () => {
        await TaskService.createTask({ title: 'Test Task' }, null);
      }).rejects.toThrow('Title and userId are required');
    });

    it('should throw an error if user is not found', async () => {
      // Mock user service to return null
      UserService.getUserById.mockResolvedValue(null);

      await expect(async () => {
        await TaskService.createTask({ title: 'Test Task' }, 1);
      }).rejects.toThrow('User not found');
    });

    it('should throw an error if description is not a string', async () => {
      await expect(async () => {
        await TaskService.createTask({ title: 'Test Task', description: 123 }, 1);
      }).rejects.toThrow('Description must be a string');
    });
  });

  describe('getTasksByUserId', () => {
    it('should get tasks successfully', async () => {
      const mockTasks = [
        {
          id: 1,
          title: 'Test Task',
          description: 'Test Description',
          userId: 1,
          milestones: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      // Mock user service to return a user
      UserService.getUserById.mockResolvedValue({ id: 1, name: 'Test User' });
      
      // Mock the prisma findMany function
      prismaClient.task.findMany.mockResolvedValue(mockTasks);

      const result = await TaskService.getTasksByUserId(1);

      expect(UserService.getUserById).toHaveBeenCalledWith(1);
      expect(prismaClient.task.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
        orderBy: { createdAt: 'desc' },
        include: {
          milestones: true,
        },
      });
      expect(result).toEqual(mockTasks);
    });

    it('should throw an error if userId is not provided', async () => {
      await expect(async () => {
        await TaskService.getTasksByUserId(null);
      }).rejects.toThrow('User ID is required');
    });

    it('should throw an error if user is not found', async () => {
      // Mock user service to return null
      UserService.getUserById.mockResolvedValue(null);

      await expect(async () => {
        await TaskService.getTasksByUserId(1);
      }).rejects.toThrow('User not found');
    });
  });

  describe('updateTask', () => {
    it('should update a task successfully', async () => {
      const mockTask = {
        id: 1,
        title: 'Updated Task',
        description: 'Updated Description',
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock the prisma findUnique function
      prismaClient.task.findUnique.mockResolvedValue({ id: 1, title: 'Old Title' });
      
      // Mock the prisma update function
      prismaClient.task.update.mockResolvedValue(mockTask);

      const result = await TaskService.updateTask(
        1,
        { title: 'Updated Task', description: 'Updated Description' }
      );

      expect(prismaClient.task.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(prismaClient.task.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { title: 'Updated Task', description: 'Updated Description' },
      });
      expect(result).toEqual(mockTask);
    });

    it('should throw an error if taskId is not provided', async () => {
      await expect(async () => {
        await TaskService.updateTask(null, { title: 'Updated Task' });
      }).rejects.toThrow('Task ID is required');
    });

    it('should throw an error if no fields are provided for update', async () => {
      await expect(async () => {
        await TaskService.updateTask(1, {});
      }).rejects.toThrow('No fields provided for update');
    });

    it('should throw an error if task is not found', async () => {
      // Mock the prisma findUnique function to return null
      prismaClient.task.findUnique.mockResolvedValue(null);

      await expect(async () => {
        await TaskService.updateTask(1, { title: 'Updated Task' });
      }).rejects.toThrow('Task not found');
    });

    it('should throw an error if title is not a string', async () => {
      await expect(async () => {
        await TaskService.updateTask(1, { title: 123 });
      }).rejects.toThrow('Title must be a string');
    });

    it('should throw an error if description is not a string', async () => {
      await expect(async () => {
        await TaskService.updateTask(1, { description: 123 });
      }).rejects.toThrow('Description must be a string');
    });
  });

  describe('deleteTask', () => {
    it('should delete a task successfully', async () => {
      const mockTask = {
        id: 1,
        title: 'Test Task',
        description: 'Test Description',
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock the prisma findUnique function
      prismaClient.task.findUnique.mockResolvedValue(mockTask);
      
      // Mock the prisma delete function
      prismaClient.task.delete.mockResolvedValue(mockTask);

      const result = await TaskService.deleteTask(1);

      expect(prismaClient.task.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(prismaClient.task.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockTask);
    });

    it('should throw an error if taskId is not provided', async () => {
      await expect(async () => {
        await TaskService.deleteTask(null);
      }).rejects.toThrow('Task ID is required');
    });

    it('should throw an error if task is not found', async () => {
      // Mock the prisma findUnique function to return null
      prismaClient.task.findUnique.mockResolvedValue(null);

      await expect(async () => {
        await TaskService.deleteTask(1);
      }).rejects.toThrow('Task not found');
    });
  });
});
