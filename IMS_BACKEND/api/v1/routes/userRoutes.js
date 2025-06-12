const express = require("express");
const router = express.Router();

// Import controllers
const {
  registerUser,
  createUserAdmin,
  loginUser,
  logout,
  forgotPassword,
  resetPassword,
  getUserDetails,
  getUserDetailsAdmin,
  getAllUsers,
  updateUserRole,
  changePassword
} = require("../../../controllers/userController");

// Import middleware
const { isAuthenticatedUser } = require("../../../middlewares/auth");
const { authorizePermissions } = require("../../../middlewares/permission");
const { validate } = require("../../../middlewares/validator");
const auditMiddleware = require("../../../middlewares/auditMiddleware");

// Import validation schemas
const {
  registerSchema,
  createUserAdminSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateUserRoleSchema
} = require("../../../validators/userValidators");

// Public routes
router.post("/register", validate(registerSchema), registerUser);
router.post("/login", validate(loginSchema), loginUser);
router.post("/password/forgot", validate(forgotPasswordSchema), forgotPassword);
router.put("/password/reset/:token", validate(resetPasswordSchema), resetPassword);
router.get("/logout", logout);

// Protected routes - require authentication
router.use(isAuthenticatedUser);
router.use(auditMiddleware);

/**
 * @route   GET /api/v1/users/me
 * @desc    Get current user profile
 * @access  Private (profile.read permission)
 */
router.get("/me",
  authorizePermissions('profile.read'),
  getUserDetails
);

/**
 * @route   PUT /api/v1/users/password/change
 * @desc    Change user password
 * @access  Private (profile.update permission)
 */
router.put("/password/change",
  validate(changePasswordSchema),
  authorizePermissions('profile.update'),
  changePassword
);

// Admin user management routes
/**
 * @route   POST /api/v1/users/admin/user
 * @desc    Create new user (admin only)
 * @access  Admin (user.create permission)
 */
router.post("/admin/user",
  validate(createUserAdminSchema),
  authorizePermissions('user.create'),
  createUserAdmin
);

/**
 * @route   GET /api/v1/users/admin/users
 * @desc    Get all users (admin only)
 * @access  Admin (user.read permission)
 */
router.get("/admin/users",
  authorizePermissions('user.read'),
  getAllUsers
);

/**
 * @route   GET /api/v1/users/admin/user/:id
 * @desc    Get user details by ID (admin only)
 * @access  Admin (user.read permission)
 */
router.get("/admin/user/:id",
  authorizePermissions('user.read'),
  getUserDetailsAdmin
);

/**
 * @route   PUT /api/v1/users/admin/user/:id
 * @desc    Update user details (admin only) - supports name, email, role, isActive, avatar
 * @access  Admin (user.update permission)
 */
router.put("/admin/user/:id",
  validate(updateUserRoleSchema),
  authorizePermissions('user.update'),
  updateUserRole
);

module.exports = router;

