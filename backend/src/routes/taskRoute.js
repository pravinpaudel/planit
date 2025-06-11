const express = require('express');
const router = express.Router();
const {
    createTask,
    getUserTasks,
    updateTask,
    deleteTask
} = require('../controllers/taskController');

router.get('/', getUserTasks);
router.post('/', createTask);
router.put('/:taskId', updateTask);
router.delete('/:taskId', deleteTask);

module.exports = router;