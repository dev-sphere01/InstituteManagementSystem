const Task = require('../models/task');
const TaskHistory = require('../models/taskHistory');
const { unblockDependentTasks } = require('../services/workflowService');

exports.getTasks = async (req, res) => {
  try {
    const {
      status,
      assignedTo,
      assignedRole,
      targetType,
      targetId,
      workflowInstanceId,
      dueBefore,
      dueAfter
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (assignedRole) filter.assignedRole = assignedRole;
    if (targetType) filter.targetType = targetType;
    if (targetId) filter.targetId = targetId;
    if (workflowInstanceId) filter.workflowInstanceId = workflowInstanceId;

    if (dueBefore || dueAfter) {
      filter.dueDate = {};
      if (dueBefore) filter.dueDate.$lte = new Date(dueBefore);
      if (dueAfter) filter.dueDate.$gte = new Date(dueAfter);
    }

    const tasks = await Task.find(filter)
      .populate('assignedRole', 'RoleName')
      .populate('assignedTo', 'name email')
      .sort({ dueDate: 1, createdAt: -1 });
    return res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedRole', 'RoleName')
      .populate('assignedTo', 'name email');
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    return res.status(200).json({ success: true, data: task });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    if (!status) return res.status(400).json({ success: false, message: 'status is required' });

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const previousStatus = task.status;
    task.status = status;
    if (status === 'done') {
      task.completedAt = new Date();
    }
    await task.save();

    await TaskHistory.create({
      taskId: task._id,
      fromStatus: previousStatus,
      toStatus: status,
      changedBy: req.user ? req.user._id : undefined,
      note
    });

    if (status === 'done') {
      await unblockDependentTasks(task.workflowInstanceId, task.stepKey);
    }

    return res.status(200).json({ success: true, data: task });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.assignTask = async (req, res) => {
  try {
    const { assignedTo, assignedRole } = req.body;
    const update = {};
    if (assignedTo) update.assignedTo = assignedTo;
    if (assignedRole) update.assignedRole = assignedRole;
    if (Object.keys(update).length === 0) {
      return res.status(400).json({ success: false, message: 'assignedTo or assignedRole is required' });
    }

    const task = await Task.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    return res.status(200).json({ success: true, data: task });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTaskHistory = async (req, res) => {
  try {
    const history = await TaskHistory.find({ taskId: req.params.id })
      .populate('changedBy', 'name email')
      .sort({ timestamp: -1 });
    return res.status(200).json({ success: true, data: history });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
