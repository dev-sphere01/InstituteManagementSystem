const express = require('express');
const router = express.Router();

const {
  getTasks,
  getTaskById,
  updateTaskStatus,
  assignTask,
  getTaskHistory
} = require('../../../controllers/taskController');

router.get('/', getTasks);
router.get('/:id', getTaskById);
router.patch('/:id/status', updateTaskStatus);
router.patch('/:id/assign', assignTask);
router.get('/:id/history', getTaskHistory);

module.exports = router;
