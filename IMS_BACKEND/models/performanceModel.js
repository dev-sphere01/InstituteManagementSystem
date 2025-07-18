const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true,
  },
  grade: {
    type: String,
  },
  attendance: {
    type: Number,
  },
  participation: {
    type: Number,
  },
  discipline: {
    type: Number,
  },
});

module.exports = mongoose.model('Performance', performanceSchema);