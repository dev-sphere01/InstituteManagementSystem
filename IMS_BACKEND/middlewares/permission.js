const User = require('../models/userModel');
const logger = require('../utils/logger');
const { logAuth } = require('../utils/auditLogger');

/**
 * Permission-based middleware for route protection
 * Checks if user has required permissions to access specific routes
 */

/**
 * Check if user has specific permission
 * @param {string} permissionName - Permission name (e.g., 'user.create')
 * @returns {Function} Express middleware function
 */
const requirePermission = (permissionName) => {
  return async (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Check if user account is active
      if (!req.user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Account is not active'
        });
      }

      // Check if user account is locked
      if (req.user.isLocked && req.user.isLocked()) {
        return res.status(423).json({
          success: false,
          message: 'Account is temporarily locked due to failed login attempts'
        });
      }

      // Check if user has the required permission
      const hasPermission = await req.user.hasPermission(permissionName);
      
      if (!hasPermission) {
        // Log unauthorized access attempt
        await logAuth({
          userId: req.user._id,
          userEmail: req.user.email,
          action: 'unauthorized_access',
          success: false,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          reason: `Missing permission: ${permissionName}`
        });

        logger.warn('Unauthorized access attempt', {
          user: { id: req.user._id, email: req.user.email },
          permission: permissionName,
          request: { method: req.method, path: req.path, ip: req.ip }
        });

        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
          required: permissionName
        });
      }

      // Log successful permission check
      logger.info('Permission granted', {
        user: { id: req.user._id, email: req.user.email },
        permission: permissionName,
        request: { method: req.method, path: req.path }
      });

      next();
    } catch (error) {
      logger.error('Permission check error', {
        error: { name: error.name, message: error.message },
        user: req.user ? { id: req.user._id, email: req.user.email } : null,
        permission: permissionName
      });

      return res.status(500).json({
        success: false,
        message: 'Permission check failed'
      });
    }
  };
};

/**
 * Check if user has permission for module and action
 * @param {string} module - Module name (e.g., 'user')
 * @param {string} action - Action name (e.g., 'create')
 * @returns {Function} Express middleware function
 */
const requireModulePermission = (module, action) => {
  const permissionName = `${module}.${action}`;
  return requirePermission(permissionName);
};

/**
 * Check if user has any of the specified permissions (OR logic)
 * @param {string[]} permissions - Array of permission names
 * @returns {Function} Express middleware function
 */
const requireAnyPermission = (permissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      if (!req.user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Account is not active'
        });
      }

      // Check if user has any of the required permissions
      let hasAnyPermission = false;
      for (const permission of permissions) {
        if (await req.user.hasPermission(permission)) {
          hasAnyPermission = true;
          break;
        }
      }

      if (!hasAnyPermission) {
        await logAuth({
          userId: req.user._id,
          userEmail: req.user.email,
          action: 'unauthorized_access',
          success: false,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          reason: `Missing any of permissions: ${permissions.join(', ')}`
        });

        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
          required: permissions
        });
      }

      next();
    } catch (error) {
      logger.error('Permission check error', {
        error: { name: error.name, message: error.message },
        permissions
      });

      return res.status(500).json({
        success: false,
        message: 'Permission check failed'
      });
    }
  };
};

/**
 * Check if user has all specified permissions (AND logic)
 * @param {string[]} permissions - Array of permission names
 * @returns {Function} Express middleware function
 */
const requireAllPermissions = (permissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      if (!req.user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Account is not active'
        });
      }

      // Check if user has all required permissions
      const missingPermissions = [];
      for (const permission of permissions) {
        if (!(await req.user.hasPermission(permission))) {
          missingPermissions.push(permission);
        }
      }

      if (missingPermissions.length > 0) {
        await logAuth({
          userId: req.user._id,
          userEmail: req.user.email,
          action: 'unauthorized_access',
          success: false,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          reason: `Missing permissions: ${missingPermissions.join(', ')}`
        });

        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
          missing: missingPermissions
        });
      }

      next();
    } catch (error) {
      logger.error('Permission check error', {
        error: { name: error.name, message: error.message },
        permissions
      });

      return res.status(500).json({
        success: false,
        message: 'Permission check failed'
      });
    }
  };
};

/**
 * Check if user has minimum role level
 * @param {number} minLevel - Minimum role level required
 * @returns {Function} Express middleware function
 */
const requireRoleLevel = (minLevel) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Populate role if not already populated
      if (!req.user.populated('role')) {
        await req.user.populate('role');
      }

      if (!req.user.role || req.user.role.level < minLevel) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient role level',
          required: minLevel,
          current: req.user.role ? req.user.role.level : 0
        });
      }

      next();
    } catch (error) {
      logger.error('Role level check error', {
        error: { name: error.name, message: error.message },
        minLevel
      });

      return res.status(500).json({
        success: false,
        message: 'Role level check failed'
      });
    }
  };
};

/**
 * Alias for requirePermission for better readability
 * @param {string} permissionName - Permission name
 * @returns {Function} Express middleware function
 */
const authorizePermissions = (permissionName) => {
  return requirePermission(permissionName);
};

/**
 * Check if user has admin role (level 1) - convenience function
 * @returns {Function} Express middleware function
 */
const requireAdmin = () => {
  return requireRoleLevel(1);
};

/**
 * Check if user has role management permissions
 * @returns {Function} Express middleware function
 */
const requireRoleManagement = () => {
  return requireAnyPermission(['role.create', 'role.read', 'role.update', 'role.delete']);
};

module.exports = {
  requirePermission,
  requireModulePermission,
  requireAnyPermission,
  requireAllPermissions,
  requireRoleLevel,
  authorizePermissions, // Alias for requirePermission
  requireAdmin,
  requireRoleManagement
};
