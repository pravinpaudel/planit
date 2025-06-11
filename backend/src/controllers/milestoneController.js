const { MilestoneService } = require('../service/milestoneService');

/* * Controller for handling milestone-related requests.
 * This includes creating, retrieving, and updating milestones.
 */

async function handleCreateMilestone(req, res) {
    try {
        const milestone = await MilestoneService.createMilestone(req.body);
        res.status(201).json(milestone);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

async function handleUpdateMilestone(req, res) {
    try {
        const milestoneId = req.params?.milestoneId;
        if (!milestoneId) {
            return res.status(400).json({ error: "Milestone ID is required" });
        }
        const updatedMilestone = await MilestoneService.updateMilestone(milestoneId, req.body);
        res.status(200).json(updatedMilestone);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

async function handleGetMilestonesByTaskId(req, res) {
    const taskId = req.params?.taskId;
    if(!taskId) {
        return res.status(400).json({ error: "Task ID is required" });
    }
    try {
        const milestones = await MilestoneService.getMilestonesByTaskId(taskId);
        res.status(200).json(milestones);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

async function handleDeleteMilestone(req, res) {
    const milestoneId = req.params?.milestoneId;
    if (!milestoneId) {
        return res.status(400).json({ error: "Milestone ID is required" });
    }
    try {
        const deletedMilestone = await MilestoneService.deleteMilestone(milestoneId);
        res.status(200).json(deletedMilestone);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}
module.exports = {
    handleCreateMilestone,
    handleUpdateMilestone,
    handleGetMilestonesByTaskId,
    handleDeleteMilestone
};