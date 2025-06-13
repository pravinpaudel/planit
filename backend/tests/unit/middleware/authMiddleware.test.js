// tests/unit/middleware/authMiddleware.test.js
const { authenticateToken } = require('../../../src/middleware/authMiddleware');
const { UserService } = require('../../../src/service/userService');
const JWT = require('jsonwebtoken');

// Mock dependencies
jest.mock('../../../src/service/userService');
jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let req, res, next;

  // Set up request, response and next function before each test
  beforeEach(() => {
    req = {
      headers: {
        authorization: 'Bearer valid-token'
      }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    next = jest.fn();

    // Clear all mocks
    jest.clearAllMocks();
  });

  it('should call next() if token is valid', async () => {
    // Arrange
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User'
    };
    
    JWT.verify.mockReturnValue({ id: 1 });
    UserService.getUserById.mockResolvedValue(mockUser);

    // Act
    await authenticateToken(req, res, next);

    // Assert
    expect(JWT.verify).toHaveBeenCalledWith('valid-token', process.env.JWT_SECRET);
    expect(UserService.getUserById).toHaveBeenCalledWith(1);
    expect(req.user).toEqual({
      id: 1,
      email: 'test@example.com',
      firstName: 'Test'
    });
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should return 401 if token is missing', async () => {
    // Arrange
    req.headers.authorization = null;

    // Act
    await authenticateToken(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Access token is missing' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if token is invalid', async () => {
    // Arrange
    JWT.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    // Act
    await authenticateToken(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 403 if user does not exist', async () => {
    // Arrange
    JWT.verify.mockReturnValue({ id: 999 });
    UserService.getUserById.mockResolvedValue(null);

    // Act
    await authenticateToken(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'User no longer exists' });
    expect(next).not.toHaveBeenCalled();
  });
});
