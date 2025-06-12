// tests/fixtures/users.js
/**
 * User fixtures for use in tests
 */
module.exports = {
  validUser: {
    id: 1,
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    createdAt: new Date('2025-06-01T12:00:00Z'),
    updatedAt: new Date('2025-06-01T12:00:00Z'),
  },
  
  adminUser: {
    id: 2,
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    isAdmin: true,
    createdAt: new Date('2025-06-01T12:00:00Z'),
    updatedAt: new Date('2025-06-01T12:00:00Z'),
  },
  
  invalidUser: {
    // Missing email
    firstName: 'Invalid',
    lastName: 'User',
  },
  
  userList: [
    {
      id: 1,
      email: 'user1@example.com',
      firstName: 'User',
      lastName: 'One',
      createdAt: new Date('2025-06-01T12:00:00Z'),
      updatedAt: new Date('2025-06-01T12:00:00Z'),
    },
    {
      id: 2,
      email: 'user2@example.com',
      firstName: 'User',
      lastName: 'Two',
      createdAt: new Date('2025-06-02T12:00:00Z'),
      updatedAt: new Date('2025-06-02T12:00:00Z'),
    },
  ],
  
  createUserPayload: {
    email: 'newuser@example.com',
    password: 'Password123!',
    firstName: 'New',
    lastName: 'User',
  },
  
  updateUserPayload: {
    firstName: 'Updated',
    lastName: 'Name',
  },
  
  loginCredentials: {
    email: 'test@example.com',
    password: 'Password123!',
  },
};
