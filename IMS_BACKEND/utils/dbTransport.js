const Transport = require('winston-transport');
const Log = require('../models/logModel');

/**
 * Custom Winston Transport for MongoDB
 * Stores logs directly in MongoDB instead of files
 */
class MongoDBTransport extends Transport {
  constructor(opts = {}) {
    super(opts);
    this.name = 'mongodb';
    this.level = opts.level || 'info';
  }

  /**
   * Core logging method that Winston will call
   * @param {Object} info - Log information object
   * @param {Function} callback - Callback function
   */
  log(info, callback) {
    setImmediate(() => {
      this.emit('logged', info);
    });

    // Extract and structure the log data
    const logData = this.formatLogData(info);

    // Save to MongoDB
    this.saveToDatabase(logData)
      .then(() => {
        if (callback) callback(null, true);
      })
      .catch((error) => {
        // Don't let logging errors crash the application
        console.error('MongoDB logging error:', error.message);
        if (callback) callback(error);
      });
  }

  /**
   * Format the Winston log info into our database schema
   * @param {Object} info - Winston log info object
   * @returns {Object} Formatted log data for database
   */
  formatLogData(info) {
    const logData = {
      level: info.level,
      message: info.message,
      timestamp: new Date(info.timestamp || Date.now()),
      service: info.service || 'user-auth-api'
    };

    // Add user information if available
    if (info.user) {
      logData.user = {
        id: info.user.id,
        email: info.user.email,
        role: info.user.role
      };
    }

    // Add request information if available
    if (info.request) {
      logData.request = {
        method: info.request.method,
        path: info.request.path,
        ip: info.request.ip,
        userAgent: info.request.userAgent
      };
    }

    // Add error information if this is an error log
    if (info.level === 'error' && info.error) {
      logData.error = {
        name: info.error.name,
        message: info.error.message,
        stack: info.error.stack,
        statusCode: info.error.statusCode
      };
    }

    // Add any additional metadata
    const metadata = { ...info };
    // Remove fields we've already processed
    delete metadata.level;
    delete metadata.message;
    delete metadata.timestamp;
    delete metadata.service;
    delete metadata.user;
    delete metadata.request;
    delete metadata.error;
    delete metadata[Symbol.for('level')];
    delete metadata[Symbol.for('message')];
    delete metadata[Symbol.for('splat')];

    // Only add metadata if there's something left
    if (Object.keys(metadata).length > 0) {
      logData.metadata = metadata;
    }

    return logData;
  }

  /**
   * Save log data to MongoDB
   * @param {Object} logData - Formatted log data
   * @returns {Promise} Promise that resolves when saved
   */
  async saveToDatabase(logData) {
    try {
      // Check if mongoose connection is ready
      const mongoose = require('mongoose');
      if (mongoose.connection.readyState !== 1) {
        // Connection not ready, log to console instead
        console.log(`[${logData.level.toUpperCase()}] ${logData.message}`);
        return;
      }

      const log = new Log(logData);
      await log.save();
    } catch (error) {
      // Handle different types of errors gracefully
      if (error.name === 'ValidationError') {
        // Try to save with minimal data for validation errors
        try {
          const minimalLog = {
            level: logData.level || 'info',
            message: logData.message || 'Log message unavailable',
            timestamp: logData.timestamp || new Date(),
            service: logData.service || 'user-auth-api'
          };
          const log = new Log(minimalLog);
          await log.save();
        } catch (minimalError) {
          // If even minimal save fails, just log to console
          console.warn('Failed to save minimal log to database:', minimalError.message);
        }
      } else if (error.message && (
        error.message.includes('ETIMEDOUT') ||
        error.message.includes('MongoNetworkError') ||
        error.message.includes('before initial connection') ||
        error.message.includes('bufferCommands')
      )) {
        // For connection errors, just log to console and continue
        console.log(`[${logData.level.toUpperCase()}] ${logData.message}`);
      } else {
        // For other errors, log but don't crash
        console.warn('Database logging error:', error.message);
      }
    }
  }
}

module.exports = MongoDBTransport;
