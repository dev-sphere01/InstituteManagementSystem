const mongoose = require('mongoose');

/**
 * Log Schema for storing application logs in MongoDB
 * Replaces file-based logging with database storage
 */
const logSchema = new mongoose.Schema({
  // Basic log information
  level: {
    type: String,
    required: true,
    enum: ['error', 'warn', 'info', 'event', 'audit'],
    index: true
  },
  message: {
    type: String,
    required: true,
    index: 'text' // Enable text search
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  
  // Service information
  service: {
    type: String,
    default: 'user-auth-api'
  },
  
  // User information (if available)
  user: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    email: String,
    role: String
  },
  
  // Request information
  request: {
    method: String,
    path: String,
    ip: String,
    userAgent: String
  },
  
  // Error information (for error logs)
  error: {
    name: String,
    message: String,
    stack: String,
    statusCode: Number
  },
  
  // Additional metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  collection: 'logs'
});

// Indexes for better query performance
logSchema.index({ level: 1, timestamp: -1 });
logSchema.index({ 'user.id': 1, timestamp: -1 });
logSchema.index({ 'request.ip': 1, timestamp: -1 });
logSchema.index({ timestamp: -1 }); // Most recent first

// TTL index to automatically delete old logs (optional - 90 days)
logSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.model('Log', logSchema);
