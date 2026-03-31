const WorkflowTemplate = require('../models/workflowTemplate');

exports.createTemplate = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      createdBy: req.user ? req.user._id : undefined
    };
    const template = await WorkflowTemplate.create(payload);
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
