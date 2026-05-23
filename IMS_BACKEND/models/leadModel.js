const mongoose = require('mongoose');

const STAGES = ['New', 'Contacted', 'Warm', 'Hot', 'Converted', 'Lost'];
const SOURCES = ['Website', 'Facebook', 'Google', 'Walk-in', 'Cold Call', 'Referral', 'CSV Import', 'Other'];

const interactionSchema = new mongoose.Schema({
  type:      { type: String, enum: ['Call', 'Note', 'Email', 'SMS', 'Stage Change', 'Assignment'], required: true },
  note:      { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  createdAt: { type: Date, default: Date.now }
}, { _id: true });

const leadSchema = new mongoose.Schema({
  // Core identity
  name:        { type: String, required: true, trim: true },
  email:       { type: String, trim: true, lowercase: true, default: null },
  phone:       { type: String, trim: true, default: null },
  altPhone:    { type: String, default: null },

  // Classification
  source:      { type: String, enum: SOURCES, default: 'Other' },
  stage:       { type: String, enum: STAGES, default: 'New', index: true },
  branch:      { type: String, default: null, index: true },
  course:      { type: String, default: null },
  campaign:    { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', default: null },

  // Assignment
  assignedTo:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  assignedAt:  { type: Date, default: null },

  // Escalation
  isEscalated:       { type: Boolean, default: false },
  escalatedAt:       { type: Date, default: null },
  lastInteractionAt: { type: Date, default: null },

  // Extra info
  city:        { type: String, default: null },
  notes:       { type: String, default: null },
  tags:        [{ type: String }],

  // Timeline
  interactions: [interactionSchema],

  // Dedup flags
  isDuplicate:  { type: Boolean, default: false },
  duplicateOf:  { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', default: null },

  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

// Compound index for deduplication
leadSchema.index({ email: 1 }, { sparse: true });
leadSchema.index({ phone: 1 }, { sparse: true });
leadSchema.index({ stage: 1, assignedTo: 1 });
leadSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Lead', leadSchema);
