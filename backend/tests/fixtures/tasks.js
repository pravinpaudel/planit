// tests/fixtures/tasks.js
/**
 * Task fixtures for use in tests
 */
module.exports = {
  validTask: {
    id: 1,
    title: 'Test Task',
    description: 'Test Description',
    userId: 1,
    createdAt: new Date('2025-06-01T12:00:00Z'),
    updatedAt: new Date('2025-06-01T12:00:00Z'),
  },
  
  taskWithoutDescription: {
    id: 2,
    title: 'Task without description',
    userId: 1,
    createdAt: new Date('2025-06-01T12:00:00Z'),
    updatedAt: new Date('2025-06-01T12:00:00Z'),
  },
  
  invalidTask: {
    // Missing title
    description: 'Invalid task',
    userId: 1,
  },
  
  taskList: [
    {
      id: 1,
      title: 'Task 1',
      description: 'Description 1',
      userId: 1,
      createdAt: new Date('2025-06-01T12:00:00Z'),
      updatedAt: new Date('2025-06-01T12:00:00Z'),
    },
    {
      id: 2,
      title: 'Task 2',
      description: 'Description 2',
      userId: 1,
      createdAt: new Date('2025-06-02T12:00:00Z'),
      updatedAt: new Date('2025-06-02T12:00:00Z'),
    },
  ],
  
  createTaskPayload: {
    title: 'New Task',
    description: 'New task description',
  },
  
  updateTaskPayload: {
    title: 'Updated Task',
    description: 'Updated description',
  },
};
