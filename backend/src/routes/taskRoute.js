const express = require('express');
const router = express.Router();
const {
    createTask,
    getUserTasks,
    updateTask,
    deleteTask,
    getTaskById
} = require('../controllers/taskController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Apply authentication middleware to all task routes
router.use(authenticateToken);

router.get('/', getUserTasks);
router.get('/:taskId', getTaskById);
router.post('/', createTask);
router.put('/:taskId', updateTask);
router.delete('/:taskId', deleteTask);

module.exports = router;