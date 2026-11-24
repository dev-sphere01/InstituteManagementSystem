// Import required modules (triggered restart to load updated config.env)
const app = require("./app"); // Import the Express app instance
const dotenv = require("dotenv"); // Import the dotenv module for environment variable management
const connectDatabase = require("./config/database"); // Import the database connection module
const logger = require("./utils/logger"); // Import the logger
const { startEscalationScheduler } = require("./services/escalationService");

// Load Environment Variables
/**
 * Load environment variables from the config.env file using dotenv.
 */
dotenv.config({ path: "config/config.env" });
logger.info("Environment variables loaded");

// Connect to Database
/**
 * Establish a connection to the database using the connectDatabase module.
 * In development mode, we'll continue even if the database connection fails
 */
// Set Port Number
/**
 * Set the port number for the server to listen on.
 * Use the PORT environment variable or default to 5000.
 */
const port = process.env.PORT || 5000;

// Start Server only after database connection is established
/**
 * Wait for database connection before starting the server.
 * This ensures the application is fully ready before accepting requests.
 */
let server;

async function startServer() {
  try {
    logger.info("Waiting for database connection...");

    // Wait for database connection with timeout
    const connection = await connectDatabase();

    if (connection) {
      logger.info("Database connected successfully");

      // Start the server only after successful database connection
      server = app.listen(port, () => {
        logger.info(`Server is running on http://localhost:${port}`);
        logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
        logger.info("Application is ready to accept requests");
      });

      const escalationInterval = Number(process.env.ESCALATION_INTERVAL_MINUTES || 5);
      startEscalationScheduler(escalationInterval);

      // Start overdue check scheduler (Section D)
      const { runOverdueJob } = require("./services/overdueJob");
      const overdueIntervalHours = Number(process.env.OVERDUE_INTERVAL_HOURS || 24);
      setInterval(() => {
        runOverdueJob().catch(err => logger.error(`Overdue job error: ${err.message}`));
      }, overdueIntervalHours * 60 * 60 * 1000);

      // Run once on initial startup after brief delay
      setTimeout(() => {
        runOverdueJob().catch(err => logger.error(`Initial overdue job error: ${err.message}`));
      }, 10000);
    } else {
      logger.error("Failed to connect to database - server will not start");
      process.exit(1);
    }
  } catch (error) {
    logger.error(`Database connection error: ${error.message}`);
    logger.error("Server startup failed due to database connection issues");
    process.exit(1);
  }
}

// Start the server
startServer();

// Handle Uncaught Exceptions
/**
 * Catch and handle uncaught exceptions to prevent server crashes.
 * Log the error message and shut down the server.
 */
process.on("uncaughtException", (err) => {
    logger.error(`Uncaught Exception: ${err.message}`);
    logger.error(err.stack);
    logger.error("Shutting down the server due to Uncaught Exception");

    if (server) {
        server.close(() => {
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
});

// Handle Unhandled Promise Rejections
/**
 * Catch and handle unhandled promise rejections.
 * Since we now properly handle database connections at startup,
 * most unhandled rejections should be treated as critical errors.
 */
process.on("unhandledRejection", (err) => {
    logger.error(`Unhandled Promise Rejection: ${err.message}`);
    logger.error(err.stack);

    // Log the error but don't crash immediately - give time for cleanup
    logger.error("Shutting down the server due to Unhandled Promise Rejection");

    if (server) {
        server.close(() => {
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
});

// Handle SIGTERM signal (for graceful shutdown)
process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down gracefully');
    server.close(() => {
        logger.info('Process terminated');
    });
});
