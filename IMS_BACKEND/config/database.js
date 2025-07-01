const mongoose = require("mongoose");
const logger = require("../utils/logger");

/**
 * Connect to MongoDB database
 * @returns {Promise} Mongoose connection promise
 */
const connectDatabase = async (retryCount = 0, maxRetries = 3) => {
  try {
    // Set mongoose options with better timeout and retry handling
    const options = {
      serverSelectionTimeoutMS: 30000, // 30 seconds for server selection
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      connectTimeoutMS: 30000, // 30 seconds for initial connection
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 5, // Maintain a minimum of 5 socket connections
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      retryWrites: true, // Enable retryable writes
      retryReads: true, // Enable retryable reads
    };

    logger.info(`Attempting to connect to MongoDB... (Attempt ${retryCount + 1}/${maxRetries + 1})`);

    // Connect to MongoDB
    const DB = process.env.NODE_ENV === "production" ? process.env.DB_URI : process.env.DB_URI_LOCAL;
    const connection = await mongoose.connect(DB, options);

    // Wait for connection to be fully ready
    await new Promise((resolve, reject) => {
      if (mongoose.connection.readyState === 1) {
        resolve();
      } else {
        mongoose.connection.once('connected', resolve);
        mongoose.connection.once('error', reject);
        // Timeout after 10 seconds
        setTimeout(() => reject(new Error('Connection ready timeout')), 10000);
      }
    });

    // Log successful connection
    logger.info(`MongoDB connected: ${connection.connection.host}`);

    // Add connection event listeners with graceful error handling
    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err.message}`);
      // Don't crash the application, just log the error
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected - application will continue running');
      // Attempt to reconnect after a delay
      setTimeout(() => {
        logger.info('Attempting to reconnect to MongoDB...');
        mongoose.connect(process.env.DB_URI, options).catch(err => {
          logger.error(`MongoDB reconnection failed: ${err.message}`);
        });
      }, 5000);
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected successfully');
    });

    // Handle process termination gracefully
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed due to app termination');
      } catch (err) {
        logger.error(`Error closing MongoDB connection: ${err.message}`);
      }
      process.exit(0);
    });

    return connection;
  } catch (error) {
    logger.error(`MongoDB connection error (Attempt ${retryCount + 1}): ${error.message}`);

    // Retry connection if we haven't exceeded max retries
    if (retryCount < maxRetries) {
      const delay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Exponential backoff, max 10s
      logger.info(`Retrying connection in ${delay}ms...`);

      await new Promise(resolve => setTimeout(resolve, delay));
      return connectDatabase(retryCount + 1, maxRetries);
    }

    // If all retries failed, throw the error
    logger.error(`Failed to connect to MongoDB after ${maxRetries + 1} attempts`);
    throw error;
  }
};

module.exports = connectDatabase;