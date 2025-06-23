const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
     centreCode: {
    type: String,
    required: true,
    trim: true
  },
  batchTiming: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  course: {
    type: String,
    required: true,
    trim: true
  },
  teacherName: {
    type: String,
    required: true,
    trim: true
  }
 
}, {
  timestamps: true
});

const Batch = mongoose.model('Batch', batchSchema);
module.exports = Batch;
