// tests/unit/controllers/taskController.test.js
const taskController = require('../../../src/controllers/taskController');
const { TaskService } = require('../../../src/service/taskService');

// Mock TaskService
jest.mock('../../../src/service/taskService');

describe('Task Controller', () => {
  let req, res;

  // Set up request and response objects before each test
  beforeEach(() => {
    req = {
      body: {},
      params: {},
      user: { id: 1 }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    };
    
    jest.clearAllMocks();
  });

  describe('createTask', () => {
    it('should create a task successfully', async () => {
      // Arrange
      const mockTask = { id: 1, title: 'Test Task', userId: 1 };
      req.body = { title: 'Test Task', description: 'Test Description' };
      TaskService.createTask.mockResolvedValue(mockTask);

      // Act
      await taskController.createTask(req, res);

      // Assert
      expect(TaskService.createTask).toHaveBeenCalledWith(req.body, 1);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockTask);
    });

    it('should return 400 if task creation fails', async () => {
      // Arrange
      const errorMessage = 'Title is required';
      req.body = { description: 'Test Description' };
      TaskService.createTask.mockRejectedValue(new Error(errorMessage));

      // Act
      await taskController.createTask(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });

  describe('getUserTasks', () => {
    it('should get tasks successfully', async () => {
      // Arrange
      const mockTasks = [{ id: 1, title: 'Test Task', userId: 1 }];
      TaskService.getTasksByUserId.mockResolvedValue(mockTasks);

      // Act
      await taskController.getUserTasks(req, res);

      // Assert
      expect(TaskService.getTasksByUserId).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockTasks);
    });

    it('should return 400 if getting tasks fails', async () => {
      // Arrange
      const errorMessage = 'User not found';
      TaskService.getTasksByUserId.mockRejectedValue(new Error(errorMessage));

      // Act
      await taskController.getUserTasks(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });

  describe('updateTask', () => {
    it('should update a task successfully', async () => {
      // Arrange
      const mockTask = { id: 1, title: 'Updated Task', userId: 1 };
      req.params.taskId = 1;
      req.body = { title: 'Updated Task' };
      TaskService.updateTask.mockResolvedValue(mockTask);

      // Act
      await taskController.updateTask(req, res);

      // Assert
      expect(TaskService.updateTask).toHaveBeenCalledWith(1, req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockTask);
    });

    it('should return 400 if update fails', async () => {
      // Arrange
      const errorMessage = 'Task not found';
      req.params.taskId = 999;
      req.body = { title: 'Updated Task' };
      TaskService.updateTask.mockRejectedValue(new Error(errorMessage));

      // Act
      await taskController.updateTask(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });

  describe('deleteTask', () => {
    it('should delete a task successfully', async () => {
      // Arrange
      const mockTask = { id: 1, title: 'Test Task', userId: 1 };
      req.params.taskId = 1;
      TaskService.deleteTask.mockResolvedValue(mockTask);

      // Act
      await taskController.deleteTask(req, res);

      // Assert
      expect(TaskService.deleteTask).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it('should return 400 if taskId is not provided', async () => {
      // Arrange - No taskId in params

      // Act
      await taskController.deleteTask(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Task ID is required' });
    });

    it('should return 404 if task is not found', async () => {
      // Arrange
      req.params.taskId = 999;
      TaskService.deleteTask.mockResolvedValue(null);

      // Act
      await taskController.deleteTask(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Task not found' });
    });

    it('should return 400 if deletion fails', async () => {
      // Arrange
      const errorMessage = 'Database error';
      req.params.taskId = 1;
      TaskService.deleteTask.mockRejectedValue(new Error(errorMessage));

      // Act
      await taskController.deleteTask(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });
});
