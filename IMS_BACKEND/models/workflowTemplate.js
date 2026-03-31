const mongoose = require('mongoose');

const workflowStepSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  sequence: {
    type: Number,
    default: 0
  },
  dependsOn: [{
    type: String,
    trim: true
  }],
  assignedRole: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true
  },
  dueInDays: {
    type: Number,
    default: 0,
    min: 0
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'critical'],
    default: 'normal'
  },
  escalation: {
    enabled: { type: Boolean, default: false },
    afterDays: { type: Number, default: 0, min: 0 },
    escalateToRole: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role'
    }
  }
}, { _id: false });

const workflowTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  triggerStatus: {
    type: String,
    trim: true
  },
  autoSequence: {
    type: Boolean,
    default: false
  },
  steps: [workflowStepSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  collection: 'workflowTemplates'
});

workflowTemplateSchema.index({ isActive: 1 });
workflowTemplateSchema.index({ triggerStatus: 1 });
workflowTemplateSchema.index({ name: 1 });

module.exports = mongoose.model('WorkflowTemplate', workflowTemplateSchema);
