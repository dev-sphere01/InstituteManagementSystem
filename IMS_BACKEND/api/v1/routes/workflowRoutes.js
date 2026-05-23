const express = require('express');
const router = express.Router();

const {
  createWorkflowForTarget,
  getWorkflowById,
  getWorkflowsByTarget
} = require('../../../controllers/workflowController');

router.post('/', createWorkflowForTarget);
router.get('/', getWorkflowsByTarget);
router.get('/:id', getWorkflowById);

module.exports = router;
