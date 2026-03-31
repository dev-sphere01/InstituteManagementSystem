const CallingFormTemplate = require('../models/CallingFormTemplate');

const getUserId = (req) => req.user?._id;

exports.getTemplates = async (req, res) => {
  try {
    const { isActive } = req.query;

    const filter = {};
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const templates = await CallingFormTemplate.find(filter)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ isDefault: -1, createdAt: -1 });

    res.json(templates);
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
};

exports.getTemplateById = async (req, res) => {
  try {
    const template = await CallingFormTemplate.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json(template);
  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({ error: 'Failed to fetch template' });
  }
};

exports.getDefaultTemplate = async (req, res) => {
  try {
    const template = await CallingFormTemplate.findOne({ isDefault: true, isActive: true })
      .populate('createdBy', 'name email');

    if (!template) {
      return res.status(404).json({ error: 'No default template found' });
    }

    res.json(template);
  } catch (error) {
    console.error('Get default template error:', error);
    res.status(500).json({ error: 'Failed to fetch default template' });
  }
};

exports.createTemplate = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const existingTemplate = await CallingFormTemplate.findOne();
    if (existingTemplate) {
      return res.status(400).json({
        error: 'A calling form template already exists. Please edit the existing template instead.'
      });
    }

    const templateData = {
      ...req.body,
      createdBy: userId,
      isDefault: true,
      isActive: true
    };

    if (!templateData.fields || templateData.fields.length === 0) {
      return res.status(400).json({ error: 'At least one field is required' });
    }

    const template = new CallingFormTemplate(templateData);
    await template.save();

    await template.populate('createdBy', 'name email');

    res.status(201).json({
      message: 'Template created successfully',
      template
    });
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
};

exports.updateTemplate = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const template = await CallingFormTemplate.findById(req.params.id);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    Object.assign(template, req.body);
    template.updatedBy = userId;

    await template.save();

    await template.populate([
      { path: 'createdBy', select: 'name email' },
      { path: 'updatedBy', select: 'name email' }
    ]);

    res.json({
      message: 'Template updated successfully',
      template
    });
  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
};

exports.deleteTemplate = async (req, res) => {
  try {
    return res.status(400).json({
      error: 'Cannot delete the calling form template. You can only edit it.'
    });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
};

exports.setDefaultTemplate = async (req, res) => {
  try {
    return res.status(400).json({
      error: 'Not applicable. Only one template exists and it is always the default.'
    });
  } catch (error) {
    console.error('Set default template error:', error);
    res.status(500).json({ error: 'Failed to set default template' });
  }
};

module.exports = exports;
