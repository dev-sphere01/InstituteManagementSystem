const express = require("express");
const router = express.Router();

// Import middleware
const { isAuthenticatedUser } = require("../../../middlewares/auth");
const { authorizePermissions } = require("../../../middlewares/permission");
const auditMiddleware = require("../../../middlewares/auditMiddleware");

// Import controllers
const { getLogs } = require("../../../controllers/logController");

// Apply authentication and audit middleware to all routes
router.use(isAuthenticatedUser);
router.use(auditMiddleware);

/**
 * @route   GET /api/v1/logs
 * @desc    Get consolidated logs from all log files with filtering and pagination
 * @access  Admin (log.read permission)
 */
router.get("/",
  authorizePermissions('log.read'),
  getLogs
);

module.exports = router;
