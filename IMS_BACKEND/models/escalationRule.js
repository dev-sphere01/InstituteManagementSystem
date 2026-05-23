const mongoose = require('mongoose');

const escalationRuleSchema = new mongoose.Schema({
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkflowTemplate',
    required: true,
    index: true
  },
  stepKey: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  level: {
    type: Number,
    required: true,
    min: 1
  },
  roleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true
  },
  dueInDays: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true,
  collection: 'escalationRules'
});

escalationRuleSchema.index({ templateId: 1, stepKey: 1, level: 1 }, { unique: true });

module.exports = mongoose.model('EscalationRule', escalationRuleSchema);
