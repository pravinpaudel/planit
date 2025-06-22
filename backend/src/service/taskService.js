const { UserService } = require('./userService');
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

    static async getTaskById(taskId) {
        if(!taskId) {
            throw new Error("Task ID is required");
        }
        try {
            const task = await prismaClient.task.findUnique({
                where: { id: taskId },
                include: {
                    milestones: {
                        include: {
                            children: true
                        }
                    }
                }
            });
            if (!task) {
                throw new Error("Task not found");
            }
            return task;
        } catch (error) {
            console.error("Error retrieving task:", error);
            throw new Error("Error retrieving task: " + error.message);
        }
    }

    static async generateShareLink(taskId, payload = {}, userId) {
        if(!taskId) {
            throw new Error("Task ID is required");
        }

        try {
            // Check if task exists
            const task = await prismaClient.task.findUnique({
                where: { id: taskId, userId: userId },
            });
            
            if (!task) {
                throw new Error("Task not found");
            }
            
            const shareableLink = this.generateLink();
            
            // Update the task with the sharing information
            const updatedTask = await prismaClient.task.update({
                where: { id: taskId },
                data: { 
                    shareableLink,
                    isPublic: true
                }
            });
            
            return {
                shareableLink: updatedTask.shareableLink,
                isPublic: updatedTask.isPublic
            };
        } catch (error) {
            console.error("Error generating share link:", error);
            throw new Error("Error generating share link: " + error.message);
        }
    }

    /**
     * This method updates the shareable link and other sharing settings for a task.
     * It allows for regenerating the link, and other options.
     * @param {*} taskId 
     * @param {*} payload 
     * @returns Shareable link and sharing status
     * @throws Error if task ID is not provided or task does not exist
     * @throws Error if task is not currently shared
     */
    static async updateShareLink(taskId, payload = {}) {
        if(!taskId) {
            throw new Error("Task ID is required");
        }
        
        try {
            // Check if task exists and is currently shared
            const task = await prismaClient.task.findUnique({
                where: { id: taskId }
            });
            
            if (!task) {
                throw new Error("Task not found");
            }
            
            if (!task.isPublic || !task.shareableLink) {
                throw new Error("Task is not currently shared. Use generateShareLink instead.");
            }
            
            // Prepare update data based on payload
            const updateData = {};
            
            // Option to regenerate the shareable link for security reasons
            if (payload.regenerateLink === true) {
                updateData.shareableLink = this.generateLink();
            }
            
            // Update the task with new sharing settings
            const updatedTask = await prismaClient.task.update({
                where: { id: taskId },
                data: updateData
            });
            
            return {
                shareableLink: updatedTask.shareableLink,
                isPublic: updatedTask.isPublic
            };
        } catch (error) {
            console.error("Error updating share link:", error);
            throw new Error("Error updating share link: " + error.message);
        }
    }
    
    static async deleteShareLink(taskId) {
        if(!taskId) {
            throw new Error("Task ID is required");
        }
        
        try {
            // Check if task exists
            const task = await prismaClient.task.findUnique({
                where: { id: taskId }
            });
            
            if (!task) {
                throw new Error("Task not found");
            }
            
            // Only attempt to update if sharing is currently enabled
            if (!task.isPublic && !task.shareableLink) {
                return { message: "Task was not shared" };
            }
            
            // Disable sharing by updating the task
            await prismaClient.task.update({
                where: { id: taskId },
                data: { 
                    shareableLink: null, 
                    isPublic: false 
                }
            });
            
            return { message: "Sharing disabled successfully" };
        } catch (error) {
            console.error("Error deleting share link:", error);
            throw new Error("Error deleting share link: " + error.message);
        }
    }

    static async getTaskByShareableLink(shareableLink) {
        if(!shareableLink) {
            throw new Error("Shareable link is required");
        }
        try {
            return await prismaClient.task.findFirst({
                where: { shareableLink, isPublic: true },
                include: {
                    milestones: {
                        include: {
                            children: true
                        }
                    }
                }
            })
        } catch (error) {
            console.error("Error retrieving task by shareable link:", error);
            throw new Error("Error retrieving task by shareable link: " + error.message);
        }
    }

    static async cloneTask(taskId, userId) {
        if(!taskId || !userId) {
            throw new Error("Task ID and user ID are required");
        }
        try {
            // Check if task exists
            const task = await prismaClient.task.findUnique({
                where: { id: taskId },
                include: {
                    milestones: {
                        include: {
                            children: true
                        }
                    }
                }
            });
            
            if (!task) {
                throw new Error("Task not found");
            }

            // Create a new task with the same details but different user ID
            const clonedTask = await prismaClient.task.create({
                data: {
                    title: task.title,
                    description: task.description,
                    userId,
                    milestones: {
                        create: task.milestones.map(milestone => ({
                            title: milestone.title,
                            description: milestone.description,
                            children: {
                                create: milestone.children.map(child => ({
                                    title: child.title,
                                    description: child.description
                                }))
                            }
                        }))
                    }
                }
            });

            return clonedTask;
        } catch (error) {
            console.error("Error cloning task:", error);
            throw new Error("Error cloning task: " + error.message);
        }
    }

     static generateLink() {
        // Generate a unique, URL-friendly shareable link
        // Using a combination of base62 encoding and the current timestamp for uniqueness
        const timestamp = Date.now().toString(36);
        const randomStr = Math.random().toString(36).substring(2, 8);
        const shareableLink = `${timestamp}-${randomStr}`;
        return shareableLink;
    }

}

module.exports = { TaskService };