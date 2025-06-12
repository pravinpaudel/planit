// tests/fixtures/milestones.js
/**
 * Milestone fixtures for use in tests
 */
module.exports = {
  validMilestone: {
    id: 1,
    title: 'Test Milestone',
    description: 'Test Description',
    deadline: new Date('2025-12-31T12:00:00Z'),
    taskId: 1,
    createdAt: new Date('2025-06-01T12:00:00Z'),
    updatedAt: new Date('2025-06-01T12:00:00Z'),
  },
  
  milestoneWithoutDescription: {
    id: 2,
    title: 'Milestone without description',
    deadline: new Date('2025-12-31T12:00:00Z'),
    taskId: 1,
    createdAt: new Date('2025-06-01T12:00:00Z'),
    updatedAt: new Date('2025-06-01T12:00:00Z'),
  },
  
  invalidMilestone: {
    // Missing title
    description: 'Invalid milestone',
    taskId: 1,
  },
  
  milestoneList: [
    {
      id: 1,
      title: 'Milestone 1',
      description: 'Description 1',
      deadline: new Date('2025-12-31T12:00:00Z'),
      taskId: 1,
      createdAt: new Date('2025-06-01T12:00:00Z'),
      updatedAt: new Date('2025-06-01T12:00:00Z'),
    },
    {
      id: 2,
      title: 'Milestone 2',
      description: 'Description 2',
      deadline: new Date('2025-11-30T12:00:00Z'),
      taskId: 1,
      createdAt: new Date('2025-06-02T12:00:00Z'),
      updatedAt: new Date('2025-06-02T12:00:00Z'),
    },
  ],
  
  createMilestonePayload: {
    title: 'New Milestone',
    description: 'New milestone description',
    deadline: '2025-12-31T12:00:00Z',
    taskId: 1,
  },
  
  updateMilestonePayload: {
    title: 'Updated Milestone',
    description: 'Updated description',
    deadline: '2025-10-15T12:00:00Z',
  },
};
