const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const { logUpdate } = require("../utils/auditLogger");

const {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
  getRoleStats,
  searchRoles
} = require("../services/roleService");

/**
 * Create a new role
 * @route POST /api/v1/roles
 * @access Admin
 */
exports.createRole = catchAsyncErrors(async (req, res, next) => {
  const role = await createRole(req.body, req.user.id);

  // Audit log for role creation
  logUpdate({
    userId: req.user.id,
    userEmail: req.user.email,
    action: "create-role",
    entity: "role",
    entityId: role._id,
    oldValues: {},
    newValues: {
      RoleName: role.RoleName,
      description: role.description,
      level: role.level,
      permissions: role.permissions
    },
    ipAddress: req.auditContext?.ipAddress,
    userAgent: req.auditContext?.userAgent,
  });

  res.status(201).json({
    success: true,
    message: "Role created successfully",
    role
  });
});

/**
 * Get all roles with pagination and filtering
 * @route GET /api/v1/roles
 * @access Admin
 */
exports.getAllRoles = catchAsyncErrors(async (req, res, next) => {
  const result = await getAllRoles(req.query);

  // Simple log for viewing roles
  const logger = require("../utils/logger");
  logger.info(`Admin ${req.user.email} (${req.user.id}) viewed roles list - Page: ${result.pagination.page}, Total: ${result.pagination.total}`);

  res.status(200).json({
    success: true,
    data: result.roles,
    pagination: result.pagination,
    filters: result.filters,
    sort: result.sort
  });
});

/**
 * Get role by ID
 * @route GET /api/v1/roles/:id
 * @access Admin
 */
exports.getRoleById = catchAsyncErrors(async (req, res, next) => {
  const role = await getRoleById(req.params.id);

  res.status(200).json({
    success: true,
    role
  });
});

/**
 * Update role
 * @route PUT /api/v1/roles/:id
 * @access Admin
 */
exports.updateRole = catchAsyncErrors(async (req, res, next) => {
  const roleId = req.params.id;

  // Get old role data for audit log
  const oldRole = await getRoleById(roleId);

  const role = await updateRole(roleId, req.body, req.user.id);

  // Audit log for role update
  logUpdate({
    userId: req.user.id,
    userEmail: req.user.email,
    action: "update-role",
    entity: "role",
    entityId: roleId,
    oldValues: {
      RoleName: oldRole.RoleName,
      description: oldRole.description,
      level: oldRole.level,
      permissions: oldRole.permissions,
      isActive: oldRole.isActive
    },
    newValues: {
      RoleName: role.RoleName,
      description: role.description,
      level: role.level,
      permissions: role.permissions,
      isActive: role.isActive
    },
    ipAddress: req.auditContext?.ipAddress,
    userAgent: req.auditContext?.userAgent,
  });

  res.status(200).json({
    success: true,
    message: "Role updated successfully",
    role
  });
});

/**
 * Delete role
 * @route DELETE /api/v1/roles/:id
 * @access Admin
 */
exports.deleteRole = catchAsyncErrors(async (req, res, next) => {
  const roleId = req.params.id;

  // Get role data for audit log before deletion
  const roleToDelete = await getRoleById(roleId);

  const result = await deleteRole(roleId);

  // Audit log for role deletion
  logUpdate({
    userId: req.user.id,
    userEmail: req.user.email,
    action: "delete-role",
    entity: "role",
    entityId: roleId,
    oldValues: {
      RoleName: roleToDelete.RoleName,
      description: roleToDelete.description,
      level: roleToDelete.level,
      permissions: roleToDelete.permissions
    },
    newValues: {},
    ipAddress: req.auditContext?.ipAddress,
    userAgent: req.auditContext?.userAgent,
  });

  res.status(200).json({
    success: true,
    message: result.message,
    deletedRole: result.deletedRole
  });
});

/**
 * Get role statistics
 * @route GET /api/v1/roles/stats
 * @access Admin
 */
exports.getRoleStats = catchAsyncErrors(async (req, res, next) => {
  const stats = await getRoleStats();

  res.status(200).json({
    success: true,
    stats
  });
});

/**
 * Search roles with advanced filtering
 * @route GET /api/v1/roles/search
 * @access Admin
 */
exports.searchRoles = catchAsyncErrors(async (req, res, next) => {
  const result = await searchRoles(req.query);

  // Log search activity
  const logger = require("../utils/logger");
  logger.info(`Admin ${req.user.email} searched roles with criteria: ${JSON.stringify(req.query)}`);

  res.status(200).json({
    success: true,
    data: result.roles,
    pagination: result.pagination,
    searchCriteria: result.searchCriteria
  });
});