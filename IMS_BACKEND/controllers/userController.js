const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const sendToken = require("../utils/jwtToken");
const {
  createUser,
  authenticateUser,
  forgotPassword,
  resetPassword,
  changePassword,
  getUserProfile,
  getAllUsers,
  updateUserRole,
  updateUser,
} = require("../services/userService");
const {
  searchUsers,
  quickSearch,
  getSearchSuggestions,
  advancedSearch
} = require("../services/searchService");
const ErrorHandler = require("../utils/ErrorHandler");
const {
  logCreate,
  logUpdate,
  logDelete,
  logAuth,
} = require("../utils/auditLogger");

/**
 * User Controller
 * Handles HTTP requests and responses for user-related operations
 * Uses the service layer for business logic
 */

// Register a user (public registration)
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  // For self-registration, always use student role regardless of provided role
  const user = await createUser(req.body, { isAdminCreation: false });

  // Audit log for user registration
  logCreate({
    userId: user._id.toString(),
    userEmail: user.email,
    userRole: user.role.RoleName || (user.role.name ? user.role.name : user.role.toString()),
    action: "register",
    entity: "user",
    entityId: user._id.toString(),
    newValues: {
      name: user.name,
      email: user.email,
      role: user.role,
    },
    ipAddress: req.auditContext?.ipAddress,
    userAgent: req.auditContext?.userAgent,
  });

  // Instead of sending token, send a message
  res.status(201).json({
    success: true,
    message: "User registered successfully. Password has been sent to your email.",
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    }
  });
});

// Create user (admin only)
exports.createUserAdmin = catchAsyncErrors(async (req, res, next) => {
  // For admin creation, accept role ID directly
  const user = await createUser(req.body, { isAdminCreation: true });

  // Audit log for admin user creation
  logCreate({
    userId: req.user.id,
    userEmail: req.user.email,
    userRole: req.user.role?.RoleName || (req.user.role?.name ? req.user.role.name : req.user.role?.toString()),
    action: "create-user",
    entity: "user",
    entityId: user._id.toString(),
    newValues: {
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    },
    ipAddress: req.auditContext?.ipAddress,
    userAgent: req.auditContext?.userAgent,
  });

  res.status(201).json({
    success: true,
    message: "User created successfully",
    user
  });
});

// Login User
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await authenticateUser(email, password);

  // Audit log for user login
  logAuth({
    userId: user._id.toString(),
    userEmail: user.email,
    action: "login",
    success: true,
    ipAddress: req.auditContext?.ipAddress,
    userAgent: req.auditContext?.userAgent,
  });

  sendToken(user, 200, res);
});

exports.logout = catchAsyncErrors(async (req, res, next) => {
  // Audit log for user logout
  if (req.user) {
    logAuth({
      userId: req.user.id,
      userEmail: req.user.email,
      action: "logout",
      success: true,
      ipAddress: req.auditContext?.ipAddress,
      userAgent: req.auditContext?.userAgent,
    });
  }

  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

// Forgot password
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  // Create base URL without the path
  const resetUrl = `${req.protocol}://${req.get("host")}`;
  const result = await forgotPassword(req.body.email, resetUrl);

  // Audit log for forgot password request
  logAuth({
    userEmail: req.body.email,
    action: "forgot-password",
    success: true,
    ipAddress: req.auditContext?.ipAddress,
    userAgent: req.auditContext?.userAgent,
  });

  res.status(200).json({
    success: true,
    message: result,
  });
});

// Reset password
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password does not match", 400));
  }

  const user = await resetPassword(req.params.token, req.body.password);

  // Audit log for password reset
  // Only log if auditContext is available
  if (req.auditContext) {
    logAuth({
      userId: user._id.toString(),
      userEmail: user.email,
      action: "reset-password",
      success: true,
      ipAddress: req.auditContext.ipAddress,
      userAgent: req.auditContext.userAgent,
    });
  } else {
    // Simplified logging when auditContext is not available
    logAuth({
      userId: user._id.toString(),
      userEmail: user.email,
      action: "reset-password",
      success: true,
      ipAddress: req.ip || "unknown",
      userAgent: req.headers?.["user-agent"] || "unknown",
    });
  }

  sendToken(user, 200, res);
});

// Change password
exports.changePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await changePassword(
    req.user.id,
    req.body.oldPassword,
    req.body.newPassword
  );

  // Audit log for password change
  logAuth({
    userId: user._id.toString(),
    userEmail: user.email,
    action: "change-password",
    success: true,
    ipAddress: req.auditContext?.ipAddress,
    userAgent: req.auditContext?.userAgent,
  });

  sendToken(user, 200, res);
});

// Logged in user details
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = await getUserProfile(req.user.id);
  res.status(200).json({
    success: true,
    user,
  });
});

// Get single user (admin)
exports.getUserDetailsAdmin = catchAsyncErrors(async (req, res, next) => {
  const user = await getUserProfile(req.params.id);
  res.status(200).json({
    success: true,
    user,
  });
});

// Update user (admin)
exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
  // Extract all possible user fields from request body
  const userData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
    roles: req.body.roles,
    isActive: req.body.isActive,
    avatar: req.body.avatar
  };

  // Remove undefined fields to avoid updating with undefined values
  Object.keys(userData).forEach(key => {
    if (userData[key] === undefined) {
      delete userData[key];
    }
  });

  // Get the user before update to capture old values
  const oldUser = await getUserProfile(req.params.id);
  const user = await updateUser(req.params.id, userData);

  // Audit log for user update
  logUpdate({
    userId: req.user.id, // Admin who made the change
    userEmail: req.user.email,
    action: "update-user",
    entity: "user",
    entityId: req.params.id,
    oldValues: {
      name: oldUser.name,
      email: oldUser.email,
      role: oldUser.role,
      roles: oldUser.roles,
      isActive: oldUser.isActive,
      avatar: oldUser.avatar,
    },
    newValues: {
      name: user.name,
      email: user.email,
      role: user.role,
      roles: user.roles,
      isActive: user.isActive,
      avatar: user.avatar,
    },
    ipAddress: req.auditContext?.ipAddress,
    userAgent: req.auditContext?.userAgent,
  });

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    user,
  });
});

// Get all users with pagination and filtering (admin)
exports.getAllUsers = catchAsyncErrors(async (req, res, next) => {
  const result = await getAllUsers(req.query);

  // Simple log for admin viewing all users
  const logger = require("../utils/logger");
  logger.info(`Admin ${req.user.email} (${req.user.id}) viewed users list - Page: ${result.pagination.page}, Total: ${result.pagination.total}`);

  res.status(200).json({
    success: true,
    data: result.users,
    pagination: result.pagination,
    filters: result.filters,
    sort: result.sort,
  });
});

// Get user statistics (admin)
exports.getUserStats = catchAsyncErrors(async (req, res, next) => {
  const User = require("../models/userModel");

  const stats = await User.aggregate([
    {
      $group: {
        _id: "$isActive",
        count: { $sum: 1 }
      }
    }
  ]);

  const roleStats = await User.aggregate([
    {
      $lookup: {
        from: "roles",
        localField: "role",
        foreignField: "_id",
        as: "roleInfo"
      }
    },
    {
      $unwind: "$roleInfo"
    },
    {
      $group: {
        _id: "$roleInfo.RoleName",
        count: { $sum: 1 }
      }
    }
  ]);

  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ isActive: true });
  const lockedUsers = await User.countDocuments({
    lockUntil: { $gt: new Date() }
  });

  res.status(200).json({
    success: true,
    stats: {
      total: totalUsers,
      active: activeUsers,
      locked: lockedUsers,
      byActiveStatus: stats,
      byRole: roleStats
    }
  });
});

// Update user active status (admin)
exports.updateUserActiveStatus = catchAsyncErrors(async (req, res, next) => {
  const { isActive } = req.body;
  const userId = req.params.id;

  if (typeof isActive !== 'boolean') {
    return next(new ErrorHandler("Invalid isActive value. Must be true or false", 400));
  }

  const User = require("../models/userModel");
  const oldUser = await User.findById(userId);

  if (!oldUser) {
    return next(new ErrorHandler("User not found", 404));
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { isActive },
    { new: true, runValidators: true }
  ).populate('role', 'RoleName description level permissions isActive');

  // Audit log for active status update
  logUpdate({
    userId: req.user.id,
    userEmail: req.user.email,
    action: "update-user-active-status",
    entity: "user",
    entityId: userId,
    oldValues: { isActive: oldUser.isActive },
    newValues: { isActive: user.isActive },
    ipAddress: req.auditContext?.ipAddress,
    userAgent: req.auditContext?.userAgent,
  });

  res.status(200).json({
    success: true,
    message: `User account ${isActive ? 'activated' : 'deactivated'} successfully`,
    user
  });
});

// Unlock user account (admin)
exports.unlockUser = catchAsyncErrors(async (req, res, next) => {
  const userId = req.params.id;
  const User = require("../models/userModel");

  const user = await User.findByIdAndUpdate(
    userId,
    {
      $unset: { lockUntil: 1, loginAttempts: 1 }
    },
    { new: true }
  ).populate('role', 'RoleName description level');

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  // Audit log for unlock
  logUpdate({
    userId: req.user.id,
    userEmail: req.user.email,
    action: "unlock-user",
    entity: "user",
    entityId: userId,
    oldValues: { locked: true },
    newValues: { locked: false },
    ipAddress: req.auditContext?.ipAddress,
    userAgent: req.auditContext?.userAgent,
  });

  res.status(200).json({
    success: true,
    message: "User account unlocked successfully",
    user
  });
});

// Search users with advanced filtering (admin)
exports.searchUsers = catchAsyncErrors(async (req, res, next) => {
  const result = await searchUsers(req.query);

  // Log search activity
  const logger = require("../utils/logger");
  logger.info(`Admin ${req.user.email} searched users with criteria: ${JSON.stringify(req.query)}`);

  res.status(200).json({
    success: true,
    data: result.users,
    pagination: result.pagination,
    searchCriteria: result.searchCriteria,
    appliedFilters: result.appliedFilters
  });
});

// Quick search for autocomplete (admin)
exports.quickSearchUsers = catchAsyncErrors(async (req, res, next) => {
  const { q, limit } = req.query;

  if (!q || q.length < 2) {
    return res.status(200).json({
      success: true,
      data: [],
      message: "Search term must be at least 2 characters"
    });
  }

  const results = await quickSearch(q, parseInt(limit) || 5);

  res.status(200).json({
    success: true,
    data: results,
    query: q
  });
});

// Get search suggestions (admin)
exports.getSearchSuggestions = catchAsyncErrors(async (req, res, next) => {
  const { field, term, limit } = req.query;

  if (!term || term.length < 2) {
    return res.status(200).json({
      success: true,
      data: [],
      message: "Search term must be at least 2 characters"
    });
  }

  if (!['name', 'email'].includes(field)) {
    return next(new ErrorHandler("Invalid field. Must be 'name' or 'email'", 400));
  }

  const suggestions = await getSearchSuggestions(field, term, parseInt(limit) || 10);

  res.status(200).json({
    success: true,
    data: suggestions,
    field,
    term
  });
});

// Advanced search with aggregation (admin)
exports.advancedSearchUsers = catchAsyncErrors(async (req, res, next) => {
  const result = await advancedSearch(req.query);

  // Log advanced search activity
  const logger = require("../utils/logger");
  logger.info(`Admin ${req.user.email} performed advanced search with criteria: ${JSON.stringify(req.query)}`);

  res.status(200).json({
    success: true,
    data: result.users,
    pagination: result.pagination,
    searchCriteria: result.searchCriteria
  });
});
