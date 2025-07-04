const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema({
  overallPerformance: {
    type: String,
    required: true,
    enum: ['A+', 'A', 'B+', 'B', 'C', 'D', 'F'], // adjust as needed
    trim: true
  },
  classAttendance: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  classParticipation: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  classDiscipline: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

const Performance = mongoose.model('Performance', performanceSchema);
module.exports = Performance;
