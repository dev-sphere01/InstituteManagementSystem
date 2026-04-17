const express = require('express');
const router = express.Router();

const { isAuthenticatedUser } = require('../../../middlewares/auth');

const {
  getTasksByTab,
  updateTask,
  getTasksByStudent,
  markAsDone
} = require('../../../controllers/taskController');

router.use(isAuthenticatedUser);

router.get('/', getTasksByTab);
router.get('/student/:studentId', getTasksByStudent);
router.patch('/:id', updateTask);
router.post('/:id/done', markAsDone);

module.exports = router;
