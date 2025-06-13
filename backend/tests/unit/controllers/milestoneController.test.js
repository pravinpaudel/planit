// tests/unit/controllers/milestoneController.test.js
const milestoneController = require('../../../src/controllers/milestoneController');
const { MilestoneService } = require('../../../src/service/milestoneService');

// Mock MilestoneService
jest.mock('../../../src/service/milestoneService');

describe('Milestone Controller', () => {
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
    };
    
    jest.clearAllMocks();
  });

  describe('handleCreateMilestone', () => {
    it('should create a milestone successfully', async () => {
      // Arrange
      const mockMilestone = {
        id: 1,
        title: 'Test Milestone',
        description: 'Test Description',
        deadline: new Date('2025-12-31'),
        taskId: 1
      };
      
      req.body = {
        title: 'Test Milestone',
        description: 'Test Description',
        deadline: '2025-12-31',
        taskId: 1
      };
      
      MilestoneService.createMilestone.mockResolvedValue(mockMilestone);

      // Act
      await milestoneController.handleCreateMilestone(req, res);

      // Assert
      expect(MilestoneService.createMilestone).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockMilestone);
    });

    it('should return 400 if milestone creation fails', async () => {
      // Arrange
      const errorMessage = 'Missing required fields';
      MilestoneService.createMilestone.mockRejectedValue(new Error(errorMessage));

      // Act
      await milestoneController.handleCreateMilestone(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });

  describe('handleUpdateMilestone', () => {
    it('should update a milestone successfully', async () => {
      // Arrange
      const mockMilestone = {
        id: 1,
        title: 'Updated Milestone',
        description: 'Updated Description',
        deadline: new Date('2025-12-31'),
        taskId: 1
      };
      
      req.params.milestoneId = 1;
      req.body = {
        title: 'Updated Milestone',
        description: 'Updated Description'
      };
      
      MilestoneService.updateMilestone.mockResolvedValue(mockMilestone);

      // Act
      await milestoneController.handleUpdateMilestone(req, res);

      // Assert
      expect(MilestoneService.updateMilestone).toHaveBeenCalledWith(1, req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockMilestone);
    });

    it('should return 400 if milestoneId is missing', async () => {
      // Act
      await milestoneController.handleUpdateMilestone(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Milestone ID is required' });
    });

    it('should return 400 if update fails', async () => {
      // Arrange
      req.params.milestoneId = 1;
      const errorMessage = 'Milestone not found';
      MilestoneService.updateMilestone.mockRejectedValue(new Error(errorMessage));

      // Act
      await milestoneController.handleUpdateMilestone(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });

  describe('handleGetMilestonesByTaskId', () => {
    it('should get milestones successfully', async () => {
      // Arrange
      const mockMilestones = [
        {
          id: 1,
          title: 'Test Milestone 1',
          description: 'Test Description 1',
          deadline: new Date('2025-12-31'),
          taskId: 1
        },
        {
          id: 2,
          title: 'Test Milestone 2',
          description: 'Test Description 2',
          deadline: new Date('2025-12-31'),
          taskId: 1
        }
      ];
      
      req.params.taskId = 1;
      MilestoneService.getMilestonesByTaskId.mockResolvedValue(mockMilestones);

      // Act
      await milestoneController.handleGetMilestonesByTaskId(req, res);

      // Assert
      expect(MilestoneService.getMilestonesByTaskId).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockMilestones);
    });

    it('should return 400 if taskId is missing', async () => {
      // Act
      await milestoneController.handleGetMilestonesByTaskId(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Task ID is required' });
    });

    it('should return 400 if fetching fails', async () => {
      // Arrange
      req.params.taskId = 1;
      const errorMessage = 'Error fetching milestones';
      MilestoneService.getMilestonesByTaskId.mockRejectedValue(new Error(errorMessage));

      // Act
      await milestoneController.handleGetMilestonesByTaskId(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });

  describe('handleDeleteMilestone', () => {
    it('should delete a milestone successfully', async () => {
      // Arrange
      const mockMilestone = {
        id: 1,
        title: 'Test Milestone',
        description: 'Test Description',
        deadline: new Date('2025-12-31'),
        taskId: 1
      };
      
      req.params.milestoneId = 1;
      MilestoneService.deleteMilestone.mockResolvedValue(mockMilestone);

      // Act
      await milestoneController.handleDeleteMilestone(req, res);

      // Assert
      expect(MilestoneService.deleteMilestone).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockMilestone);
    });

    it('should return 400 if milestoneId is missing', async () => {
      // Act
      await milestoneController.handleDeleteMilestone(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Milestone ID is required' });
    });

    it('should return 400 if deletion fails', async () => {
      // Arrange
      req.params.milestoneId = 1;
      const errorMessage = 'Milestone not found';
      MilestoneService.deleteMilestone.mockRejectedValue(new Error(errorMessage));

      // Act
      await milestoneController.handleDeleteMilestone(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });
});
