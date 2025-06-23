const { UserService } = require('./userService');
const { MilestoneService } = require('./milestoneService');
const { prismaClient } = require('../utils/db');

class TaskService {
    static async createTask(payload, userId) {
        const { title, description } = payload;
        if (!title || !userId) {
            throw new Error("Title and userId are required");
        }
        if (description && typeof description !== 'string') {
            throw new Error("Description must be a string");
        }

        // Validate userId exists
        const user = await UserService.getUserById(userId);
        if (!user) {
            throw new Error("User not found");
        }

        try {
            // Create task
            return await prismaClient.task.create({
                data: {
                    title,
                    description,
                    userId
                }
            });
        } catch (error) {
            throw new Error("Error creating task: " + error.message);
        }
    }

    static async getTasksByUserId(userId) {
        if (!userId) {
            throw new Error("User ID is required");
        }
        
        try {
            // First check if user exists
            const user = await UserService.getUserById(userId);
            if (!user) {
                throw new Error("User not found");
            }
            
            return await prismaClient.task.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                include: {
                    milestones: {
                        include: {
                            children: true
                        }
                    }
                }
            });
        } catch (error) {
            console.error("Error retrieving tasks:", error);
            throw new Error("Error retrieving tasks: " + error.message);
        }
    }

    static async updateTask(taskId, payload) {
        if (!taskId) {
            throw new Error("Task ID is required");
        }
        
        // Validate the payload
        if (Object.keys(payload).length === 0) {
            throw new Error("No fields provided for update");
        }
        
        // Validate field types if they exist in the payload
        if (payload.title && typeof payload.title !== 'string') {
            throw new Error("Title must be a string");
        }
        
        if (payload.description && typeof payload.description !== 'string') {
            throw new Error("Description must be a string");
        }

        try {
            // Check if task exists
            const existingTask = await prismaClient.task.findUnique({
                where: { id: taskId }
            });
            
            if (!existingTask) {
                throw new Error("Task not found");
            }

            return await prismaClient.task.update({
                where: { id: taskId },
                data: payload
            });
        } catch (error) {
            console.error("Error updating task:", error);
            throw new Error("Error updating task: " + error.message);
        }
    }

    static async deleteTask(taskId) {
        if (!taskId) {
            throw new Error("Task ID is required");
        }
        
        try {
            // Check if task exists before deleting
            const existingTask = await prismaClient.task.findUnique({
                where: { id: taskId }
            });
            
            if (!existingTask) {
                throw new Error("Task not found");
            }
            
            return await prismaClient.task.delete({
                where: { id: taskId }
            });
        } catch (error) {
            console.error("Error deleting task:", error);
            if (error.message === "Task not found") {
                throw error;
            }
            throw new Error("Error deleting task: " + error.message);
        }
    }
}

module.exports = { TaskService };