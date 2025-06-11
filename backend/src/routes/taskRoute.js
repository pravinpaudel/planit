const express = require('express');
const router = express.Router();
const {
    createTask,
    getUserTasks,
    updateTask,
    deleteTask
} = require('../controllers/taskController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Middleware to authenticate token for task routes
//router.use(authenticateToken);

router.get('/', getUserTasks);
router.post('/', createTask);
router.put('/:taskId', updateTask);
router.delete('/:taskId', deleteTask);

module.exports = router;