const winston = require('winston');
const MongoDBTransport = require('./dbTransport');

// Define log levels with custom priorities
const customLevels = {
  levels: {
    error: 0,    // Critical errors
    warn: 1,     // Warnings
    info: 2,     // General information
    event: 3,    // Important system events
    audit: 4     // User actions (for auditing)
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    event: 'blue',
    audit: 'cyan'
  }
};

// Add colors to Winston
winston.addColors(customLevels.colors);

// Create MongoDB transport for database logging
const mongoTransport = new MongoDBTransport({
  level: 'audit' // Capture all levels
});

// Create logger instance with custom levels
const logger = winston.createLogger({
  levels: customLevels.levels,
  level: 'audit', // Capture all levels in development and production
  defaultMeta: { service: 'user-auth-api' },
  transports: [
    // Console transport for development with colorized output
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ level, message, timestamp, ...meta }) => {
          // Format user information if present
          let userInfo = '';
          if (meta.user) {
            userInfo = ` [User: ${meta.user.email || meta.user.id || 'Unknown'}]`;
          }
          return `${timestamp} [${level}]${userInfo} ${message}`;
        })
      )
    }),
    // MongoDB transport for database logging
    mongoTransport
  ],
  // Exception handling - also store in database
  exceptionHandlers: [
    new MongoDBTransport({
      level: 'error'
    })
  ],
  exitOnError: false
});

// Create a stream object for Morgan HTTP request logging
logger.stream = {
  write: (message) => {
    // Only log HTTP requests at info level
    logger.info(message.trim());
  },
};

module.exports = logger;
