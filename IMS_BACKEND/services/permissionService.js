const Permission = require('../models/permissionModel');
const Role = require('../models/roleModel');
const ErrorHandler = require('../utils/ErrorHandler');

/**
 * Service layer for permission-related operations
 * Separates business logic from controllers for better maintainability and testability
 */

/**
 * Get all permissions with filtering and pagination
 * @param {Object} queryParams - Query parameters for filtering and pagination
 * @returns {Promise<Object>} - Paginated permissions with metadata
 */
exports.getPermissions = async (queryParams) => {
  const {
    page = 1,
    limit = 50,
    module,
    action,
    category,
    search,
    isActive
  } = queryParams;

  // Build query
  const query = {};
  
  if (module) query.module = module;
  if (action) query.action = action;
  if (category) query.category = category;
  if (isActive !== undefined) query.isActive = isActive === 'true';
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { displayName: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  // Execute query with pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const [permissions, total] = await Promise.all([
    Permission.find(query)
      .sort({ module: 1, action: 1 })
      .skip(skip)
      .limit(limitNum),
    Permission.countDocuments(query)
  ]);

  // Get filter options
  const [modules, actions, categories] = await Promise.all([
    Permission.distinct('module'),
    Permission.distinct('action'),
    Permission.distinct('category')
  ]);

  return {
    permissions,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    },
    filters: {
      modules,
      actions,
      categories
    }
  };
};

/**
 * Get single permission by ID
 * @param {string} permissionId - Permission ID
 * @returns {Promise<Object>} - Permission object
 */
exports.getPermissionById = async (permissionId) => {
  const permission = await Permission.findById(permissionId);

  if (!permission) {
    throw new ErrorHandler('Permission not found', 404);
  }

  return permission;
};

/**
 * Create new permission
 * @param {Object} permissionData - Permission data
 * @returns {Promise<Object>} - Created permission object
 */
exports.createPermission = async (permissionData) => {
  const {
    name,
    displayName,
    module,
    action,
    description,
    resource,
    isCritical,
    category
  } = permissionData;

  // Check if permission already exists
  const existingPermission = await Permission.findOne({ name });
  if (existingPermission) {
    throw new ErrorHandler('Permission with this name already exists', 400);
  }

  const permission = await Permission.create({
    name,
    displayName,
    module,
    action,
    description,
    resource,
    isCritical,
    category
  });

  return permission;
};

/**
 * Update permission
 * @param {string} permissionId - Permission ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} - Updated permission object with old data
 */
exports.updatePermission = async (permissionId, updateData) => {
  const permission = await Permission.findById(permissionId);

  if (!permission) {
    throw new ErrorHandler('Permission not found', 404);
  }

  const oldData = permission.toObject();
  
  // Update permission
  Object.assign(permission, updateData);
  await permission.save();

  return {
    permission,
    oldData
  };
};

/**
 * Delete permission
 * @param {string} permissionId - Permission ID
 * @returns {Promise<Object>} - Deleted permission data and roles using it
 */
exports.deletePermission = async (permissionId) => {
  const permission = await Permission.findById(permissionId);

  if (!permission) {
    throw new ErrorHandler('Permission not found', 404);
  }

  // Check if permission is being used by any roles
  const rolesUsingPermission = await Role.find({
    permissions: permission._id,
    isActive: true
  });

  if (rolesUsingPermission.length > 0) {
    throw new ErrorHandler('Cannot delete permission that is assigned to active roles', 400, {
      rolesUsing: rolesUsingPermission.map(role => ({
        id: role._id,
        name: role.name,
        displayName: role.displayName
      }))
    });
  }

  const oldData = permission.toObject();
  await permission.deleteOne();

  return {
    deletedPermission: oldData,
    rolesUsing: []
  };
};

/**
 * Get permissions grouped by module
 * @returns {Promise<Object>} - Permissions grouped by module
 */
exports.getPermissionsByModule = async () => {
  const permissions = await Permission.find({ isActive: true })
    .sort({ module: 1, action: 1 });

  // Group permissions by module
  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {});

  return groupedPermissions;
};

/**
 * Validate permission data
 * @param {Object} permissionData - Permission data to validate
 * @returns {Object} - Validation result
 */
exports.validatePermissionData = (permissionData) => {
  const errors = [];

  if (!permissionData.name) {
    errors.push({ field: 'name', message: 'Permission name is required' });
  } else if (!/^[a-z]+\.[a-z]+$/.test(permissionData.name)) {
    errors.push({ field: 'name', message: 'Permission name must be in format: module.action' });
  }

  if (!permissionData.displayName) {
    errors.push({ field: 'displayName', message: 'Display name is required' });
  }

  if (!permissionData.module) {
    errors.push({ field: 'module', message: 'Module is required' });
  }

  if (!permissionData.action) {
    errors.push({ field: 'action', message: 'Action is required' });
  }

  if (!permissionData.description) {
    errors.push({ field: 'description', message: 'Description is required' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Check if permission exists by name
 * @param {string} permissionName - Permission name
 * @returns {Promise<boolean>} - Whether permission exists
 */
exports.permissionExists = async (permissionName) => {
  const permission = await Permission.findOne({ name: permissionName });
  return !!permission;
};

/**
 * Get permissions by module and action
 * @param {string} module - Module name
 * @param {string} action - Action name
 * @returns {Promise<Array>} - Array of matching permissions
 */
exports.getPermissionsByModuleAndAction = async (module, action) => {
  const query = {};
  if (module) query.module = module;
  if (action) query.action = action;
  
  return await Permission.find(query).sort({ name: 1 });
};

/**
 * Bulk create permissions
 * @param {Array} permissionsData - Array of permission data objects
 * @returns {Promise<Object>} - Result of bulk creation
 */
exports.bulkCreatePermissions = async (permissionsData) => {
  const results = {
    created: [],
    skipped: [],
    errors: []
  };

  for (const permissionData of permissionsData) {
    try {
      const validation = this.validatePermissionData(permissionData);
      if (!validation.isValid) {
        results.errors.push({
          permission: permissionData.name,
          errors: validation.errors
        });
        continue;
      }

      const existingPermission = await Permission.findOne({ name: permissionData.name });
      if (existingPermission) {
        results.skipped.push(permissionData.name);
        continue;
      }

      const permission = await Permission.create(permissionData);
      results.created.push(permission);
    } catch (error) {
      results.errors.push({
        permission: permissionData.name,
        error: error.message
      });
    }
  }

  return results;
};
