const Task = require('../models/task');

const TASK_ORDER = [
  'Fee Collection',
  'Document Verification',
  'Registration',
  'Exam Form',
  'Admit Card',
  'Certificate'
];

// Helper to advance sequence
exports.advanceTaskSequence = async (task) => {
  if (task.status !== 'completed') return;
  const currentIndex = TASK_ORDER.indexOf(task.taskName);
  
  task.isCurrent = false;

  if (currentIndex !== -1 && currentIndex < TASK_ORDER.length - 1) {
    const nextTaskName = TASK_ORDER[currentIndex + 1];
    await Task.updateOne(
      { studentId: task.studentId, taskName: nextTaskName },
      { $set: { isCurrent: true, status: 'pending' } }
    );
  }
  
  await task.save();
};

// Helper to check if user is admin
const getUserWithRole = async (user) => {
  if (!user) return null;
  const populatedUser = await require('../models/userModel').findById(user._id).populate('role');
  return populatedUser;
};

const isAdminUser = async (user) => {
  if (!user || !user.role || !user.role.RoleName) return false;
  if (user.role.RoleName.toLowerCase().includes('admin')) {
    return true;
  }
  return false;
};

// Filter tasks by taskName (tab) and assignedRole (or all if admin)
exports.getTasksByTab = async (req, res) => {
  try {
    const { taskName, filterStatus, course, batch } = req.query; // 'Fee Collection', 'Document Verification', etc.
    let filter = {};
    
    if (filterStatus === 'completed') {
      filter.status = 'completed';
    } else if (filterStatus === 'not_completed') {
      filter.status = { $ne: 'completed' };
    } else if (filterStatus === 'all') {
      // No additional status filter, just get all tasks for the taskName regardless of status or isCurrent
    } else {
      filter.$or = [
        { isCurrent: true },
        // Backwards compatibility for legacy tasks
        { isCurrent: { $exists: false }, taskName: 'Fee Collection', status: { $ne: 'completed' } }
      ];
    }
    
    if (taskName) {
      filter.taskName = taskName;
    }

    const fullUser = await getUserWithRole(req.user);
    const isAdmin = await isAdminUser(fullUser);
    if (!isAdmin) {
       const userRoleName = fullUser?.role?.RoleName || '';
       filter.assignedRole = { $regex: new RegExp(`^${userRoleName}$`, 'i') };
    }

    let studentMatch = {};
    if (course) studentMatch.courseApplied = course;
    if (batch) studentMatch.month = batch;

    let tasks = await Task.find(filter)
      .populate({
        path: 'studentId',
        select: 'fullName courseApplied generatedRegNo formNo month emailAddress contactNumber',
        match: Object.keys(studentMatch).length > 0 ? studentMatch : undefined
      })
      .sort({ createdAt: -1 });
      
    if (Object.keys(studentMatch).length > 0) {
      tasks = tasks.filter(t => t.studentId != null);
    }

    return res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update task status and remarks
exports.updateTask = async (req, res) => {
  try {
    const { status, remarkText } = req.body;
    const task = await Task.findById(req.params.id).populate('studentId');
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const fullUser = await getUserWithRole(req.user);
    const isAdmin = await isAdminUser(fullUser);
    const userRoleName = fullUser?.role?.RoleName || '';
    
    // Authorization check
    if (!isAdmin && task.assignedRole.toLowerCase() !== userRoleName.toLowerCase()) {
      return res.status(403).json({ success: false, message: 'Not authorized for this task' });
    }

    if (status && ['pending', 'in_progress', 'completed'].includes(status)) {
       task.status = status;
    }

    if (remarkText && remarkText.trim() !== '') {
      task.remarks.push({
        text: remarkText,
        by: req.user?.name || 'Unknown'
      });
    }

    await task.save();
    
    if (task.status === 'completed') {
       await exports.advanceTaskSequence(task);
    }
    
    return res.status(200).json({ success: true, data: task });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Mark as Done (shortcut for updateStatus to completed)
exports.markAsDone = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const fullUser = await getUserWithRole(req.user);
    const isAdmin = await isAdminUser(fullUser);
    const userRoleName = fullUser?.role?.RoleName || '';
    
    if (!isAdmin && task.assignedRole.toLowerCase() !== userRoleName.toLowerCase()) {
      return res.status(403).json({ success: false, message: 'Not authorized for this task' });
    }

    task.status = 'completed';
    await task.save();
    
    await exports.advanceTaskSequence(task);

    return res.status(200).json({ success: true, data: task });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get all tasks for a particular student
exports.getTasksByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const tasks = await Task.find({ studentId }).sort({ createdAt: 1 });
    return res.status(200).json({ success: true, data: tasks });
  } catch (error) {
     return res.status(500).json({ success: false, message: error.message });
  }
};
