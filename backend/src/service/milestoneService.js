const { prismaClient } = require('../utils/db');

class MilestoneService {
    /**
     * Creates a new milestone.
     * @param {Object} data - The milestone data.
     * @param {string} data.title - The title of the milestone.
     * @param {string} data.description - The description of the milestone.
     * @param {Date} data.deadline - The deadline for the milestone.
     * @param {number} data.taskId - The ID of the task associated with the milestone.
     * @returns {Promise<Object>} The created milestone object.
     */
    static async createMilestone(data) {
        const { title, description, deadline, taskId, parentId } = data;
        if(!title || !description || !deadline || !taskId) {
            throw new Error('Missing required fields: title, description, deadline, taskId');
        }
        if (description && typeof description !== 'string') {
            throw new Error("Description must be a string");
        }
        try {
            return await prismaClient.milestone.create({
                data: {
                    title,
                    description,
                    deadline: new Date(deadline),
                    taskId,
                    parentId: parentId || null // Optional parent ID for sub-milestones
                }
            });
        } catch (error) {
            throw new Error("Error creating milestone: " + error.message);
        }
    }

    /**
     * Gets all milestones for a specific task.
     * @param {number} taskId - The ID of the task.
     * @returns {Promise<Array>} The list of milestones for the task.
     */
    static async getMilestonesByTaskId(taskId) {
        if(!taskId) {
            throw new Error("Task ID is required");
        }
        try {
            const milestones = await prismaClient.milestone.findMany({
                where: { taskId },
                include: {
                    children: true
                },
                orderBy: { createdAt: 'asc' }
            });
            
            // Return only root level milestones (those with no parent)
            return milestones.filter(milestone => !milestone.parentId);
            
        } catch (error) {
            throw new Error("Error fetching milestones: " + error.message);
        }
    }
    
    /**
     * Updates an existing milestone.
     * @param {number} milestoneId - The ID of the milestone to update.
     * @param {Object} data - The updated milestone data.
     * @returns {Promise<Object>} The updated milestone object.
     */
    static async updateMilestone(milestoneId, data) {
        if(!milestoneId) {
            throw new Error("Milestone ID is required");
        }
        // Validate the payload
        if (Object.keys(data).length === 0) {
            throw new Error("No fields provided for update");
        }
        try {
            return await prismaClient.milestone.update({
                where: { id: milestoneId },
                data: {
                    ...data
                }
            });
        } catch (error) {
            throw new Error("Error updating milestone: " + error.message);
        }
    }

    /**
     * Deletes a milestone.
     * @param {number} milestoneId - The ID of the milestone to delete.
     * @returns {Promise<Object>} The deleted milestone object.
     */
    static async deleteMilestone(milestoneId) {
        if(!milestoneId) {
            throw new Error("Milestone ID is required");
        }
        try {
            return await prismaClient.milestone.delete({
                where: { id: milestoneId }
            });
        } catch (error) {
            throw new Error("Error deleting milestone: " + error.message);
        }
    }
}

module.exports = { MilestoneService };