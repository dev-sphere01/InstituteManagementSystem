const mongoose = require('mongoose');

const employeeTypeSchema = new mongoose.Schema({
  EmpTypeID: {
    type: Number,
    required: true,
    unique: true
  },
  EmpTypeName: {
    type: String,
    required: true,
    trim: true
  },
  Description: {
    type: String,
    default: '',
    trim: true
  },
  EmployeeCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('EmployeeType', employeeTypeSchema);
