const mongoose = require('mongoose');
const universitySchema = new mongoose.Schema({
  universityName: {
    type: String,
    required: true,
    unique: true,
    trim: true
  }
}, {
  timestamps: true
});
const University = mongoose.model('University', universitySchema);
module.exports = University;