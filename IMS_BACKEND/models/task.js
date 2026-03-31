const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  workflowInstanceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkflowInstance',
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
  stepKey: {
    type: String,
    required: true,
    trim: true,
    index: true
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
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'blocked', 'done', 'overdue', 'canceled'],
    default: 'pending',
    index: true
  },
  assignedRole: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true,
    index: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  dueDate: {
    type: Date,
    index: true
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
    },
    escalatedAt: { type: Date }
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
  collection: 'tasks'
});

taskSchema.index({ workflowInstanceId: 1, stepKey: 1 }, { unique: true });
taskSchema.index({ status: 1, dueDate: 1 });
taskSchema.index({ assignedRole: 1, status: 1 });
taskSchema.index({ assignedTo: 1, status: 1 });

module.exports = mongoose.model('Task', taskSchema);
