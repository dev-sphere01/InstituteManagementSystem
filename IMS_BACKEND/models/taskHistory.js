const mongoose = require('mongoose');

const taskHistorySchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true,
    index: true
  },
  fromStatus: {
    type: String,
    trim: true
  },
  toStatus: {
    type: String,
    trim: true
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  note: {
    type: String,
    trim: true,
    maxlength: 500
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'taskHistory'
});

taskHistorySchema.index({ taskId: 1, timestamp: -1 });

module.exports = mongoose.model('TaskHistory', taskHistorySchema);
