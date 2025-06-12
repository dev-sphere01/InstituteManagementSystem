const User = require('../models/userModel');
const Role = require('../models/roleModel');
const { applyQueryFeatures } = require('../utils/queryHelpers');

/**
 * Search Service for advanced user search functionality
 */

/**
 * Advanced user search with multiple criteria
 * @param {Object} searchParams - Search parameters
 * @returns {Promise<Object>} - Search results with metadata
 */
exports.searchUsers = async (searchParams = {}) => {
  const {
    query,
    name,
    email,
    role,
    status,
    createdFrom,
    createdTo,
    lastLoginFrom,
    lastLoginTo,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = searchParams;

  // Build search query
  const searchQuery = {};
  const searchConditions = [];

  // Global search across multiple fields
  if (query) {
    const searchRegex = new RegExp(query, 'i');
    searchConditions.push({
      $or: [
        { name: searchRegex },
        { email: searchRegex }
      ]
    });
  }

  // Specific field searches
  if (name) {
    searchConditions.push({ name: new RegExp(name, 'i') });
  }

  if (email) {
    searchConditions.push({ email: new RegExp(email, 'i') });
  }

  if (status) {
    searchConditions.push({ status });
  }

  // Date range filters
  if (createdFrom || createdTo) {
    const dateFilter = {};
    if (createdFrom) dateFilter.$gte = new Date(createdFrom);
    if (createdTo) dateFilter.$lte = new Date(createdTo);
    searchConditions.push({ createdAt: dateFilter });
  }

  if (lastLoginFrom || lastLoginTo) {
    const loginFilter = {};
    if (lastLoginFrom) loginFilter.$gte = new Date(lastLoginFrom);
    if (lastLoginTo) loginFilter.$lte = new Date(lastLoginTo);
    searchConditions.push({ lastLogin: loginFilter });
  }

  // Combine all conditions
  if (searchConditions.length > 0) {
    searchQuery.$and = searchConditions;
  }

  // Handle role search (can be by name or ObjectId)
  let roleFilter = null;
  if (role) {
    if (role.match(/^[0-9a-fA-F]{24}$/)) {
      // ObjectId format
      searchQuery.role = role;
    } else {
      // Role name - will need to find role first
      const roleDoc = await Role.findOne({ 
        RoleName: new RegExp(role, 'i') 
      });
      if (roleDoc) {
        searchQuery.role = roleDoc._id;
      } else {
        // No matching role found, return empty results
        return {
          users: [],
          pagination: {
            total: 0,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: 0,
            hasNextPage: false,
            hasPrevPage: false,
            nextPage: null,
            prevPage: null
          },
          searchCriteria: searchParams
        };
      }
    }
  }

  // Apply pagination and sorting
  const options = {
    populate: [
      {
        path: 'role',
        select: 'RoleName description level'
      }
    ],
    select: '-password -resetPasswordToken -resetPasswordExpire',
    defaultSort: { [sortBy]: sortOrder === 'asc' ? 1 : -1 }
  };

  const queryParams = {
    page,
    limit,
    sortBy,
    sortOrder
  };

  // Use the query helper but with our custom search query
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Get total count
  const total = await User.countDocuments(searchQuery);

  // Get results
  let query_builder = User.find(searchQuery)
    .populate('role', 'RoleName description level')
    .select('-password -resetPasswordToken -resetPasswordExpire')
    .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
    .skip(skip)
    .limit(limitNum);

  const users = await query_builder.lean();

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
    users,
    pagination,
    searchCriteria: searchParams,
    appliedFilters: searchQuery
  };
};

/**
 * Quick search for autocomplete/suggestions
 * @param {string} term - Search term
 * @param {number} limit - Maximum results to return
 * @returns {Promise<Array>} - Array of matching users
 */
exports.quickSearch = async (term, limit = 5) => {
  if (!term || term.length < 2) {
    return [];
  }

  const searchRegex = new RegExp(term, 'i');
  
  const users = await User.find({
    $or: [
      { name: searchRegex },
      { email: searchRegex }
    ],
    isActive: true // Only return active users for quick search
  })
  .select('name email avatar role')
  .populate('role', 'RoleName')
  .limit(limit)
  .lean();

  return users.map(user => ({
    id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    role: user.role?.RoleName || 'Unknown'
  }));
};

/**
 * Search suggestions based on partial input
 * @param {string} field - Field to search in ('name' or 'email')
 * @param {string} term - Partial search term
 * @param {number} limit - Maximum suggestions to return
 * @returns {Promise<Array>} - Array of suggestions
 */
exports.getSearchSuggestions = async (field, term, limit = 10) => {
  if (!term || term.length < 2) {
    return [];
  }

  const searchRegex = new RegExp(`^${term}`, 'i');
  const searchField = field === 'email' ? 'email' : 'name';
  
  const results = await User.distinct(searchField, {
    [searchField]: searchRegex,
    status: 'active'
  });

  return results.slice(0, limit);
};

/**
 * Advanced search with aggregation for complex queries
 * @param {Object} searchParams - Complex search parameters
 * @returns {Promise<Object>} - Aggregated search results
 */
exports.advancedSearch = async (searchParams = {}) => {
  const {
    query,
    hasLoginAttempts,
    isLocked,
    hasNeverLoggedIn,
    roleLevel,
    page = 1,
    limit = 10
  } = searchParams;

  const pipeline = [];

  // Match stage
  const matchConditions = {};

  if (query) {
    const searchRegex = new RegExp(query, 'i');
    matchConditions.$or = [
      { name: searchRegex },
      { email: searchRegex }
    ];
  }

  if (hasLoginAttempts === 'true') {
    matchConditions.loginAttempts = { $gt: 0 };
  }

  if (isLocked === 'true') {
    matchConditions.lockUntil = { $gt: new Date() };
  } else if (isLocked === 'false') {
    matchConditions.$or = [
      { lockUntil: { $exists: false } },
      { lockUntil: { $lte: new Date() } }
    ];
  }

  if (hasNeverLoggedIn === 'true') {
    matchConditions.lastLogin = { $exists: false };
  } else if (hasNeverLoggedIn === 'false') {
    matchConditions.lastLogin = { $exists: true };
  }

  if (Object.keys(matchConditions).length > 0) {
    pipeline.push({ $match: matchConditions });
  }

  // Lookup role information
  pipeline.push({
    $lookup: {
      from: 'roles',
      localField: 'role',
      foreignField: '_id',
      as: 'roleInfo'
    }
  });

  pipeline.push({
    $unwind: '$roleInfo'
  });

  // Filter by role level if specified
  if (roleLevel) {
    pipeline.push({
      $match: {
        'roleInfo.level': { $gte: parseInt(roleLevel) }
      }
    });
  }

  // Add computed fields
  pipeline.push({
    $addFields: {
      isCurrentlyLocked: {
        $cond: {
          if: { $gt: ['$lockUntil', new Date()] },
          then: true,
          else: false
        }
      },
      daysSinceLastLogin: {
        $cond: {
          if: { $ne: ['$lastLogin', null] },
          then: {
            $divide: [
              { $subtract: [new Date(), '$lastLogin'] },
              1000 * 60 * 60 * 24
            ]
          },
          else: null
        }
      }
    }
  });

  // Project fields
  pipeline.push({
    $project: {
      password: 0,
      resetPasswordToken: 0,
      resetPasswordExpire: 0
    }
  });

  // Sort
  pipeline.push({
    $sort: { createdAt: -1 }
  });

  // Get total count
  const countPipeline = [...pipeline, { $count: 'total' }];
  const countResult = await User.aggregate(countPipeline);
  const total = countResult[0]?.total || 0;

  // Add pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: parseInt(limit) });

  const users = await User.aggregate(pipeline);

  // Build pagination metadata
  const totalPages = Math.ceil(total / parseInt(limit));
  const pagination = {
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages,
    hasNextPage: parseInt(page) < totalPages,
    hasPrevPage: parseInt(page) > 1,
    nextPage: parseInt(page) < totalPages ? parseInt(page) + 1 : null,
    prevPage: parseInt(page) > 1 ? parseInt(page) - 1 : null
  };

  return {
    users,
    pagination,
    searchCriteria: searchParams
  };
};
