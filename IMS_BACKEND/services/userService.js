const User = require('../models/userModel');
const Role = require('../models/roleModel');
const ErrorHandler = require('../utils/ErrorHandler');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

/**
 * Service layer for user-related operations
 * Separates business logic from controllers for better maintainability and testability
 */

/**
 * Get default student role ObjectId
 * @returns {Promise<ObjectId>} - Student role ObjectId
 */
const getDefaultStudentRole = async () => {
  const studentRole = await Role.findOne({ RoleName: 'student', isActive: true });
  if (!studentRole) {
    throw new ErrorHandler('Default student role not found. Please run the role seeder.', 500);
  }
  return studentRole._id;
};

/**
 * Create a new user
 * @param {Object} userData - User data including name, email, password, etc.
 * @param {Object} options - Options to control role handling
 * @param {boolean} options.isAdminCreation - Whether this is admin creating user (accepts role ID)
 * @returns {Promise<Object>} - Created user object
 */
exports.createUser = async (userData, options = {}) => {
  let roleId = userData.role;

  if (!roleId) {
    // If no role provided, get default student role
    roleId = await getDefaultStudentRole();
  } else if (options.isAdminCreation) {
    // Admin creation: role can be ObjectId or string
    if (typeof roleId === 'string') {
      // Check if it's a valid ObjectId format
      const mongoose = require('mongoose');
      if (mongoose.Types.ObjectId.isValid(roleId)) {
        // It's an ObjectId, verify it exists
        const role = await Role.findById(roleId);
        if (!role) {
          throw new ErrorHandler(`Role with ID '${roleId}' not found`, 400);
        }
        if (!role.isActive) {
          throw new ErrorHandler(`Role '${role.RoleName}' is inactive`, 400);
        }
        roleId = role._id;
      } else {
        // It's a role name, find the role ObjectId
        const role = await Role.findOne({ RoleName: roleId, isActive: true });
        if (!role) {
          throw new ErrorHandler(`Role '${roleId}' not found`, 400);
        }
        roleId = role._id;
      }
    }
  } else {
    // Self-registration: always use student role regardless of provided role
    roleId = await getDefaultStudentRole();
  }

  // Business logic for user creation
  const user = await User.create({
    name: userData.name,
    email: userData.email,
    password: userData.password,
    role: roleId,
    avatar: {
      public_id: userData.avatar?.public_id || "default_id",
      url: userData.avatar?.url || "default_url"
    }
  });

  // Populate role data with permissions before returning
  await user.populate({
    path: 'role',
    select: 'RoleName description level permissions isActive'
  });

  return user;
};

/**
 * Authenticate a user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} - Authenticated user object with populated role
 */
exports.authenticateUser = async (email, password) => {
  // Check if email and password are provided
  if (!email || !password) {
    throw new ErrorHandler("Please enter email and password", 400);
  }

  // Find user by email and populate role with permissions
  const user = await User.findOne({ email })
    .select("+password")
    .populate({
      path: 'role',
      select: 'RoleName description level permissions isActive'
    });

  if (!user) {
    throw new ErrorHandler("Invalid email or password", 401);
  }

  // Check if password matches
  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    throw new ErrorHandler("Invalid email or password", 401);
  }

  // Check if user account is active
  if (!user.isActive) {
    throw new ErrorHandler("Your account is inactive. Please contact administrator to activate your account.", 403);
  }

  // Check if user has a role assigned
  if (!user.role) {
    throw new ErrorHandler("User role not found. Please contact administrator.", 403);
  }

  // Check if role is active
  if (!user.role.isActive) {
    throw new ErrorHandler("Your role is inactive. Please contact administrator to activate your role.", 403);
  }

  // Update last login timestamp
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  return user;
};

/**
 * Get user profile by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - User object with populated role
 */
exports.getUserProfile = async (userId) => {
  const user = await User.findById(userId)
    .populate({
      path: 'role',
      select: 'RoleName description level permissions isActive'
    });

  if (!user) {
    throw new ErrorHandler("User not found", 404);
  }

  return user;
};

/**
 * Get all users with pagination and filtering (admin only)
 * @param {Object} queryParams - Query parameters for filtering, sorting, and pagination
 * @returns {Promise<Object>} - Object containing users array and pagination metadata
 */
exports.getAllUsers = async (queryParams = {}) => {
  const { applyQueryFeatures } = require('../utils/queryHelpers');

  const options = {
    populate: [
      {
        path: 'role',
        select: 'RoleName description level permissions isActive'
      }
    ],
    select: '-password -resetPasswordToken -resetPasswordExpire',
    defaultSort: { createdAt: -1 }
  };

  const result = await applyQueryFeatures(User, queryParams, options);

  return {
    users: result.data,
    pagination: result.pagination,
    filters: result.filters,
    sort: result.sort
  };
};

/**
 * Update user (admin only)
 * @param {string} userId - User ID
 * @param {Object} userData - Updated user data
 * @returns {Promise<Object>} - Updated user object with populated role
 */
exports.updateUser = async (userId, userData) => {
  // Prepare update object with only provided fields
  const updateData = {};

  // Handle basic fields
  if (userData.name !== undefined) updateData.name = userData.name;
  if (userData.email !== undefined) updateData.email = userData.email;
  if (userData.isActive !== undefined) updateData.isActive = userData.isActive;

  // Handle avatar if provided
  if (userData.avatar) {
    updateData.avatar = {
      public_id: userData.avatar.public_id || "default_id",
      url: userData.avatar.url || "default_url"
    };
  }

  // Handle role validation and conversion
  if (userData.role !== undefined) {
    let roleId = userData.role;

    if (roleId) {
      const mongoose = require('mongoose');
      if (typeof roleId === 'string') {
        if (mongoose.Types.ObjectId.isValid(roleId)) {
          // It's an ObjectId, verify it exists
          const role = await Role.findById(roleId);
          if (!role) {
            throw new ErrorHandler(`Role with ID '${roleId}' not found`, 400);
          }
          if (!role.isActive) {
            throw new ErrorHandler(`Role '${role.RoleName}' is inactive`, 400);
          }
          roleId = role._id;
        } else {
          // It's a role name, find the role ObjectId
          const role = await Role.findOne({ RoleName: roleId, isActive: true });
          if (!role) {
            throw new ErrorHandler(`Role '${roleId}' not found`, 400);
          }
          roleId = role._id;
        }
      }
    }
    updateData.role = roleId;
  }

  const user = await User.findByIdAndUpdate(
    userId,
    updateData,
    {
      new: true,
      runValidators: true,
      useFindAndModify: false
    }
  ).populate({
    path: 'role',
    select: 'RoleName description level permissions isActive'
  });

  if (!user) {
    throw new ErrorHandler("User not found", 404);
  }

  return user;
};

/**
 * Update user role (admin only) - Legacy method for backward compatibility
 * @param {string} userId - User ID
 * @param {Object} userData - Updated user data
 * @returns {Promise<Object>} - Updated user object with populated role
 */
exports.updateUserRole = async (userId, userData) => {
  return exports.updateUser(userId, userData);
};

/**
 * Change user password
 * @param {string} userId - User ID
 * @param {string} oldPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} - Updated user object with populated role
 */
exports.changePassword = async (userId, oldPassword, newPassword) => {
  const user = await User.findById(userId).select("+password");

  if (!user) {
    throw new ErrorHandler("User not found", 404);
  }

  // Check if user account is active
  if (!user.isActive) {
    throw new ErrorHandler("Password change is not available for inactive accounts. Please contact administrator.", 403);
  }

  const isPasswordMatched = await user.comparePassword(oldPassword);

  if (!isPasswordMatched) {
    throw new ErrorHandler("Old password is incorrect", 400);
  }

  user.password = newPassword;
  await user.save();

  // Populate role data before returning
  await user.populate({
    path: 'role',
    select: 'RoleName description level permissions isActive'
  });

  return user;
};

/**
 * Generate password reset token and send email
 * @param {string} email - User email
 * @param {string} resetUrl - Base URL for reset link
 * @returns {Promise<string>} - Success message
 */
exports.forgotPassword = async (email, resetUrl) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new ErrorHandler("User not found with this email", 404);
  }

  // Check if user account is active
  if (!user.isActive) {
    throw new ErrorHandler("Password reset is not available for inactive accounts. Please contact administrator.", 403);
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Create reset password url that points to the frontend route
  const resetPasswordUrl = `${resetUrl}/reset-password/${resetToken}`;

  // Create a nicely formatted HTML email with a button
  // Create a nicely formatted HTML email with a decorative card
  const htmlMessage = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      text-align: center;
      background-color: #f5f7fa;
    }
    .container {
      background-color: #ffffff;
      border-radius: 12px;
      padding: 40px 30px;
      border: 1px solid #e0e0e0;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
      position: relative;
      overflow: hidden;
    }
    .container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 6px;
      background: linear-gradient(90deg, #4f46e5, #7c3aed);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      position: relative;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
      color: #4f46e5;
      margin-bottom: 5px;
      letter-spacing: 0.5px;
    }
    .logo-accent {
      color: #7c3aed;
    }
    .header h2 {
      font-size: 24px;
      color: #1f2937;
      margin: 10px 0;
      font-weight: 600;
    }
    .header::after {
      content: '';
      display: block;
      width: 60px;
      height: 3px;
      background: linear-gradient(90deg, #4f46e5, #7c3aed);
      margin: 15px auto 0;
      border-radius: 3px;
    }
    .button-container {
      text-align: center;
      margin: 35px 0;
    }
    .button {
      display: inline-block;
      background: linear-gradient(90deg, #4f46e5, #7c3aed);
      color: white !important;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 50px;
      font-weight: bold;
      font-size: 16px;
      letter-spacing: 0.5px;
      box-shadow: 0 4px 10px rgba(79, 70, 229, 0.3);
      transition: transform 0.2s;
    }
    .button:hover {
      transform: translateY(-2px);
    }
    .message-content {
      padding: 0 15px;
      color: #4b5563;
    }
    .message-content p {
      margin: 16px 0;
      line-height: 1.7;
    }
    .security-notice {
      background-color: #f8fafc;
      border-left: 3px solid #4f46e5;
      padding: 12px 15px;
      margin: 25px 0;
      text-align: left;
      border-radius: 0 6px 6px 0;
    }
    .security-notice p {
      margin: 8px 0;
      font-size: 14px;
      color: #64748b;
    }
    .footer {
      margin-top: 35px;
      font-size: 12px;
      color: #94a3b8;
      text-align: center;
      border-top: 1px solid #e2e8f0;
      padding-top: 20px;
    }
    .link-fallback {
      margin-top: 20px;
      font-size: 13px;
      word-break: break-all;
      background-color: #f8fafc;
      padding: 12px;
      border-radius: 6px;
    }
    .link-fallback a {
      color: #4f46e5;
      text-decoration: none;
    }
   
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">User<span class="logo-accent">Auth</span></div>
      <h2>Password Reset Request</h2>
    </div>

    <div class="message-content">
      <p>Hello,</p>

      <p>We received a request to reset your password. Click the button below to create a new password:</p>
    </div>

    <div class="button-container">
      <a href="${resetPasswordUrl}" class="button">Reset Password</a>
    </div>

    <div class="security-notice">
      <p><strong>Security Notice:</strong> This link will expire in 15 minutes for security reasons.</p>
      <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
    </div>

    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} UserAuth. All rights reserved.</p>
      <p>This is an automated message, please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
  `;

  // Plain text version as fallback
  const message = `
Password Reset Request

Hello,

We received a request to reset your password. Please click the link below to create a new password:

${resetPasswordUrl}

This link will expire in 15 minutes for security reasons.

If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.

© ${new Date().getFullYear()} UserAuth. All rights reserved.
This is an automated message, please do not reply to this email.
  `;

  try {
    // Send email with HTML content and plain text fallback
    await sendEmail(email, "Password Reset", htmlMessage, message);
    return "Email sent successfully";
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });
    throw new ErrorHandler(error.message, 500);
  }
};

/**
 * Reset password using token
 * @param {string} token - Reset token
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} - Updated user object with populated role
 */
exports.resetPassword = async (token, newPassword) => {
  // Hash the token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new ErrorHandler("Reset Password Token is invalid or has expired", 400);
  }

  // Check if user account is active
  if (!user.isActive) {
    throw new ErrorHandler("Password reset is not available for inactive accounts. Please contact administrator.", 403);
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  // Populate role data before returning
  await user.populate({
    path: 'role',
    select: 'RoleName description level permissions isActive'
  });

  return user;
};
