const mongoose = require('mongoose');
const boardSchema = new mongoose.Schema({
  boardName: {
    type: String,
    required: true,
    unique: true,
    trim: true
  }

}, {
  timestamps: true
});

const Board = mongoose.model('Board', boardSchema);
module.exports = Board;