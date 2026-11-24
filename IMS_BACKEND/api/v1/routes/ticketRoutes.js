const express = require('express');
const router = express.Router();
const {
  createTicket,
  getAllTickets,
  getTicketStats,
  getTicketById,
  updateTicket,
  updateTicketStatus,
  assignTicket,
  addTicketComment,
  addSubtask,
  toggleSubtask,
  deleteSubtask,
  deleteTicket,
} = require('../../../controllers/ticketController');
const { isAuthenticatedUser } = require('../../../middlewares/auth');

// All ticket routes require user authentication
router.use(isAuthenticatedUser);

router.route('/')
  .get(getAllTickets)
  .post(createTicket);

router.route('/stats')
  .get(getTicketStats);

router.route('/:id')
  .get(getTicketById)
  .put(updateTicket)
  .delete(deleteTicket);

router.route('/:id/status')
  .patch(updateTicketStatus);

router.route('/:id/assign')
  .patch(assignTicket);

router.route('/:id/comments')
  .post(addTicketComment);

router.route('/:id/subtasks')
  .post(addSubtask);

router.route('/:id/subtasks/:subtaskId')
  .patch(toggleSubtask)
  .delete(deleteSubtask);

module.exports = router;
