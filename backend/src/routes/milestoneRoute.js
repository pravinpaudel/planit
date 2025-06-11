const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const {
    handleCreateMilestone,
    handleUpdateMilestone,
    handleGetMilestonesByTaskId,
    handleDeleteMilestone
} = require('../controllers/milestoneController');

const router = express.Router();

router.use(authenticateToken);

router.get('/:taskId', handleGetMilestonesByTaskId);
router.post('/', handleCreateMilestone);
router.put('/:milestoneId', handleUpdateMilestone);
router.delete('/:milestoneId', handleDeleteMilestone);

module.exports = router;