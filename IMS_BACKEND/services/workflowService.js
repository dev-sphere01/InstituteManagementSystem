const WorkflowTemplate = require('../models/workflowTemplate');
const WorkflowInstance = require('../models/workflowInstance');
const Task = require('../models/task');

const buildStepDependencies = (steps, autoSequence) => {
  if (!autoSequence) return steps;

  const sorted = [...steps].sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
  const keyOrder = sorted.map((s) => s.key);
  const keyToPrev = new Map();
  for (let i = 1; i < keyOrder.length; i += 1) {
    keyToPrev.set(keyOrder[i], keyOrder[i - 1]);
  }

  return steps.map((step) => {
    if (step.dependsOn && step.dependsOn.length > 0) return step;
    const prevKey = keyToPrev.get(step.key);
    if (!prevKey) return step;
    return {
      ...step,
      dependsOn: [prevKey]
    };
  });
};

const calculateDueDate = (dueInDays) => {
  const days = Number.isFinite(dueInDays) ? dueInDays : 0;
  if (days <= 0) return null;
  const due = new Date();
  due.setDate(due.getDate() + days);
  return due;
};

const createWorkflowInstance = async ({
  templateId,
  targetType,
  targetId,
  createdBy,
  metadata = {},
  allowDuplicate = false
}) => {
  const template = await WorkflowTemplate.findById(templateId).lean();
  if (!template || !template.isActive) {
    const err = new Error('Workflow template not found or inactive');
    err.statusCode = 404;
    throw err;
  }

  if (!allowDuplicate) {
    const existing = await WorkflowInstance.findOne({
      templateId,
      targetType,
      targetId,
      status: 'active'
    }).lean();
    if (existing) {
      return { instance: existing, tasksCreated: 0, skipped: true };
    }
  }

  const instance = await WorkflowInstance.create({
    templateId,
    targetType,
    targetId,
    createdBy,
    metadata
  });

  const effectiveSteps = buildStepDependencies(template.steps || [], template.autoSequence);
  const tasksPayload = effectiveSteps.map((step) => {
    const dueDate = calculateDueDate(step.dueInDays);
    const isBlocked = step.dependsOn && step.dependsOn.length > 0;
    return {
      workflowInstanceId: instance._id,
      targetType,
      targetId,
      stepKey: step.key,
      title: step.title,
      description: step.description,
      sequence: step.sequence || 0,
      dependsOn: step.dependsOn || [],
      status: isBlocked ? 'blocked' : 'pending',
      assignedRole: step.assignedRole,
      dueDate,
      priority: step.priority || 'normal',
      escalation: step.escalation || { enabled: false, afterDays: 0 }
    };
  });

  if (tasksPayload.length > 0) {
    await Task.insertMany(tasksPayload, { ordered: false });
  }

  return { instance, tasksCreated: tasksPayload.length, skipped: false };
};

const unblockDependentTasks = async (workflowInstanceId, completedStepKey) => {
  const dependents = await Task.find({
    workflowInstanceId,
    dependsOn: completedStepKey,
    status: 'blocked'
  }).lean();

  if (dependents.length === 0) return 0;

  const completedKeys = await Task.find({
    workflowInstanceId,
    status: 'done'
  }).select('stepKey').lean();
  const completedSet = new Set(completedKeys.map((t) => t.stepKey));
  completedSet.add(completedStepKey);

  const toUnblockIds = [];
  for (const task of dependents) {
    const deps = task.dependsOn || [];
    const allDone = deps.every((k) => completedSet.has(k));
    if (allDone) {
      toUnblockIds.push(task._id);
    }
  }

  if (toUnblockIds.length === 0) return 0;

  const result = await Task.updateMany(
    { _id: { $in: toUnblockIds } },
    { $set: { status: 'pending' } }
  );

  return result.modifiedCount || 0;
};

module.exports = {
  createWorkflowInstance,
  unblockDependentTasks
};
