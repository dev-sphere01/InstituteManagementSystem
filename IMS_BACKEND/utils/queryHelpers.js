/**
 * Query Helper Utilities for Pagination, Filtering, and Sorting
 */

/**
 * Build MongoDB query object from request query parameters
 * @param {Object} queryParams - Request query parameters
 * @param {Array} allowedFilters - Array of allowed filter fields
 * @returns {Object} - MongoDB query object
 */
const buildFilterQuery = (queryParams, allowedFilters = []) => {
  const query = {};
  
  // Text search across multiple fields
  if (queryParams.search) {
    const searchRegex = new RegExp(queryParams.search, 'i');
    query.$or = [
      { name: searchRegex },
      { email: searchRegex }
    ];
  }

  // Specific field searches
  if (queryParams.name) {
    query.name = new RegExp(queryParams.name, 'i');
  }

  if (queryParams.email) {
    query.email = new RegExp(queryParams.email, 'i');
  }
  
  // Status filter
  if (queryParams.status && ['active', 'inactive', 'suspended', 'pending'].includes(queryParams.status)) {
    query.status = queryParams.status;
  }
  
  // Role filter (by role name or ObjectId)
  if (queryParams.role) {
    // If it's a valid ObjectId, search by ObjectId, otherwise search by role name
    if (queryParams.role.match(/^[0-9a-fA-F]{24}$/)) {
      query.role = queryParams.role;
    } else {
      // Will need to populate role and filter by name (handled in service)
      query.roleName = queryParams.role;
    }
  }
  
  // Date range filters
  if (queryParams.createdFrom || queryParams.createdTo) {
    query.createdAt = {};
    if (queryParams.createdFrom) {
      query.createdAt.$gte = new Date(queryParams.createdFrom);
    }
    if (queryParams.createdTo) {
      query.createdAt.$lte = new Date(queryParams.createdTo);
    }
  }
  
  // Last login date range
  if (queryParams.lastLoginFrom || queryParams.lastLoginTo) {
    query.lastLogin = {};
    if (queryParams.lastLoginFrom) {
      query.lastLogin.$gte = new Date(queryParams.lastLoginFrom);
    }
    if (queryParams.lastLoginTo) {
      query.lastLogin.$lte = new Date(queryParams.lastLoginTo);
    }
  }
  
  // Login attempts filter
  if (queryParams.loginAttempts) {
    query.loginAttempts = { $gte: parseInt(queryParams.loginAttempts) };
  }
  
  // Locked accounts filter
  if (queryParams.locked === 'true') {
    query.lockUntil = { $gt: new Date() };
  } else if (queryParams.locked === 'false') {
    query.$or = [
      { lockUntil: { $exists: false } },
      { lockUntil: { $lte: new Date() } }
    ];
  }
  
  // Additional dynamic filters
  allowedFilters.forEach(field => {
    if (queryParams[field] !== undefined) {
      query[field] = queryParams[field];
    }
  });
  
  return query;
};

/**
 * Build sort object from request query parameters
 * @param {Object} queryParams - Request query parameters
 * @param {Object} defaultSort - Default sort object
 * @returns {Object} - MongoDB sort object
 */
const buildSortQuery = (queryParams, defaultSort = { createdAt: -1 }) => {
  if (!queryParams.sortBy) {
    return defaultSort;
  }
  
  const allowedSortFields = [
    'name', 'email', 'createdAt', 'updatedAt', 
    'lastLogin', 'status', 'loginAttempts'
  ];
  
  const sortField = queryParams.sortBy;
  const sortOrder = queryParams.sortOrder === 'asc' ? 1 : -1;
  
  if (allowedSortFields.includes(sortField)) {
    return { [sortField]: sortOrder };
  }
  
  return defaultSort;
};

/**
 * Build pagination parameters
 * @param {Object} queryParams - Request query parameters
 * @returns {Object} - Pagination parameters
 */
const buildPaginationParams = (queryParams) => {
  const page = Math.max(1, parseInt(queryParams.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(queryParams.limit) || 10));
  const skip = (page - 1) * limit;
  
  return { page, limit, skip };
};

/**
 * Build response metadata for pagination
 * @param {number} total - Total number of documents
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {Object} - Pagination metadata
 */
const buildPaginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage,
    hasPrevPage,
    nextPage: hasNextPage ? page + 1 : null,
    prevPage: hasPrevPage ? page - 1 : null
  };
};

/**
 * Apply filters, sorting, and pagination to a Mongoose query
 * @param {Object} model - Mongoose model
 * @param {Object} queryParams - Request query parameters
 * @param {Object} options - Additional options
 * @returns {Object} - Query results with metadata
 */
const applyQueryFeatures = async (model, queryParams, options = {}) => {
  const {
    allowedFilters = [],
    defaultSort = { createdAt: -1 },
    populate = [],
    select = ''
  } = options;
  
  // Build query components
  const filterQuery = buildFilterQuery(queryParams, allowedFilters);
  const sortQuery = buildSortQuery(queryParams, defaultSort);
  const { page, limit, skip } = buildPaginationParams(queryParams);
  
  // Handle role name filtering (requires population)
  let query = model.find(filterQuery);
  
  if (queryParams.role && !queryParams.role.match(/^[0-9a-fA-F]{24}$/)) {
    // If filtering by role name, we need to populate and filter
    query = query.populate('role');
  }
  
  // Apply population
  if (populate.length > 0) {
    populate.forEach(pop => {
      query = query.populate(pop);
    });
  }
  
  // Apply selection
  if (select) {
    query = query.select(select);
  }
  
  // Get total count for pagination
  const totalQuery = model.find(filterQuery);
  const total = await totalQuery.countDocuments();
  
  // Apply sorting and pagination
  const results = await query
    .sort(sortQuery)
    .skip(skip)
    .limit(limit)
    .lean();
  
  // Filter by role name if needed (post-population filtering)
  let filteredResults = results;
  if (queryParams.role && !queryParams.role.match(/^[0-9a-fA-F]{24}$/)) {
    filteredResults = results.filter(user => 
      user.role && user.role.RoleName && 
      user.role.RoleName.toLowerCase().includes(queryParams.role.toLowerCase())
    );
  }
  
  // Build pagination metadata
  const pagination = buildPaginationMeta(total, page, limit);
  
  return {
    data: filteredResults,
    pagination,
    filters: {
      applied: Object.keys(filterQuery).length > 0 ? filterQuery : null,
      search: queryParams.search || null,
      status: queryParams.status || null,
      role: queryParams.role || null
    },
    sort: sortQuery
  };
};

module.exports = {
  buildFilterQuery,
  buildSortQuery,
  buildPaginationParams,
  buildPaginationMeta,
  applyQueryFeatures
};
