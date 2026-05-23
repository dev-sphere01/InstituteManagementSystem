const mongoose = require('mongoose');

const workflowTaskSchema = new mongoose.Schema({
  taskType: {
    type: String,
    enum: ['fee_collection', 'documentation_verification', 'registration_creation', 'exam_form_filling', 'admit_card_distribution', 'certificate_distribution'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Done', 'Overdue'],
    default: 'Pending'
  },
  dueDate: {
    type: Date,
    required: true
  },
  responsiblePerson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  responsibleTeam: {
    type: String,
    default: 'Back Office'
  },
  completedAt: {
    type: Date
  },
  completedBy: {
    type: String
  },
  escalationRules: {
    gracePeriodDays: { type: Number, default: 2 },
    escalatedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isEscalated: { type: Boolean, default: false },
    escalationReason: { type: String }
  },
  remindersSent: [{
    type: { type: String, enum: ['staff', 'student'] },
    sentAt: { type: Date, default: Date.now },
    message: String,
    _id: false
  }]
});

const workflowChecklistSchema = new mongoose.Schema({
  admission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdmissionDetails',
    required: true,
    unique: true
  },
  tasks: [workflowTaskSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('WorkflowChecklist', workflowChecklistSchema);
