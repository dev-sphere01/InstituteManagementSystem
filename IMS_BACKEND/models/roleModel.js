const mongoose = require('mongoose');

/**
 * Role Schema
 * Simplified version with timestamps and virtuals
 */
const roleSchema = new mongoose.Schema({
  // Role name (unique, lowercase)
  RoleName: {
    type: String,
    required: true,
    unique: true
  },

  // Role description
  description: {
    type: String,
    required: true
  },

  // Permissions assigned to this role (stored as permission names)
  permissions: [{
    type: String,
    required: true
  }],

  // Role level/hierarchy (higher number = more privileged)
  level: {
    type: Number,
    required: true,
    default: 10
  },

  // Whether this role is active
  isActive: {
    type: Boolean,
    default: true
  },

  // Whether this is a system role
  // System roles have special protections:
  // - Cannot be deleted
  // - Cannot have RoleName changed
  // - Cannot have level changed
  // - Cannot have isSystem changed from true to false
  // - Can have description, permissions, and isActive updated
  isSystem: {
    type: Boolean,
    default: false
  },

  // Created by user
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Last updated by user
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  collection: 'roles',
  timestamps: true
});

// Indexes for better query performance
roleSchema.index({ level: 1 });
roleSchema.index({ isActive: 1 });
roleSchema.index({ isSystem: 1 });
// Note: RoleName index is automatically created by unique: true

module.exports = mongoose.model('Role', roleSchema);
