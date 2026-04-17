const WorkflowTemplate = require('../models/workflowTemplate');
const EscalationRule = require('../models/escalationRule');

const syncEscalationRules = async (template) => {
  if (!template || !template._id) return;
  const rules = [];
  (template.steps || []).forEach((step) => {
    if (Array.isArray(step.escalationLevels) && step.escalationLevels.length > 0) {
      step.escalationLevels.forEach((level) => {
        if (!level || !level.role) return;
        rules.push({
          templateId: template._id,
          stepKey: step.key,
          level: level.level,
          roleId: level.role,
          dueInDays: Number(level.dueInDays || 0)
        });
      });
    } else if (step.escalation && step.escalation.enabled && step.escalation.escalateToRole) {
      rules.push({
        templateId: template._id,
        stepKey: step.key,
        level: 1,
        roleId: step.escalation.escalateToRole,
        dueInDays: Number(step.escalation.afterDays || 0)
      });
    }
  });

  await EscalationRule.deleteMany({ templateId: template._id });
  if (rules.length > 0) {
    await EscalationRule.insertMany(rules, { ordered: false });
  }
};

exports.createTemplate = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      createdBy: req.user ? req.user._id : undefined
    };
    const template = await WorkflowTemplate.create(payload);
    await syncEscalationRules(template);
    res.status(201).json({ success: true, data: template });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTemplates = async (req, res) => {
  try {
    const { isActive } = req.query;
    const filter = {};
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    const templates = await WorkflowTemplate.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: templates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTemplateById = async (req, res) => {
  try {
    const template = await WorkflowTemplate.findById(req.params.id);
    if (!template) return res.status(404).json({ success: false, message: 'Template not found' });
    res.status(200).json({ success: true, data: template });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateTemplate = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      updatedBy: req.user ? req.user._id : undefined
    };
    const template = await WorkflowTemplate.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true, runValidators: true }
    );
    if (!template) return res.status(404).json({ success: false, message: 'Template not found' });
    await syncEscalationRules(template);
    res.status(200).json({ success: true, data: template });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.setTemplateActive = async (req, res) => {
  try {
    const { isActive } = req.body;
    const template = await WorkflowTemplate.findByIdAndUpdate(
      req.params.id,
      { isActive: isActive !== undefined ? !!isActive : true, updatedBy: req.user ? req.user._id : undefined },
      { new: true }
    );
    if (!template) return res.status(404).json({ success: false, message: 'Template not found' });
    res.status(200).json({ success: true, data: template });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
