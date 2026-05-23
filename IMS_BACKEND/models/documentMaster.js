const mongoose = require('mongoose');

const documentMasterSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  label: { type: String, required: true },
  isRequired: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('DocumentMaster', documentMasterSchema);
