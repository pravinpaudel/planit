const { prismaClient } = require('../utils/db');

class MilestoneService {
    /**
     * Creates a new milestone.
     * @param {Object} data - The milestone data.
     * @param {string} data.title - The title of the milestone.
     * @param {string} data.description - The description of the milestone.
     * @param {Date} data.deadline - The deadline for the milestone.
     * @param {number} data.taskId - The ID of the task associated with the milestone.
     * @param {string} data.status - The status of the milestone (NOT_STARTED, IN_PROGRESS, COMPLETED, AT_RISK, DELAYED).
     * @returns {Promise<Object>} The created milestone object.
     */
    static async createMilestone(data) {
        const { title, description, deadline, taskId, parentId, status } = data;
        if(!title || !description || !deadline || !taskId) {
            throw new Error('Missing required fields: title, description, deadline, taskId');
        }
        if (description && typeof description !== 'string') {
            throw new Error("Description must be a string");
        }
        
        // Handle legacy isComplete property
        let milestoneStatus = status || 'NOT_STARTED';
        if ('isComplete' in data) {
            milestoneStatus = data.isComplete ? 'COMPLETED' : 'NOT_STARTED';
        }
        
        try {
            const newMilestone = await prismaClient.milestone.create({
                data: {
                    title,
                    description,
                    deadline: new Date(deadline),
                    taskId,
                    status: milestoneStatus,
                    parentId: parentId || null // Optional parent ID for sub-milestones
                }
            });
            
            // Transform to add backward compatibility fields
            return this._transformMilestoneData(newMilestone);
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
                    children: {
                        include: {
                            children: true // Include grandchildren too for deeper hierarchies
                        }
                    }
                },
                orderBy: { createdAt: 'asc' }
            });
            
            // Transform milestones to add backward compatibility fields
            const transformedMilestones = milestones.map(milestone => 
                this._transformMilestoneData(milestone)
            );
            
            // Return only root level milestones (those with no parent)
            return transformedMilestones.filter(milestone => !milestone.parentId);
            
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
    static async updateMilestone(milestoneId, payload) {
        if(!milestoneId) {
            throw new Error("Milestone ID is required");
        }
        
        // Validate the payload
        if (Object.keys(payload).length === 0) {
            throw new Error("No fields provided for update");
        }
        
        // Handle legacy isComplete conversion to status
        const updateData = { ...payload };
        if ('isComplete' in updateData) {
            // Convert boolean isComplete to status enum
            updateData.status = updateData.isComplete ? 'COMPLETED' : 'NOT_STARTED';
            delete updateData.isComplete;
        }
        
        try {
            const updatedMilestone = await prismaClient.milestone.update({
                where: { id: milestoneId }, // Ensure userId is provided for security
                data: updateData
            });
            
            // Transform to add backward compatibility fields
            return this._transformMilestoneData(updatedMilestone);
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
                where: { id: milestoneId } // Ensure userId is provided for security
            });
        } catch (error) {
            throw new Error("Error deleting milestone: " + error.message);
        }
    }

    /**
     * Helper method to transform milestone data when fetching from the database
     * This adds backward compatibility for clients expecting isComplete field
     * @param {Object} milestone - The milestone data from the database
     * @returns {Object} - The transformed milestone data
     */
    static _transformMilestoneData(milestone) {
        if (!milestone) return milestone;

        // Add isComplete field based on status for backward compatibility
        const transformed = { ...milestone, isComplete: milestone.status === 'COMPLETED' };
        
        // Transform any children recursively
        if (transformed.children && Array.isArray(transformed.children)) {
            transformed.children = transformed.children.map(child => 
                this._transformMilestoneData(child)
            );
        }
        
        return transformed;
    }
}

module.exports = { MilestoneService };