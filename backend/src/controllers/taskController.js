const { TaskService } = require('../service/taskService');

async function createTask(req, res) {
    try {
        const task = await TaskService.createTask(req.body, req.user.id);
        res.status(201).json(task);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

async function getUserTasks(req, res) {
    try {
        const userId = req.user.id; // Assuming user ID is stored in req.user
        const tasks = await TaskService.getTasksByUserId(userId);
        res.status(200).json(tasks);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}
async function updateTask(req, res) {
    try {
        const taskId = req.params?.taskId;
        const updatedTask = await TaskService.updateTask(taskId, req.body);
        res.status(200).json(updatedTask);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}
async function deleteTask(req, res) {
    try {
        const taskId = req.params?.taskId;
        if (!taskId) {
            return res.status(400).json({ error: "Task ID is required" });
        }
        const deletedTask = await TaskService.deleteTask(taskId);
        if (!deletedTask) {
            return res.status(404).json({ error: "Task not found" });
        }
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

async function getTaskById(req, res) {
    const taskId = req.params?.taskId;
    if (!taskId) {
        return res.status(400).json({ error: "Task ID is required" });
    }
    try {
        const task = await TaskService.getTaskById(taskId);
        if (!task) {
            return res.status(404).json({ error: "Task not found" });
        }
        res.status(200).json(task);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

async function generateShareableLink(req, res) {
    const taskId = req.params?.taskId;
    if (!taskId) {
        return res.status(400).json({ error: "Task ID is required" });
    }
    try {
        const shareLink = await TaskService.generateShareLink(taskId, req.body, req.user.id);
        if (!shareLink) {
            return res.status(404).json({ error: "Task not found" });
        }
        res.status(201).json(shareLink);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

async function updateShareableLink(req, res) {
    const taskId = req.params?.taskId;
    if (!taskId) {
        return res.status(400).json({ error: "Task ID is required" });
    }
    try {
        const updatedLink = await TaskService.updateShareLink(taskId, req.body);
        if (!updatedLink) {
            return res.status(404).json({ error: "Share link not found" });
        }
        res.status(200).json(updatedLink);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

async function deleteShareableLink(req, res) {
    const taskId = req.params?.taskId;
    if (!taskId) {
        return res.status(400).json({ error: "Task ID is required" });
    }
    try {
        const deletedLink = await TaskService.deleteShareLink(taskId);
        if (!deletedLink) {
            return res.status(404).json({ error: "Share link not found" });
        }
        res.status(204).send();
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}

async function getTaskByShareableLink(req, res) {
    const shareableLink = req.params?.shareableLink;
    if(!shareableLink) {
        return res.status(400).json({ error: "Shareable link is missing" });
    }
    try {
        const task = await TaskService.getTaskByShareableLink(shareableLink);
        if(!task) {
            return res.status(404).json({ error: "Task not found for the provided shareable link" });
        }
        res.status(200).json(task);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

async function cloneTask(req, res) {
    const taskId = req.params?.taskId;
    if(!taskId) {
        return res.status(400).json({ error: "Task ID is required" });
    }
    try {
        const clonedTask = await TaskService.cloneTask(taskId, req.user.id);
        if (!clonedTask) {
            return res.status(404).json({ error: "Task not found" });
        }
        res.status(201).json(clonedTask);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

module.exports = {
    createTask,
    getUserTasks,
    updateTask,
    deleteTask,
    getTaskById,
    cloneTask,
    generateShareableLink,
    updateShareableLink,
    deleteShareableLink,
    getTaskByShareableLink
};