const express = require('express');
const router = express.Router();
const controller = require('../../../controllers/workflowChecklistController');
const { isAuthenticatedUser } = require('../../../middlewares/auth');

// All checklist routes require JWT authentication
router.use(isAuthenticatedUser);

router.route('/')
  .get(controller.getAllWorkflows);

router.route('/admission/:admissionId')
  .get(controller.getWorkflowByAdmission);

router.route('/:id/tasks/:taskId')
  .patch(controller.updateWorkflowTask);

router.route('/:id/reminders')
  .post(controller.sendManualReminder);

router.route('/:id/tasks/:taskId/escalate')
  .post(controller.escalateTask);

module.exports = router;
