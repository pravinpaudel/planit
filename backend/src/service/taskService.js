const { UserService } = require('./userService');
const { prismaClient } = require('../utils/db');

class TaskService {
    static async createTask(payload) {
        const { title, description, userId } = payload;
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
            throw new Error("Error creating task");
        }
    }

    static async getTasksByUserId(userId) {
        return await prismaClient.task.findMany({
            where: { userId }
        });
    }

    static async updateTask(taskId, payload) {
        return await prismaClient.task.update({
            where: { id: taskId },
            data: payload
        });
    }

    static async deleteTask(taskId) {
        return await prismaClient.task.delete({
            where: { id: taskId }
        });
    }
}

module.exports = { TaskService };