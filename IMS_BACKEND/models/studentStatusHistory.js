const mongoose = require('mongoose');

const studentStatusHistorySchema = new mongoose.Schema({
  admissionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdmissionDetails',
    required: true,
    index: true
  },
  fromStatus: {
    type: String
  },
  toStatus: {
    type: String,
    required: true
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reason: {
    type: String,
    trim: true,
    maxlength: 500
  },
  source: {
    type: String,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'studentStatusHistory'
});

studentStatusHistorySchema.index({ admissionId: 1, timestamp: -1 });

module.exports = mongoose.model('StudentStatusHistory', studentStatusHistorySchema);
