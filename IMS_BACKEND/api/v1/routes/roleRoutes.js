const express = require('express');
const router = express.Router();

// Import middleware
const { isAuthenticatedUser } = require('../../../middlewares/auth');
const { authorizePermissions } = require('../../../middlewares/permission');
const auditMiddleware = require('../../../middlewares/auditMiddleware');

// Import role controller
const {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
  getRoleStats,
  searchRoles
} = require('../../../controllers/roleController');

// Apply authentication and audit middleware to all routes
router.use(isAuthenticatedUser);
router.use(auditMiddleware);

/**
 * @route   GET /api/v1/roles/stats
 * @desc    Get role statistics
 * @access  Admin (role.read permission)
 */
router.get('/stats',
  authorizePermissions('role.read'),
  getRoleStats
);

/**
 * @route   GET /api/v1/roles/search
 * @desc    Search roles with advanced filtering
 * @access  Admin (role.read permission)
 */
router.get('/search',
  authorizePermissions('role.read'),
  searchRoles
);

/**
 * @route   GET /api/v1/roles
 * @desc    Get all roles with pagination and filtering
 * @access  Admin (role.read permission)
 */
router.get('/',
  authorizePermissions('role.read'),
  getAllRoles
);

/**
 * @route   POST /api/v1/roles
 * @desc    Create a new role
 * @access  Admin (role.create permission)
 */
router.post('/',
  authorizePermissions('role.create'),
  createRole
);

/**
 * @route   GET /api/v1/roles/:id
 * @desc    Get role by ID
 * @access  Admin (role.read permission)
 */
router.get('/:id',
  authorizePermissions('role.read'),
  getRoleById
);

/**
 * @route   PUT /api/v1/roles/:id
 * @desc    Update role
 * @access  Admin (role.update permission)
 */
router.put('/:id',
  authorizePermissions('role.update'),
  updateRole
);

/**
 * @route   DELETE /api/v1/roles/:id
 * @desc    Delete role
 * @access  Admin (role.delete permission)
 */
router.delete('/:id',
  authorizePermissions('role.delete'),
  deleteRole
);

module.exports = router;