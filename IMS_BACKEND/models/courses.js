const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  Code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  centreCode: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  duration: {
    type: String,
    trim: true
  },
  fee: {
    type: Number,
    required: true,
    min: 0
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
