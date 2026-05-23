/**
 * Validation schemas for user-related routes
 */

// User registration validation schema
const registerSchema = {
  body: {
    name: {
      required: true,
      type: 'string',
      maxLength: 100
    },
    email: {
      required: true,
      type: 'string',
      isEmail: true
    },
    role: {
      type: 'string'
      // Optional field - will always default to 'student' in service layer for self-registration
    }
  }
};

// User login validation schema
const loginSchema = {
  body: {
    email: {
      required: true,
      type: 'string',
      isEmail: true
    },
    password: {
      required: true,
      type: 'string'
    }
  }
};

// Forgot password validation schema
const forgotPasswordSchema = {
  body: {
    email: {
      required: true,
      type: 'string',
      isEmail: true
    }
  }
};

// Reset password validation schema
const resetPasswordSchema = {
  params: {
    token: {
      required: true,
      type: 'string'
    }
  },
  body: {
    password: {
      required: true,
      type: 'string',
      minLength: 8,
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    },
    confirmPassword: {
      required: true,
      type: 'string',
      custom: (value, context) => {
        // Simple equality check without relying on req object
        if (context && context.body && value !== context.body.password) {
          return 'Passwords do not match';
        }
        return null;
      }
    }
  }
};

// Change password validation schema
const changePasswordSchema = {
  body: {
    oldPassword: {
      required: true,
      type: 'string'
    },
    newPassword: {
      required: true,
      type: 'string',
      minLength: 8,
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    }
  }
};

// Admin user creation validation schema (more flexible than public registration)
const createUserAdminSchema = {
  body: {
    name: {
      required: true,
      type: 'string',
      maxLength: 100
    },
    email: {
      required: true,
      type: 'string',
      isEmail: true
    },
    password: {
      required: false,
      type: 'string',
      minLength: 6  // Less strict for admin creation
    },
    role: {
      type: 'string',  // Optional, accepts role name or ObjectId
      custom: (value) => {
        if (!value) return null; // Optional field

        // Check if it's a valid ObjectId format (24 hex characters)
        const objectIdPattern = /^[0-9a-fA-F]{24}$/;
        if (objectIdPattern.test(value)) {
          return null; // Valid ObjectId format
        }

        // Since roles are dynamic, accept any non-empty string (role name)
        if (typeof value === 'string' && value.trim().length > 0) {
          return null; // Valid role name
        }

        return 'Role must be a valid ObjectId or role name string';
      }
    },
    roles: {
      type: 'object',
      custom: (value) => {
        if (!value) return null;
        if (!Array.isArray(value)) return 'roles must be an array';
        const objectIdPattern = /^[0-9a-fA-F]{24}$/;
        const validRoleNames = ['student', 'user', 'admin', 'manager'];
        for (const item of value) {
          if (typeof item !== 'string') return 'roles entries must be strings';
          if (objectIdPattern.test(item)) continue;
          if (validRoleNames.includes(item)) continue;
          return 'roles entries must be a valid ObjectId or role name';
        }
        return null;
      }
    },
    isActive: {
      type: 'boolean'
    }
  }
};

// Update user validation schema (admin only)
const updateUserRoleSchema = {
  params: {
    id: {
      required: true,
      type: 'string'
    }
  },
  body: {
    name: {
      type: 'string',
      minLength: 2,
      maxLength: 100
    },
    email: {
      type: 'string',
      isEmail: true
    },
    role: {
      type: 'string',
      custom: (value) => {
        if (!value) return null; // Role is optional in updates

        // Check if it's a valid ObjectId format (24 hex characters)
        const objectIdPattern = /^[0-9a-fA-F]{24}$/;
        if (objectIdPattern.test(value)) {
          return null; // Valid ObjectId format
        }

        // Since roles are dynamic, accept any non-empty string (role name)
        if (typeof value === 'string' && value.trim().length > 0) {
          return null; // Valid role name
        }

        return 'Role must be a valid ObjectId or role name string';
      }
    },
    roles: {
      type: 'object',
      custom: (value) => {
        if (!value) return null;
        if (!Array.isArray(value)) return 'roles must be an array';
        const objectIdPattern = /^[0-9a-fA-F]{24}$/;
        const validRoleNames = ['student', 'user', 'admin', 'manager'];
        for (const item of value) {
          if (typeof item !== 'string') return 'roles entries must be strings';
          if (objectIdPattern.test(item)) continue;
          if (validRoleNames.includes(item)) continue;
          return 'roles entries must be a valid ObjectId or role name';
        }
        return null;
      }
    },
    isActive: {
      type: 'boolean'
    },
    avatar: {
      type: 'object',
      properties: {
        public_id: {
          type: 'string'
        },
        url: {
          type: 'string'
        }
      }
    }
  }
};

module.exports = {
  registerSchema,
  createUserAdminSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateUserRoleSchema
};
