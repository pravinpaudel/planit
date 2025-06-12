// tests/unit/service/userService.test.js
const { UserService } = require('../../../src/service/userService');
const { prismaClient } = require('../../../src/utils/db');
const JWT = require('jsonwebtoken');

// Mock dependencies
jest.mock('../../../src/utils/db', () => ({
  prismaClient: {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mocked-token'),
  verify: jest.fn(),
}));

// Mock crypto functions
jest.mock('crypto', () => ({
  createHmac: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn().mockReturnValue('hashed-password'),
  }),
  randomBytes: jest.fn().mockReturnValue({
    toString: jest.fn().mockReturnValue('random-salt'),
  }),
}));

describe('UserService', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaClient.user.create.mockResolvedValue(mockUser);

      const result = await UserService.createUser({
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
      });

      expect(prismaClient.user.create).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should throw an error if required fields are missing', async () => {
      await expect(async () => {
        await UserService.createUser({
          email: 'test@example.com',
          // Missing password
          firstName: 'Test',
        });
      }).rejects.toThrow('Email, password, and firstName are required');

      await expect(async () => {
        await UserService.createUser({
          // Missing email
          password: 'Password123!',
          firstName: 'Test',
        });
      }).rejects.toThrow('Email, password, and firstName are required');
    });

    it('should throw an error if email format is invalid', async () => {
      await expect(async () => {
        await UserService.createUser({
          email: 'invalid-email',
          password: 'Password123!',
          firstName: 'Test',
        });
      }).rejects.toThrow('Invalid email format');
    });

    it('should throw an error if password is weak', async () => {
      await expect(async () => {
        await UserService.createUser({
          email: 'test@example.com',
          password: 'weak',
          firstName: 'Test',
        });
      }).rejects.toThrow(); // The exact error message depends on validation logic
    });

    it('should throw an error if firstName is too short', async () => {
      await expect(async () => {
        await UserService.createUser({
          email: 'test@example.com',
          password: 'Password123!',
          firstName: 'T', // Too short
        });
      }).rejects.toThrow('First name must be at least 2 characters');
    });

    it('should throw an error if email already exists', async () => {
      prismaClient.user.create.mockRejectedValue({ code: 'P2002' });

      await expect(async () => {
        await UserService.createUser({
          email: 'existing@example.com',
          password: 'Password123!',
          firstName: 'Test',
        });
      }).rejects.toThrow('Email already exists');
    });
  });

  // Add more test cases for other methods in UserService
  // For example: login, getUserById, updateUser, etc.
});
