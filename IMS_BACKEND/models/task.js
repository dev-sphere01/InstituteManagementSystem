// models/task.js
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdmissionDetails',
    required: true,
    index: true
  },
  taskName: {
    type: String,
    required: true,
    enum: ['Fee Collection', 'Document Verification', 'Registration', 'Exam Form', 'Admit Card', 'Certificate']
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed'],
    default: 'pending'
  },
  assignedRole: {
    type: String, // String matching RoleName OR static roles e.g. 'Accountant', 'Verifier', 'Admin'
    required: true
  },
  isCurrent: {
    type: Boolean,
    default: false,
    index: true
  },
  dueDate: {
    type: Date
  },
  remarks: [{
    text: String,
    by: String, // user name
    date: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true,
  collection: 'tasks'
});

module.exports = mongoose.model('Task', taskSchema);
