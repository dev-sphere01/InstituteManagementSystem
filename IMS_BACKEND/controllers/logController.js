/**
 * Log Controller
 *
 * Handles all log-related operations including:
 * - Retrieving consolidated logs with filtering and pagination from MongoDB
 * - Querying both general logs and audit logs
 * - Providing filter options based on database data
 */

const Log = require('../models/logModel');
const AuditLog = require('../models/auditLogModel');

/**
 * Get consolidated logs from database with filtering and pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      level,
      search,
      startDate,
      endDate,
      user,
      ip,
      logType,
      action,
      entity
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query filters
    let query = {};
    let auditQuery = {};

    // Filter by log level
    if (level && level !== 'all') {
      query.level = level;
    }

    // Filter by search term (search in message)
    if (search) {
      query.$text = { $search: search };
    }

    // Filter by date range
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.timestamp.$lte = end;
      }
    }

    // Filter by user
    if (user) {
      query.$or = [
        { 'user.email': { $regex: user, $options: 'i' } },
        { 'user.id': user }
      ];
    }

    // Filter by IP address
    if (ip) {
      query['request.ip'] = { $regex: ip, $options: 'i' };
    }

    // Copy query for audit logs and add audit-specific filters
    auditQuery = { ...query };

    // Filter by action (for audit logs)
    if (action) {
      auditQuery.action = action;
    }

    // Filter by entity (for audit logs)
    if (entity) {
      auditQuery.entity = entity;
    }

    // Determine which collections to query based on logType
    let allLogEntries = [];

    if (!logType || logType === 'all' || logType === 'logs') {
      // Query general logs
      const logs = await Log.find(query)
        .sort({ timestamp: -1 })
        .lean();

      // Add logType field for consistency
      const logsWithType = logs.map(log => ({
        ...log,
        logType: 'logs',
        ipAddress: log.request?.ip // For backward compatibility
      }));

      allLogEntries = [...allLogEntries, ...logsWithType];
    }

    if (!logType || logType === 'all' || logType === 'audit') {
      // Query audit logs
      const auditLogs = await AuditLog.find(auditQuery)
        .sort({ timestamp: -1 })
        .lean();

      // Add logType field and format for consistency
      const auditLogsWithType = auditLogs.map(log => ({
        ...log,
        logType: 'audit',
        level: 'audit', // Audit logs are always audit level
        message: log.description || `${log.entity} ${log.action}`,
        ipAddress: log.request?.ip // For backward compatibility
      }));

      allLogEntries = [...allLogEntries, ...auditLogsWithType];
    }

    // Sort all entries by timestamp (newest first)
    allLogEntries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Apply pagination
    const totalEntries = allLogEntries.length;
    const totalPages = Math.ceil(totalEntries / limitNum);
    const paginatedEntries = allLogEntries.slice(skip, skip + limitNum);

    // Get unique values for filters from database
    const [logLevels, auditActions, auditEntities, userEmails, ipAddresses] = await Promise.all([
      Log.distinct('level'),
      AuditLog.distinct('action'),
      AuditLog.distinct('entity'),
      Log.distinct('user.email').then(emails => emails.filter(Boolean)),
      Log.distinct('request.ip').then(ips => ips.filter(Boolean))
    ]);

    res.status(200).json({
      success: true,
      totalEntries,
      filteredEntries: totalEntries,
      page: pageNum,
      totalPages,
      entries: paginatedEntries,
      filters: {
        logTypes: ['logs', 'audit'],
        levels: [...new Set([...logLevels, 'audit'])],
        users: userEmails,
        ipAddresses: ipAddresses,
        actions: auditActions,
        entities: auditEntities
      }
    });
  } catch (error) {
    console.error('Error fetching consolidated logs:', error);

    // Check if it's a database connection error
    if (error.message && (error.message.includes('ETIMEDOUT') || error.message.includes('MongoNetworkError'))) {
      return res.status(503).json({
        success: false,
        message: 'Database connection unavailable - logs cannot be retrieved at this time',
        error: 'Database connection timeout'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error fetching consolidated logs',
      error: error.message
    });
  }
};

module.exports = exports;
