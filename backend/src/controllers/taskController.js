const { TaskService } = require('../service/taskService');

async function createTask(req, res) {
    try {
        const task = await TaskService.createTask(req.body);
        res.status(201).json(task);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

async function getUserTasks(req, res) {
    try {
        const userId = req.user?.id; // Assuming user ID is stored in req.user
        const tasks = await TaskService.getTasksByUserId(userId);
        res.status(200).json(tasks);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}
async function updateTask(req, res) {
    try {
        const taskId = req.params?.id;
        const updatedTask = await TaskService.updateTask(taskId, req.body);
        res.status(200).json(updatedTask);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}
async function deleteTask(req, res) {
    try {
        const taskId = req.params?.id;
        await TaskService.deleteTask(taskId);
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}
module.exports = {
    createTask,
    getUserTasks,
    updateTask,
    deleteTask
};