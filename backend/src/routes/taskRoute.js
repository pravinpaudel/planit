const express = require('express');
const router = express.Router();
const {
    createTask,
    getUserTasks,
    updateTask,
    deleteTask,
    getTaskById,
    generateShareableLink,
    updateShareableLink,
    deleteShareableLink,
    getTaskByShareableLink,
    cloneTask
} = require('../controllers/taskController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { publicEndpointLimiter, sharingEndpointLimiter } = require('../middleware/rateLimitMiddleware');

// Public routes - these don't require authentication
// Keep these BEFORE the authenticateToken middleware
router.get('/shared/:shareableLink', publicEndpointLimiter, getTaskByShareableLink);

// Apply authentication middleware to all protected routes below this line
router.use(authenticateToken);

// Protected task routes
router.get('/', getUserTasks);
router.get('/:taskId', getTaskById);
router.post('/', createTask);
router.put('/:taskId', updateTask);
router.delete('/:taskId', deleteTask);

// Share link management routes (protected)
// Also apply rate limits to sharing operations to prevent abuse
router.post('/:taskId/share', sharingEndpointLimiter, generateShareableLink);
router.put('/:taskId/share', sharingEndpointLimiter, updateShareableLink);
router.delete('/:taskId/share', deleteShareableLink);

// Clone task route
router.post('/shared/:taskId/clone', cloneTask);

module.exports = router;