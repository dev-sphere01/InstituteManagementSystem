const WorkflowInstance = require('../models/workflowInstance');
const Task = require('../models/task');
const { createWorkflowInstance } = require('../services/workflowService');

exports.createWorkflowForTarget = async (req, res) => {
  try {
    const { templateId, targetType, targetId, metadata, allowDuplicate } = req.body;
    if (!templateId || !targetType || !targetId) {
      return res.status(400).json({ success: false, message: 'templateId, targetType and targetId are required' });
    }

    const result = await createWorkflowInstance({
      templateId,
      targetType,
      targetId,
      createdBy: req.user ? req.user._id : undefined,
      metadata,
      allowDuplicate: !!allowDuplicate
    });

    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ success: false, message: error.message });
  }
};

exports.getWorkflowById = async (req, res) => {
  try {
    const workflow = await WorkflowInstance.findById(req.params.id)
      .populate('templateId', 'name triggerStatus isActive autoSequence')
      .lean();
    if (!workflow) return res.status(404).json({ success: false, message: 'Workflow not found' });
    const tasks = await Task.find({ workflowInstanceId: workflow._id }).sort({ sequence: 1, createdAt: 1 });
    return res.status(200).json({ success: true, data: { workflow, tasks } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getWorkflowsByTarget = async (req, res) => {
  try {
    const { targetType, targetId } = req.query;
    if (!targetType || !targetId) {
      return res.status(400).json({ success: false, message: 'targetType and targetId are required' });
    }
    const workflows = await WorkflowInstance.find({ targetType, targetId })
      .populate('templateId', 'name triggerStatus isActive autoSequence')
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: workflows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
