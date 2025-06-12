/**
 * Audit Logger
 *
 * Specialized logger for tracking user actions and data changes.
 * Captures precise, valuable data while avoiding unnecessary details.
 * Designed for scalability and efficient analysis.
 * Now stores audit logs directly in MongoDB.
 */

const AuditLog = require('../models/auditLogModel');

/**
 * Sanitize object to remove sensitive data
 * @param {Object} obj - Object to sanitize
 * @returns {Object} Sanitized object
 */
function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;

  const sanitized = { ...obj };

  // Remove sensitive fields
  const sensitiveFields = [
    'password',
    'passwordConfirm',
    'resetPasswordToken',
    'resetPasswordExpire',
    'token'
  ];

  sensitiveFields.forEach(field => {
    if (field in sanitized) delete sanitized[field];
  });

  return sanitized;
}

/**
 * Log a data change with structured details
 * @param {Object} options - Logging options
 * @param {string} options.action - Action performed (create, update, delete)
 * @param {string} options.entity - Entity type (user, product, etc.)
 * @param {string} options.entityId - ID of the affected entity
 * @param {Object} options.before - State before change (for updates/deletes)
 * @param {Object} options.after - State after change (for creates/updates)
 * @param {Object} options.user - User who performed the action
 * @param {Object} options.request - Request details
 */
async function logAction(options) {
  try {
    // Check if mongoose connection is ready
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      // Connection not ready, log to console instead
      console.log(`[AUDIT] ${options.entity} ${options.action} by ${options.user?.email || 'unknown'}`);
      return;
    }

    const {
      action,
      entity,
      entityId,
      before,
      after,
      user = {},
      request = {}
    } = options;

    // Extract only changed fields for updates
    let changes = {};
    if (action === 'update' && before && after) {
      Object.keys(after).forEach(key => {
        // Skip sensitive fields and unchanged values
        if (before[key] !== after[key] &&
            !['password', 'passwordConfirm', 'resetPasswordToken', 'resetPasswordExpire'].includes(key)) {
          changes[key] = {
            from: before[key],
            to: after[key]
          };
        }
      });
    }

    // Build audit log entry for database
    const auditLogData = {
      action,
      entity,
      entityId,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      request: {
        method: request.method,
        path: request.path,
        ip: request.ip,
        userAgent: request.userAgent
      }
    };

    // Add data based on action type
    if (action === 'create' && after) {
      auditLogData.after = sanitizeObject(after);
    } else if (action === 'update' && Object.keys(changes).length > 0) {
      auditLogData.changes = changes;
    } else if (action === 'delete' && before) {
      auditLogData.before = sanitizeObject(before);
    }

    // Save to database
    const auditLog = new AuditLog(auditLogData);
    await auditLog.save();
  } catch (error) {
    // Handle different types of errors gracefully
    if (error.message && (
      error.message.includes('ETIMEDOUT') ||
      error.message.includes('MongoNetworkError') ||
      error.message.includes('before initial connection') ||
      error.message.includes('bufferCommands')
    )) {
      console.log(`[AUDIT] ${options.entity} ${options.action} by ${options.user?.email || 'unknown'}`);
    } else {
      console.warn('Audit logging error:', error.message);
    }
    // Don't let audit logging errors crash the application
  }
}

/**
 * Log an authentication event
 * @param {Object} options - Logging options
 * @param {string} options.userId - User ID (if available)
 * @param {string} options.userEmail - User email
 * @param {string} options.action - Auth action (login, logout, etc.)
 * @param {boolean} options.success - Whether auth was successful
 * @param {string} options.ipAddress - IP address
 * @param {string} options.userAgent - User agent
 * @param {string} options.reason - Failure reason (if applicable)
 */
async function logAuth(options) {
  try {
    // Check if mongoose connection is ready
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      // Connection not ready, log to console instead
      console.log(`[AUDIT] Auth ${options.action} by ${options.userEmail || 'unknown'}`);
      return;
    }

    const {
      userId,
      userEmail,
      action,
      success = true,
      ipAddress,
      userAgent,
      reason
    } = options;

    // Build audit log entry for database
    const auditLogData = {
      action,
      entity: 'auth',
      entityId: userId,
      user: {
        id: userId,
        email: userEmail,
        role: 'user' // Default role, will be updated if known
      },
      request: {
        ip: ipAddress,
        userAgent
      },
      description: `Auth ${action} ${success ? 'successful' : 'failed'}${reason ? `: ${reason}` : ''}`
    };

    // Save to database
    const auditLog = new AuditLog(auditLogData);
    await auditLog.save();
  } catch (error) {
    // Handle different types of errors gracefully
    if (error.message && (
      error.message.includes('ETIMEDOUT') ||
      error.message.includes('MongoNetworkError') ||
      error.message.includes('before initial connection') ||
      error.message.includes('bufferCommands')
    )) {
      console.log(`[AUDIT] Auth ${options.action} by ${options.userEmail || 'unknown'}`);
    } else {
      console.warn('Audit logging error:', error.message);
    }
    // Don't let audit logging errors crash the application
  }
}

/**
 * Log a create action
 * @param {Object} options - Logging options
 */
async function logCreate(options) {
  return logAction({
    action: 'create',
    entity: options.entity,
    entityId: options.entityId,
    after: options.newValues,
    user: {
      id: options.userId,
      email: options.userEmail,
      role: options.userRole
    },
    request: {
      ip: options.ipAddress,
      userAgent: options.userAgent
    }
  });
}

/**
 * Log an update action
 * @param {Object} options - Logging options
 */
async function logUpdate(options) {
  return logAction({
    action: 'update',
    entity: options.entity,
    entityId: options.entityId,
    before: options.oldValues,
    after: options.newValues,
    user: {
      id: options.userId,
      email: options.userEmail,
      role: options.userRole
    },
    request: {
      ip: options.ipAddress,
      userAgent: options.userAgent
    }
  });
}

/**
 * Log a delete action
 * @param {Object} options - Logging options
 */
async function logDelete(options) {
  return logAction({
    action: 'delete',
    entity: options.entity,
    entityId: options.entityId,
    before: options.oldValues,
    user: {
      id: options.userId,
      email: options.userEmail,
      role: options.userRole
    },
    request: {
      ip: options.ipAddress,
      userAgent: options.userAgent
    }
  });
}

module.exports = {
  logAction,
  logAuth,
  logCreate,
  logUpdate,
  logDelete
};
