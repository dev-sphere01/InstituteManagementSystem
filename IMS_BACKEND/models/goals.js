const mongoose = require('mongoose');
const goalsSchema = new mongoose.Schema({
  goalName: {
    type: String,
    required: true,
    unique: true,
    trim: true
  }

}, {
  timestamps: true
});
const Goals = mongoose.model('Goals', goalsSchema);
module.exports = Goals;