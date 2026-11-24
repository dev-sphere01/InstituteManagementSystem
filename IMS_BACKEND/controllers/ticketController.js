const Ticket = require('../models/ticketModel');
const User = require('../models/userModel');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/ErrorHandler');
const mongoose = require('mongoose');

// @desc    Create a new ticket / task
// @route   POST /api/v1/tickets
// @access  Private
exports.createTicket = catchAsyncErrors(async (req, res, next) => {
  const {
    title,
    description,
    department,
    assignedTo,
    priority,
    category,
    dueDate,
    estimatedHours,
    tags,
    subtasks,
  } = req.body;

  let assignedUser = null;
  if (assignedTo && mongoose.Types.ObjectId.isValid(assignedTo)) {
    assignedUser = await User.findById(assignedTo).select('name email role');
  }

  const creatorName = req.user ? req.user.name : 'System User';

  // Format initial subtasks if any
  const formattedSubtasks = Array.isArray(subtasks)
    ? subtasks.map((st) => ({
        title: typeof st === 'string' ? st : st.title,
        isCompleted: false,
      }))
    : [];

  const activityLog = [
    {
      action: 'Created',
      performedBy: req.user ? req.user._id : null,
      performedByName: creatorName,
      details: `Ticket created for ${department} department${
        assignedUser ? ` and assigned to ${assignedUser.name}` : ''
      }`,
      timestamp: new Date(),
    },
  ];

  const ticket = await Ticket.create({
    title,
    description,
    department,
    assignedTo: assignedUser ? assignedUser._id : null,
    assignedToName: assignedUser ? assignedUser.name : '',
    assignedToEmail: assignedUser ? assignedUser.email : '',
    createdBy: req.user ? req.user._id : null,
    createdByName: creatorName,
    priority: priority || 'Medium',
    category: category || 'Task',
    dueDate: dueDate ? new Date(dueDate) : null,
    estimatedHours: estimatedHours ? Number(estimatedHours) : 0,
    tags: Array.isArray(tags) ? tags : [],
    subtasks: formattedSubtasks,
    activityLog,
  });

  res.status(201).json({
    success: true,
    message: 'Ticket created successfully',
    ticket,
  });
});

// @desc    Get all tickets with filters, search, and pagination
// @route   GET /api/v1/tickets
// @access  Private
exports.getAllTickets = catchAsyncErrors(async (req, res, next) => {
  const {
    department,
    assignedTo,
    createdBy,
    status,
    priority,
    category,
    search,
    view, // 'all', 'assigned_to_me', 'created_by_me', 'my_department', 'unassigned'
    page = 1,
    limit = 50,
    sortBy = 'createdAt',
    order = 'desc',
  } = req.query;

  const query = {};

  // Department filter
  if (department && department !== 'all') {
    query.department = department;
  }

  // Status filter
  if (status && status !== 'all') {
    query.status = status;
  }

  // Priority filter
  if (priority && priority !== 'all') {
    query.priority = priority;
  }

  // Category filter
  if (category && category !== 'all') {
    query.category = category;
  }

  // View-based filtering
  if (view === 'assigned_to_me' && req.user) {
    query.assignedTo = req.user._id;
  } else if (view === 'created_by_me' && req.user) {
    query.createdBy = req.user._id;
  } else if (view === 'unassigned') {
    query.assignedTo = null;
  }

  // Specific assignee or creator if given in query
  if (assignedTo && assignedTo !== 'all') {
    if (assignedTo === 'unassigned') {
      query.assignedTo = null;
    } else if (mongoose.Types.ObjectId.isValid(assignedTo)) {
      query.assignedTo = assignedTo;
    }
  }

  if (createdBy && mongoose.Types.ObjectId.isValid(createdBy)) {
    query.createdBy = createdBy;
  }

  // Search keyword across ticketNumber, title, description, department, assignedToName
  if (search && search.trim() !== '') {
    const searchRegex = new RegExp(search.trim(), 'i');
    query.$or = [
      { ticketNumber: searchRegex },
      { title: searchRegex },
      { description: searchRegex },
      { department: searchRegex },
      { assignedToName: searchRegex },
      { createdByName: searchRegex },
      { tags: searchRegex },
    ];
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 50;
  const skip = (pageNum - 1) * limitNum;
  const sortOptions = {};
  sortOptions[sortBy] = order === 'asc' ? 1 : -1;

  const total = await Ticket.countDocuments(query);
  const tickets = await Ticket.find(query)
    .populate('assignedTo', 'name email avatar role')
    .populate('createdBy', 'name email avatar role')
    .sort(sortOptions)
    .skip(skip)
    .limit(limitNum);

  res.status(200).json({
    success: true,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
    tickets,
  });
});

// @desc    Get single ticket by ID
// @route   GET /api/v1/tickets/:id
// @access  Private
exports.getTicketById = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  let ticket;
  if (mongoose.Types.ObjectId.isValid(id)) {
    ticket = await Ticket.findById(id)
      .populate('assignedTo', 'name email avatar role')
      .populate('createdBy', 'name email avatar role')
      .populate('comments.user', 'name email avatar role');
  } else {
    ticket = await Ticket.findOne({ ticketNumber: id })
      .populate('assignedTo', 'name email avatar role')
      .populate('createdBy', 'name email avatar role')
      .populate('comments.user', 'name email avatar role');
  }

  if (!ticket) {
    return next(new ErrorHandler('Ticket not found', 404));
  }

  res.status(200).json({
    success: true,
    ticket,
  });
});

// @desc    Update ticket details
// @route   PUT /api/v1/tickets/:id
// @access  Private
exports.updateTicket = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const ticket = await Ticket.findById(id);

  if (!ticket) {
    return next(new ErrorHandler('Ticket not found', 404));
  }

  const {
    title,
    description,
    department,
    priority,
    category,
    dueDate,
    estimatedHours,
    tags,
  } = req.body;

  const changes = [];
  if (title && title !== ticket.title) {
    changes.push(`Title changed to "${title}"`);
    ticket.title = title;
  }
  if (description && description !== ticket.description) {
    ticket.description = description;
  }
  if (department && department !== ticket.department) {
    changes.push(`Department changed from ${ticket.department} to ${department}`);
    ticket.department = department;
  }
  if (priority && priority !== ticket.priority) {
    changes.push(`Priority changed from ${ticket.priority} to ${priority}`);
    ticket.priority = priority;
  }
  if (category && category !== ticket.category) {
    changes.push(`Category changed to ${category}`);
    ticket.category = category;
  }
  if (dueDate !== undefined) {
    ticket.dueDate = dueDate ? new Date(dueDate) : null;
  }
  if (estimatedHours !== undefined) {
    ticket.estimatedHours = Number(estimatedHours);
  }
  if (Array.isArray(tags)) {
    ticket.tags = tags;
  }

  if (changes.length > 0) {
    ticket.activityLog.push({
      action: 'Updated',
      performedBy: req.user ? req.user._id : null,
      performedByName: req.user ? req.user.name : 'System User',
      details: changes.join(', '),
      timestamp: new Date(),
    });
  }

  await ticket.save();

  res.status(200).json({
    success: true,
    message: 'Ticket updated successfully',
    ticket,
  });
});

// @desc    Update ticket status
// @route   PATCH /api/v1/tickets/:id/status
// @access  Private
exports.updateTicketStatus = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { status, resolutionNotes } = req.body;

  const validStatuses = ['Open', 'In Progress', 'Under Review', 'Pending', 'Resolved', 'Closed'];
  if (!validStatuses.includes(status)) {
    return next(new ErrorHandler('Invalid ticket status', 400));
  }

  const ticket = await Ticket.findById(id);
  if (!ticket) {
    return next(new ErrorHandler('Ticket not found', 404));
  }

  const previousStatus = ticket.status;
  ticket.status = status;

  if (resolutionNotes) {
    ticket.resolutionNotes = resolutionNotes;
  }

  if (status === 'Resolved') {
    ticket.resolvedAt = new Date();
    ticket.resolvedBy = req.user ? req.user._id : null;
  } else if (status === 'Closed') {
    ticket.closedAt = new Date();
  }

  ticket.activityLog.push({
    action: 'Status Change',
    performedBy: req.user ? req.user._id : null,
    performedByName: req.user ? req.user.name : 'System User',
    details: `Status changed from ${previousStatus} to ${status}${
      resolutionNotes ? ` (Notes: ${resolutionNotes})` : ''
    }`,
    timestamp: new Date(),
  });

  await ticket.save();

  res.status(200).json({
    success: true,
    message: `Ticket status updated to ${status}`,
    ticket,
  });
});

// @desc    Assign ticket to employee or department
// @route   PATCH /api/v1/tickets/:id/assign
// @access  Private
exports.assignTicket = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { assignedTo, department } = req.body;

  const ticket = await Ticket.findById(id);
  if (!ticket) {
    return next(new ErrorHandler('Ticket not found', 404));
  }

  const details = [];

  if (department && department !== ticket.department) {
    details.push(`Department transferred to ${department}`);
    ticket.department = department;
  }

  if (assignedTo !== undefined) {
    if (!assignedTo || assignedTo === 'unassigned') {
      ticket.assignedTo = null;
      ticket.assignedToName = '';
      ticket.assignedToEmail = '';
      details.push('Unassigned from employee');
    } else if (mongoose.Types.ObjectId.isValid(assignedTo)) {
      const user = await User.findById(assignedTo).select('name email');
      if (user) {
        ticket.assignedTo = user._id;
        ticket.assignedToName = user.name;
        ticket.assignedToEmail = user.email;
        details.push(`Assigned to ${user.name}`);
      }
    }
  }

  ticket.activityLog.push({
    action: 'Assignment',
    performedBy: req.user ? req.user._id : null,
    performedByName: req.user ? req.user.name : 'System User',
    details: details.join(', ') || 'Assignment updated',
    timestamp: new Date(),
  });

  await ticket.save();

  res.status(200).json({
    success: true,
    message: 'Ticket assignment updated',
    ticket,
  });
});

// @desc    Add comment to ticket
// @route   POST /api/v1/tickets/:id/comments
// @access  Private
exports.addTicketComment = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { text, isInternal } = req.body;

  if (!text || text.trim() === '') {
    return next(new ErrorHandler('Comment text is required', 400));
  }

  const ticket = await Ticket.findById(id);
  if (!ticket) {
    return next(new ErrorHandler('Ticket not found', 404));
  }

  const userName = req.user ? req.user.name : 'Staff Member';
  const userRole = req.user?.role?.RoleName || (req.user?.role?.name) || 'Staff';

  const newComment = {
    user: req.user ? req.user._id : null,
    userName,
    userRole,
    text: text.trim(),
    isInternal: Boolean(isInternal),
    createdAt: new Date(),
  };

  ticket.comments.push(newComment);

  ticket.activityLog.push({
    action: isInternal ? 'Internal Note Added' : 'Comment Added',
    performedBy: req.user ? req.user._id : null,
    performedByName: userName,
    details: isInternal ? 'Added an internal note' : 'Posted a public reply',
    timestamp: new Date(),
  });

  await ticket.save();

  res.status(201).json({
    success: true,
    message: 'Comment added successfully',
    comment: ticket.comments[ticket.comments.length - 1],
    ticket,
  });
});

// @desc    Add subtask to ticket
// @route   POST /api/v1/tickets/:id/subtasks
// @access  Private
exports.addSubtask = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { title } = req.body;

  if (!title || title.trim() === '') {
    return next(new ErrorHandler('Subtask title is required', 400));
  }

  const ticket = await Ticket.findById(id);
  if (!ticket) {
    return next(new ErrorHandler('Ticket not found', 404));
  }

  ticket.subtasks.push({
    title: title.trim(),
    isCompleted: false,
  });

  ticket.activityLog.push({
    action: 'Subtask Added',
    performedBy: req.user ? req.user._id : null,
    performedByName: req.user ? req.user.name : 'System User',
    details: `Added subtask "${title.trim()}"`,
    timestamp: new Date(),
  });

  await ticket.save();

  res.status(201).json({
    success: true,
    message: 'Subtask added successfully',
    ticket,
  });
});

// @desc    Toggle subtask completion status
// @route   PATCH /api/v1/tickets/:id/subtasks/:subtaskId
// @access  Private
exports.toggleSubtask = catchAsyncErrors(async (req, res, next) => {
  const { id, subtaskId } = req.params;
  const { isCompleted } = req.body;

  const ticket = await Ticket.findById(id);
  if (!ticket) {
    return next(new ErrorHandler('Ticket not found', 404));
  }

  const subtask = ticket.subtasks.id(subtaskId);
  if (!subtask) {
    return next(new ErrorHandler('Subtask not found', 404));
  }

  subtask.isCompleted = isCompleted !== undefined ? isCompleted : !subtask.isCompleted;
  if (subtask.isCompleted) {
    subtask.completedAt = new Date();
    subtask.completedBy = req.user ? req.user._id : null;
  } else {
    subtask.completedAt = null;
    subtask.completedBy = null;
  }

  ticket.activityLog.push({
    action: 'Subtask Updated',
    performedBy: req.user ? req.user._id : null,
    performedByName: req.user ? req.user.name : 'System User',
    details: `Marked "${subtask.title}" as ${subtask.isCompleted ? 'completed' : 'incomplete'}`,
    timestamp: new Date(),
  });

  await ticket.save();

  res.status(200).json({
    success: true,
    message: `Subtask marked as ${subtask.isCompleted ? 'completed' : 'incomplete'}`,
    ticket,
  });
});

// @desc    Delete subtask from ticket
// @route   DELETE /api/v1/tickets/:id/subtasks/:subtaskId
// @access  Private
exports.deleteSubtask = catchAsyncErrors(async (req, res, next) => {
  const { id, subtaskId } = req.params;

  const ticket = await Ticket.findById(id);
  if (!ticket) {
    return next(new ErrorHandler('Ticket not found', 404));
  }

  ticket.subtasks = ticket.subtasks.filter((st) => st._id.toString() !== subtaskId);
  await ticket.save();

  res.status(200).json({
    success: true,
    message: 'Subtask removed',
    ticket,
  });
});

// @desc    Get aggregate ticket statistics and department analytics
// @route   GET /api/v1/tickets/stats
// @access  Private
exports.getTicketStats = catchAsyncErrors(async (req, res, next) => {
  const totalTickets = await Ticket.countDocuments();
  const openTickets = await Ticket.countDocuments({ status: 'Open' });
  const inProgressTickets = await Ticket.countDocuments({ status: 'In Progress' });
  const underReviewTickets = await Ticket.countDocuments({ status: 'Under Review' });
  const pendingTickets = await Ticket.countDocuments({ status: 'Pending' });
  const resolvedTickets = await Ticket.countDocuments({ status: 'Resolved' });
  const closedTickets = await Ticket.countDocuments({ status: 'Closed' });

  const urgentTickets = await Ticket.countDocuments({
    priority: 'Urgent',
    status: { $nin: ['Resolved', 'Closed'] },
  });
  const highPriorityTickets = await Ticket.countDocuments({
    priority: 'High',
    status: { $nin: ['Resolved', 'Closed'] },
  });

  const now = new Date();
  const overdueTickets = await Ticket.countDocuments({
    dueDate: { $lt: now },
    status: { $nin: ['Resolved', 'Closed'] },
  });

  // Department-wise distribution
  const departmentDistribution = await Ticket.aggregate([
    {
      $group: {
        _id: '$department',
        total: { $sum: 1 },
        open: { $sum: { $cond: [{ $in: ['$status', ['Open', 'In Progress', 'Under Review', 'Pending']] }, 1, 0] } },
        resolved: { $sum: { $cond: [{ $in: ['$status', ['Resolved', 'Closed']] }, 1, 0] } },
      },
    },
    { $sort: { total: -1 } },
  ]);

  // Priority-wise distribution
  const priorityDistribution = await Ticket.aggregate([
    {
      $group: {
        _id: '$priority',
        count: { $sum: 1 },
      },
    },
  ]);

  // User-specific stats if logged in
  let myAssignedCount = 0;
  let myCreatedCount = 0;
  if (req.user) {
    myAssignedCount = await Ticket.countDocuments({ assignedTo: req.user._id, status: { $nin: ['Resolved', 'Closed'] } });
    myCreatedCount = await Ticket.countDocuments({ createdBy: req.user._id });
  }

  res.status(200).json({
    success: true,
    stats: {
      total: totalTickets,
      open: openTickets,
      inProgress: inProgressTickets,
      underReview: underReviewTickets,
      pending: pendingTickets,
      resolved: resolvedTickets,
      closed: closedTickets,
      active: openTickets + inProgressTickets + underReviewTickets + pendingTickets,
      urgent: urgentTickets,
      highPriority: highPriorityTickets,
      overdue: overdueTickets,
      resolutionRate:
        totalTickets > 0 ? Math.round(((resolvedTickets + closedTickets) / totalTickets) * 100) : 0,
      myAssigned: myAssignedCount,
      myCreated: myCreatedCount,
      departmentDistribution,
      priorityDistribution,
    },
  });
});

// @desc    Delete ticket
// @route   DELETE /api/v1/tickets/:id
// @access  Private
exports.deleteTicket = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const ticket = await Ticket.findById(id);
  if (!ticket) {
    return next(new ErrorHandler('Ticket not found', 404));
  }

  await ticket.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Ticket deleted successfully',
  });
});
