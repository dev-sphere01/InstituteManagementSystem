const mongoose = require('mongoose');

const workflowInstanceSchema = new mongoose.Schema({
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkflowTemplate',
    required: true,
    index: true
  },
  targetType: {
    type: String,
    required: true,
    enum: ['admission', 'student', 'custom'],
    index: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'canceled'],
    default: 'active',
    index: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  completedAt: {
    type: Date
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  collection: 'workflowInstances'
});

workflowInstanceSchema.index({ targetType: 1, targetId: 1 });
workflowInstanceSchema.index({ templateId: 1, status: 1 });

module.exports = mongoose.model('WorkflowInstance', workflowInstanceSchema);
