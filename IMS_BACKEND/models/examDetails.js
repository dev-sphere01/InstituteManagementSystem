const mongoose = require('mongoose');

const examDetailSchema = new mongoose.Schema({
  generatedRegNo: {
    type: String,
    required: true,
    trim: true
  },
  course: {
    type: String,
    required: true,
    trim: true
  },
  session: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: String,
    required: true,
    trim: true
  },
  examFormReminderCall: {
    type: Number,
    default: 0
  },
  examFormRemarks: [{
    type: String,
    trim: true
  }],
  admitCardType: {
    type: String,
    required: true,
    trim: true
  },
  admitCardReminderCall: {
    type: Number,
    default: 0
  },
  admitCardRemarks: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

const ExamDetail = mongoose.model('ExamDetail', examDetailSchema);
module.exports = ExamDetail;
