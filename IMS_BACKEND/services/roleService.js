const Role = require('../models/roleModel');
const { applyQueryFeatures } = require('../utils/queryHelpers');

// Define valid permissions (no need for Permission model)
const VALID_PERMISSIONS = [
  // User module
  'user.create', 'user.read', 'user.update', 'user.delete', 'user.export', 'user.import',
  // Role module
  'role.create', 'role.read', 'role.update', 'role.delete', 'role.export',
  // Permission module
  'permission.create', 'permission.read', 'permission.update', 'permission.delete',
  // Admin module
  'admin.create', 'admin.read', 'admin.update', 'admin.delete',
  // Dashboard module
  'dashboard.read',
  // Settings module
  'settings.read', 'settings.update',
  // Reports module
  'reports.create', 'reports.read', 'reports.export',
  // Logs module
  'log.read', 'log.delete', 'log.export',
  // Profile module
  'profile.read', 'profile.update'
];

/**
 * Create a new role
 * @param {Object} roleData - Role data
 * @param {String} userId - ID of user creating the role
 * @returns {Promise<Object>} - Created role object
 */
exports.createRole = async (roleData, userId) => {
  const { RoleName, description, permissions, level, isActive, isSystem } = roleData;

  // Check if role name already exists
  const existingRole = await Role.findOne({
    RoleName: { $regex: new RegExp(`^${RoleName}$`, 'i') }
  });

  if (existingRole) {
    throw new Error('Role name already exists');
  }

  // Validate permissions if provided
  let validPermissions = [];
  if (permissions && permissions.length > 0) {
    // Validate that all permissions are in the valid list
    const invalidPermissions = permissions.filter(p => !VALID_PERMISSIONS.includes(p));

    if (invalidPermissions.length > 0) {
      throw new Error(`Invalid permissions: ${invalidPermissions.join(', ')}`);
    }

    validPermissions = permissions; // Store permission names directly
  }

  // Create role
  const role = new Role({
    RoleName,
    description,
    permissions: validPermissions,
    level: level || 1,
    isActive: isActive !== undefined ? isActive : true,
    isSystem: isSystem || false,
    createdBy: userId,
    updatedBy: userId
  });

  await role.save();

  // Populate user references for response
  await role.populate('createdBy', 'name email');
  await role.populate('updatedBy', 'name email');

  return role;
};

/**
 * Get all roles with pagination and filtering
 * @param {Object} queryParams - Query parameters
 * @returns {Promise<Object>} - Roles with pagination metadata
 */
exports.getAllRoles = async (queryParams = {}) => {
  const options = {
    populate: [
      {
        path: 'createdBy',
        select: 'name email'
      },
      {
        path: 'updatedBy',
        select: 'name email'
      }
    ],
    defaultSort: { level: 1, createdAt: -1 },
    allowedFilters: ['isActive', 'isSystem', 'level']
  };

  const result = await applyQueryFeatures(Role, queryParams, options);

  return {
    roles: result.data,
    pagination: result.pagination,
    filters: result.filters,
    sort: result.sort
  };
};

/**
 * Get role by ID
 * @param {String} roleId - Role ID
 * @returns {Promise<Object>} - Role object
 */
exports.getRoleById = async (roleId) => {
  const role = await Role.findById(roleId)
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');

  if (!role) {
    throw new Error('Role not found');
  }

  return role;
};

/**
 * Update role
 * @param {String} roleId - Role ID
 * @param {Object} updateData - Data to update
 * @param {String} userId - ID of user updating the role
 * @returns {Promise<Object>} - Updated role object
 */
exports.updateRole = async (roleId, updateData, userId) => {
  const role = await Role.findById(roleId);

  if (!role) {
    throw new Error('Role not found');
  }

  // Prevent updating critical fields of system roles
  if (role.isSystem) {
    if (updateData.RoleName && updateData.RoleName !== role.RoleName) {
      throw new Error('Cannot modify system role name');
    }
    if (updateData.level !== undefined && updateData.level !== role.level) {
      throw new Error('Cannot modify system role level');
    }
    if (updateData.isSystem === false) {
      throw new Error('Cannot change system role to non-system role');
    }
  }

  const { RoleName, description, permissions, level, isActive, isSystem } = updateData;

  // Check if new role name already exists (if changing name)
  if (RoleName && RoleName !== role.RoleName) {
    const existingRole = await Role.findOne({
      RoleName: { $regex: new RegExp(`^${RoleName}$`, 'i') },
      _id: { $ne: roleId }
    });

    if (existingRole) {
      throw new Error('Role name already exists');
    }

    // Only update name if not a system role (already checked above)
    if (!role.isSystem) {
      role.RoleName = RoleName;
    }
  }

  // Update basic fields (with system role protection)
  if (description !== undefined) role.description = description;
  if (level !== undefined && !role.isSystem) role.level = level;
  if (isActive !== undefined) role.isActive = isActive;
  if (isSystem !== undefined && !role.isSystem) role.isSystem = isSystem;

  // Update permissions if provided
  if (permissions !== undefined) {
    let validPermissions = [];
    if (permissions.length > 0) {
      // Validate that all permissions are in the valid list
      const invalidPermissions = permissions.filter(p => !VALID_PERMISSIONS.includes(p));

      if (invalidPermissions.length > 0) {
        throw new Error(`Invalid permissions: ${invalidPermissions.join(', ')}`);
      }

      validPermissions = permissions; // Store permission names directly
    }
    role.permissions = validPermissions;
  }

  role.updatedBy = userId;
  role.updatedAt = new Date();

  await role.save();

  // Populate user references for response
  await role.populate('createdBy', 'name email');
  await role.populate('updatedBy', 'name email');

  return role;
};

/**
 * Delete role
 * @param {String} roleId - Role ID
 * @returns {Promise<Object>} - Deletion result
 */
exports.deleteRole = async (roleId) => {
  const role = await Role.findById(roleId);

  if (!role) {
    throw new Error('Role not found');
  }

  // Prevent deleting system roles
  if (role.isSystem) {
    throw new Error(`Cannot delete system role '${role.RoleName}'. System roles are protected and cannot be removed.`);
  }

  // Check if role is assigned to any users
  const User = require('../models/userModel');
  const usersWithRole = await User.countDocuments({ role: roleId });

  if (usersWithRole > 0) {
    throw new Error(`Cannot delete role. ${usersWithRole} users are assigned to this role`);
  }

  await Role.findByIdAndDelete(roleId);

  return {
    message: 'Role deleted successfully',
    deletedRole: {
      _id: role._id,
      RoleName: role.RoleName,
      description: role.description
    }
  };
};

/**
 * Get role statistics
 * @returns {Promise<Object>} - Role statistics
 */
exports.getRoleStats = async () => {
  const User = require('../models/userModel');

  // Get total roles count
  const totalRoles = await Role.countDocuments();
  const activeRoles = await Role.countDocuments({ isActive: true });
  const systemRoles = await Role.countDocuments({ isSystem: true });

  // Get roles by level distribution
  const rolesByLevel = await Role.aggregate([
    {
      $group: {
        _id: {
          $switch: {
            branches: [
              { case: { $gte: ['$level', 80] }, then: 'High (80-100)' },
              { case: { $gte: ['$level', 50] }, then: 'Medium (50-79)' },
              { case: { $gte: ['$level', 20] }, then: 'Low (20-49)' }
            ],
            default: 'Basic (1-19)'
          }
        },
        count: { $sum: 1 }
      }
    }
  ]);

  // Get user count by role
  const usersByRole = await User.aggregate([
    {
      $lookup: {
        from: 'roles',
        localField: 'role',
        foreignField: '_id',
        as: 'roleInfo'
      }
    },
    {
      $unwind: '$roleInfo'
    },
    {
      $group: {
        _id: '$roleInfo.RoleName',
        count: { $sum: 1 },
        level: { $first: '$roleInfo.level' }
      }
    },
    {
      $sort: { level: -1 }
    }
  ]);

  // Get permission distribution
  const permissionStats = await Role.aggregate([
    {
      $project: {
        RoleName: 1,
        permissionCount: { $size: '$permissions' },
        level: 1
      }
    },
    {
      $group: {
        _id: null,
        avgPermissions: { $avg: '$permissionCount' },
        maxPermissions: { $max: '$permissionCount' },
        minPermissions: { $min: '$permissionCount' }
      }
    }
  ]);

  return {
    total: totalRoles,
    active: activeRoles,
    system: systemRoles,
    custom: totalRoles - systemRoles,
    rolesByLevel,
    usersByRole,
    permissionStats: permissionStats[0] || {
      avgPermissions: 0,
      maxPermissions: 0,
      minPermissions: 0
    }
  };
};

/**
 * Search roles with advanced filtering
 * @param {Object} searchParams - Search parameters
 * @returns {Promise<Object>} - Search results
 */
exports.searchRoles = async (searchParams = {}) => {
  const {
    query,
    level,
    isActive,
    isSystem,
    hasPermissions,
    permissionCount,
    page = 1,
    limit = 10,
    sortBy = 'level',
    sortOrder = 'desc'
  } = searchParams;

  // Build search query
  const searchQuery = {};

  // Global search across name and description
  if (query) {
    const searchRegex = new RegExp(query, 'i');
    searchQuery.$or = [
      { RoleName: searchRegex },
      { description: searchRegex }
    ];
  }

  // Filter by level
  if (level !== undefined) {
    if (typeof level === 'object') {
      searchQuery.level = level; // e.g., { $gte: 50, $lte: 80 }
    } else {
      searchQuery.level = { $gte: parseInt(level) };
    }
  }

  // Filter by active status
  if (isActive !== undefined) {
    searchQuery.isActive = isActive === 'true';
  }

  // Filter by system status
  if (isSystem !== undefined) {
    searchQuery.isSystem = isSystem === 'true';
  }

  // Filter by permission count
  if (permissionCount !== undefined) {
    searchQuery.$expr = {
      $gte: [{ $size: '$permissions' }, parseInt(permissionCount)]
    };
  }

  // Filter roles with/without permissions
  if (hasPermissions !== undefined) {
    if (hasPermissions === 'true') {
      searchQuery.$expr = { $gt: [{ $size: '$permissions' }, 0] };
    } else {
      searchQuery.$expr = { $eq: [{ $size: '$permissions' }, 0] };
    }
  }

  // Apply pagination and sorting
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Get total count
  const total = await Role.countDocuments(searchQuery);

  // Get results
  const roles = await Role.find(searchQuery)
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email')
    .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
    .skip(skip)
    .limit(limitNum)
    .lean();

  // Build pagination metadata
  const totalPages = Math.ceil(total / limitNum);
  const pagination = {
    total,
    page: pageNum,
    limit: limitNum,
    totalPages,
    hasNextPage: pageNum < totalPages,
    hasPrevPage: pageNum > 1,
    nextPage: pageNum < totalPages ? pageNum + 1 : null,
    prevPage: pageNum > 1 ? pageNum - 1 : null
  };

  return {
    roles,
    pagination,
    searchCriteria: searchParams
  };
};