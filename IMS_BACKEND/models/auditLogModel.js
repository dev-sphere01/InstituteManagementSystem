const mongoose = require('mongoose');

/**
 * Audit Log Schema for storing user actions and data changes in MongoDB
 * Specialized schema for audit trail and compliance tracking
 */
const auditLogSchema = new mongoose.Schema({
  // Action information
  action: {
    type: String,
    required: true,
    enum: ['create', 'update', 'delete', 'login', 'logout', 'view', 'export', 'import'],
    index: true
  },
  entity: {
    type: String,
    required: true,
    index: true // e.g., 'user', 'auth', 'product', etc.
  },
  entityId: {
    type: String,
    index: true // ID of the affected entity
  },
  
  // User information
  user: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    email: {
      type: String,
      required: true
    },
    role: {
      type: String,
      required: true
    }
  },
  
  // Request information
  request: {
    method: String,
    path: String,
    ip: {
      type: String,
      index: true
    },
    userAgent: String
  },
  
  // Data changes (for update actions)
  changes: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Data before change (for delete actions)
  before: {
    type: mongoose.Schema.Types.Mixed
  },
  
  // Data after change (for create actions)
  after: {
    type: mongoose.Schema.Types.Mixed
  },
  
  // Additional context
  description: String,
  
  // Timestamp
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'auditLogs'
});

// Compound indexes for common queries
auditLogSchema.index({ 'user.id': 1, timestamp: -1 });
auditLogSchema.index({ entity: 1, action: 1, timestamp: -1 });
auditLogSchema.index({ entityId: 1, timestamp: -1 });
auditLogSchema.index({ 'request.ip': 1, timestamp: -1 });
auditLogSchema.index({ timestamp: -1 }); // Most recent first

// TTL index to automatically delete old audit logs (optional - 7 years for compliance)
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7 * 365 * 24 * 60 * 60 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
