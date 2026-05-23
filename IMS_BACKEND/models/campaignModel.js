const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  channel:     { type: String, enum: ['Meta', 'Google', 'Offline', 'Email', 'SMS', 'Other'], required: true },
  branch:      { type: String, default: null },
  budget:      { type: Number, default: 0 },       // total spend
  startDate:   { type: Date, default: null },
  endDate:     { type: Date, default: null },
  isActive:    { type: Boolean, default: true },
  description: { type: String, default: null },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

module.exports = mongoose.model('Campaign', campaignSchema);
