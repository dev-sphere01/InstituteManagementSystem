const Task = require('../models/task');
const TaskHistory = require('../models/taskHistory');
const EscalationRule = require('../models/escalationRule');
const { logAction } = require('../utils/auditLogger');

const calculateDueDateFromNow = (dueInDays) => {
  const days = Number.isFinite(dueInDays) ? dueInDays : 0;
  if (days <= 0) return null;
  const due = new Date();
  due.setDate(due.getDate() + days);
  return due;
};

const buildEscalationUpdate = async (task, now) => {
  const updates = {};
  const nextLevel = (task.escalationLevel || 0) + 1;

  let rule = null;
  if (task.workflowTemplateId && task.stepKey) {
    rule = await EscalationRule.findOne({
      templateId: task.workflowTemplateId,
      stepKey: task.stepKey,
      level: nextLevel
    }).lean();
  }

  if (rule) {
    updates.assignedRole = rule.roleId;
    updates.escalationLevel = nextLevel;
    const nextDue = calculateDueDateFromNow(rule.dueInDays);
    if (nextDue) updates.dueDate = nextDue;
    updates['escalation.escalatedAt'] = now;
    updates.status = 'escalated';
    return updates;
  }

  if (task.escalation && task.escalation.enabled && task.escalation.escalateToRole) {
    updates.assignedRole = task.escalation.escalateToRole;
    updates.escalationLevel = nextLevel;
    updates['escalation.escalatedAt'] = now;
    updates.status = 'escalated';
    return updates;
  }

  return null;
};

const runEscalationCycle = async () => {
  const now = new Date();
  const processed = { overdue: 0, escalated: 0 };

  const toOverdue = await Task.updateMany(
    {
      status: { $in: ['pending', 'in_progress'] },
      dueDate: { $ne: null, $lt: now }
    },
    { $set: { status: 'overdue' } }
  );

  processed.overdue = toOverdue.modifiedCount || 0;

  const overdueTasks = await Task.find({
    status: 'overdue',
    dueDate: { $ne: null }
  });

  for (const task of overdueTasks) {
    const afterDays = Number(task.escalation?.afterDays || 0);
    const threshold = new Date(task.dueDate.getTime());
    threshold.setDate(threshold.getDate() + afterDays);

    if (afterDays > 0 && now < threshold) {
      continue;
    }

    const updates = await buildEscalationUpdate(task, now);
    if (!updates) continue;

    await Task.updateOne({ _id: task._id }, { $set: updates });

    await TaskHistory.create({
      taskId: task._id,
      fromStatus: 'overdue',
      toStatus: updates.status,
      note: 'Task escalated'
    });

    await logAction({
      action: 'update',
      entity: 'task',
      entityId: task._id.toString(),
      before: { status: 'overdue', assignedRole: task.assignedRole },
      after: { status: updates.status, assignedRole: updates.assignedRole, escalationLevel: updates.escalationLevel }
    });

    processed.escalated += 1;
  }

  return { processed };
};

const startEscalationScheduler = (intervalMinutes = 5) => {
  const intervalMs = Math.max(1, intervalMinutes) * 60 * 1000;
  setInterval(() => {
    runEscalationCycle().catch(() => null);
  }, intervalMs);
};

module.exports = {
  runEscalationCycle,
  startEscalationScheduler
};
