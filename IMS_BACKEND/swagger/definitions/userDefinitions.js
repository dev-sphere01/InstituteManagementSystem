/**
 * Swagger definitions for user-related endpoints
 */

const paths = {
  // Authentication endpoints
  '/users/register': {
    post: {
      summary: 'Register a new user',
      tags: ['Authentication'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['name', 'email', 'password'],
              properties: {
                name: {
                  type: 'string',
                  description: "User's name"
                },
                email: {
                  type: 'string',
                  format: 'email',
                  description: "User's email"
                },
                password: {
                  type: 'string',
                  format: 'password',
                  description: "User's password"
                }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: 'User registered successfully with full role data and permissions',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  user: {
                    $ref: '#/components/schemas/AuthUserResponse'
                  },
                  token: {
                    type: 'string',
                    description: 'JWT authentication token',
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                  }
                }
              },
              example: {
                "success": true,
                "user": {
                  "_id": "507f1f77bcf86cd799439011",
                  "name": "John Doe",
                  "email": "john@example.com",
                  "role": {
                    "_id": "507f1f77bcf86cd799439012",
                    "RoleName": "student",
                    "description": "Default role for new users with read-only permissions",
                    "level": 15,
                    "permissions": [
                      "user.read", "role.read", "dashboard.read",
                      "profile.read", "profile.update"
                    ],
                    "isActive": true
                  },
                  "isActive": true,
                  "lastLogin": null,
                  "loginAttempts": 0,
                  "avatar": {
                    "public_id": "default_id",
                    "url": "default_url"
                  },
                  "createdAt": "2024-01-01T00:00:00.000Z",
                  "updatedAt": "2024-01-01T00:00:00.000Z"
                },
                "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              }
            }
          }
        },
        400: { description: 'Validation error or email already exists' },
        500: { description: 'Server error' }
      }
    }
  },
  '/users/login': {
    post: {
      summary: 'Login a user (IMPORTANT: Use in browser, not in Swagger UI)',
      description: `
**IMPORTANT: To use protected endpoints, you need to be logged in**

1. Use the login form in the main application to log in
2. Alternatively, you can use this endpoint directly in your browser (not in Swagger UI)
3. After logging in, return to Swagger UI - you'll now be able to use protected endpoints

The server sets a cookie in your browser that will be used for authentication.

**Note:** If you try to execute this endpoint in Swagger UI, it won't set the cookie properly for authentication.
      `,
      tags: ['Authentication'],
      externalDocs: {
        description: 'Learn more about authentication',
        url: '#/components/securitySchemes/cookieAuth'
      },
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email', 'password'],
              properties: {
                email: {
                  type: 'string',
                  format: 'email',
                  description: "User's email"
                },
                password: {
                  type: 'string',
                  format: 'password',
                  description: "User's password"
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Login successful with full role data and permissions. Sets authentication cookie.',
          headers: {
            'Set-Cookie': {
              schema: {
                type: 'string',
                example: 'token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; Path=/; HttpOnly'
              },
              description: 'Authentication token stored in cookie'
            }
          },
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  user: {
                    $ref: '#/components/schemas/AuthUserResponse'
                  },
                  token: {
                    type: 'string',
                    description: 'JWT authentication token',
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                  }
                }
              },
              example: {
                "success": true,
                "user": {
                  "_id": "507f1f77bcf86cd799439011",
                  "name": "John Doe",
                  "email": "john@example.com",
                  "role": {
                    "_id": "507f1f77bcf86cd799439012",
                    "RoleName": "admin",
                    "description": "Administrator with full system access",
                    "level": 1,
                    "permissions": [
                      "user.create", "user.read", "user.update", "user.delete",
                      "role.create", "role.read", "role.update", "role.delete",
                      "dashboard.read", "settings.read", "settings.update",
                      "profile.read", "profile.update"
                    ],
                    "isActive": true
                  },
                  "isActive": true,
                  "lastLogin": "2024-01-15T10:30:00.000Z",
                  "loginAttempts": 0,
                  "avatar": {
                    "public_id": "default_id",
                    "url": "default_url"
                  },
                  "createdAt": "2024-01-01T00:00:00.000Z",
                  "updatedAt": "2024-01-01T00:00:00.000Z"
                },
                "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              }
            }
          }
        },
        401: {
          description: 'Invalid credentials',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false
                  },
                  message: {
                    type: 'string',
                    example: 'Invalid email or password'
                  }
                }
              }
            }
          }
        },
        403: {
          description: 'Account not active - inactive, suspended, or pending accounts cannot login',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false
                  },
                  message: {
                    type: 'string',
                    oneOf: [
                      { example: 'Your account is inactive. Please contact administrator to activate your account.' },
                      { example: 'Your account has been suspended. Please contact administrator for assistance.' },
                      { example: 'Your account is pending approval. Please wait for administrator approval.' }
                    ]
                  }
                }
              }
            }
          }
        },
        500: {
          description: 'Server error',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false
                  },
                  message: {
                    type: 'string',
                    example: 'Internal server error'
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  '/users/password/forgot': {
    post: {
      summary: 'Request password reset',
      tags: ['Authentication'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email'],
              properties: {
                email: {
                  type: 'string',
                  format: 'email',
                  description: "User's email"
                }
              }
            }
          }
        }
      },
      responses: {
        200: { description: 'Password reset email sent' },
        403: {
          description: 'Account not active - password reset not available for inactive accounts',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false
                  },
                  message: {
                    type: 'string',
                    example: 'Password reset is not available for inactive accounts. Please contact administrator.'
                  }
                }
              }
            }
          }
        },
        404: { description: 'User not found' },
        500: { description: 'Server error' }
      }
    }
  },
  '/users/password/reset/{token}': {
    put: {
      summary: 'Reset password with token',
      tags: ['Authentication'],
      parameters: [
        {
          in: 'path',
          name: 'token',
          required: true,
          schema: {
            type: 'string'
          },
          description: 'Password reset token'
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['password', 'confirmPassword'],
              properties: {
                password: {
                  type: 'string',
                  format: 'password',
                  description: 'New password'
                },
                confirmPassword: {
                  type: 'string',
                  format: 'password',
                  description: 'Confirm new password'
                }
              }
            }
          }
        }
      },
      responses: {
        200: { description: 'Password reset successful' },
        400: { description: 'Invalid token or passwords don\'t match' },
        403: {
          description: 'Account not active - password reset not available for inactive accounts',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false
                  },
                  message: {
                    type: 'string',
                    example: 'Password reset is not available for inactive accounts. Please contact administrator.'
                  }
                }
              }
            }
          }
        },
        500: { description: 'Server error' }
      }
    }
  },
  '/users/logout': {
    get: {
      summary: 'Logout a user',
      tags: ['Authentication'],
      responses: {
        200: { description: 'Logout successful' },
        500: { description: 'Server error' }
      }
    }
  },

  // User profile endpoints
  '/users/me': {
    get: {
      summary: 'Get current user profile',
      description: `
Returns the profile information of the currently authenticated user.

**Permission Required:** \`profile.read\`
      `,
      tags: ['User Profile'],
      security: [{ cookieAuth: [] }],
      responses: {
        200: {
          description: 'User profile retrieved successfully with full role data and permissions',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  user: {
                    $ref: '#/components/schemas/AuthUserResponse'
                  }
                }
              },
              example: {
                "success": true,
                "user": {
                  "_id": "681f9e096dd673b50215de8d",
                  "name": "Shivom",
                  "email": "shivom.verma.dev@gmail.com",
                  "role": {
                    "_id": "507f1f77bcf86cd799439012",
                    "RoleName": "admin",
                    "description": "Administrator with full system access",
                    "level": 1,
                    "permissions": [
                      "user.create", "user.read", "user.update", "user.delete",
                      "role.create", "role.read", "role.update", "role.delete",
                      "dashboard.read", "settings.read", "settings.update",
                      "profile.read", "profile.update"
                    ],
                    "isActive": true
                  },
                  "isActive": true,
                  "lastLogin": "2024-01-15T10:30:00.000Z",
                  "loginAttempts": 0,
                  "avatar": {
                    "public_id": "default_id",
                    "url": "default_url"
                  },
                  "createdAt": "2024-01-01T00:00:00.000Z",
                  "updatedAt": "2024-01-01T00:00:00.000Z"
                }
              }
            }
          }
        },
        401: {
          $ref: '#/components/responses/UnauthorizedError'
        },
        500: {
          description: 'Server error',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false
                  },
                  message: {
                    type: 'string',
                    example: 'Error fetching user profile'
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  '/users/password/change': {
    put: {
      summary: 'Change password',
      description: `
Change the current user's password.

**Permission Required:** \`profile.update\`
      `,
      tags: ['User Profile'],
      security: [{ cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['oldPassword', 'newPassword', 'confirmPassword'],
              properties: {
                oldPassword: {
                  type: 'string',
                  format: 'password',
                  description: 'Current password'
                },
                newPassword: {
                  type: 'string',
                  format: 'password',
                  description: 'New password'
                },
                confirmPassword: {
                  type: 'string',
                  format: 'password',
                  description: 'Confirm new password'
                }
              }
            }
          }
        }
      },
      responses: {
        200: { description: 'Password changed successfully' },
        400: { description: 'Validation error or passwords don\'t match' },
        401: { description: 'Not authenticated or incorrect old password' },
        403: {
          description: 'Account not active - password change not available for inactive accounts',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false
                  },
                  message: {
                    type: 'string',
                    example: 'Password change is not available for inactive accounts. Please contact administrator.'
                  }
                }
              }
            }
          }
        },
        500: { description: 'Server error' }
      }
    }
  },

  // Admin User Management Endpoints
  '/users/admin/user': {
    post: {
      summary: 'Create new user (Admin only)',
      description: `
Create a new user account with specified role and details.

**Permission Required:** \`user.create\`

**Features:**
- Create users with any available role
- Set initial user status
- Automatic audit logging
- Full role data population in response
      `,
      tags: ['User Management'],
      security: [{ cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['name', 'email', 'password'],
              properties: {
                name: {
                  type: 'string',
                  description: 'User full name',
                  example: 'John Doe'
                },
                email: {
                  type: 'string',
                  format: 'email',
                  description: 'User email address',
                  example: 'john.doe@example.com'
                },
                password: {
                  type: 'string',
                  format: 'password',
                  description: 'User password (minimum 6 characters)',
                  example: 'securePassword123'
                },
                role: {
                  type: 'string',
                  description: 'Role name or ObjectId (defaults to student if not provided)',
                  example: 'admin'
                },
                isActive: {
                  type: 'boolean',
                  description: 'User account active status',
                  example: true,
                  default: true
                }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: 'User created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  message: {
                    type: 'string',
                    example: 'User created successfully'
                  },
                  user: {
                    $ref: '#/components/schemas/AuthUserResponse'
                  }
                }
              },
              example: {
                "success": true,
                "message": "User created successfully",
                "user": {
                  "_id": "507f1f77bcf86cd799439011",
                  "name": "John Doe",
                  "email": "john.doe@example.com",
                  "role": {
                    "_id": "507f1f77bcf86cd799439012",
                    "RoleName": "admin",
                    "description": "Administrator with full system access",
                    "level": 1,
                    "permissions": [
                      "user.create", "user.read", "user.update", "user.delete",
                      "role.create", "role.read", "role.update", "role.delete",
                      "dashboard.read", "settings.read", "profile.read"
                    ],
                    "isActive": true
                  },
                  "isActive": true,
                  "lastLogin": null,
                  "loginAttempts": 0,
                  "avatar": {
                    "public_id": "default_id",
                    "url": "default_url"
                  },
                  "createdAt": "2024-01-15T10:30:00.000Z",
                  "updatedAt": "2024-01-15T10:30:00.000Z"
                }
              }
            }
          }
        },
        400: {
          description: 'Validation error or role not found',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false
                  },
                  message: {
                    type: 'string',
                    oneOf: [
                      { example: 'User already exists with this email' },
                      { example: 'Role \'invalid_role\' not found' },
                      { example: 'Password must be at least 6 characters' }
                    ]
                  }
                }
              }
            }
          }
        },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        500: { $ref: '#/components/responses/InternalServerError' }
      }
    }
  },

  '/users/admin/users': {
    get: {
      summary: 'Get all users with pagination and filtering',
      description: `
Get all users with comprehensive pagination, filtering, and search capabilities.

**Permission Required:** \`user.read\`

**Query Parameters:**
- \`page\` (number): Page number (default: 1)
- \`limit\` (number): Items per page (default: 10, max: 100)
- \`search\` (string): Global search across name and email
- \`name\` (string): Search by name (partial match)
- \`email\` (string): Search by email (partial match)
- \`isActive\` (boolean): Filter by active status (true/false)
- \`role\` (string): Filter by role name or ObjectId
- \`sortBy\` (string): Sort field (name, email, createdAt, updatedAt, isActive)
- \`sortOrder\` (string): Sort order (asc, desc)
      `,
      tags: ['User Management'],
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          in: 'query',
          name: 'page',
          schema: { type: 'integer', minimum: 1, default: 1 },
          description: 'Page number'
        },
        {
          in: 'query',
          name: 'limit',
          schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          description: 'Items per page'
        },
        {
          in: 'query',
          name: 'search',
          schema: { type: 'string' },
          description: 'Global search across name and email'
        },
        {
          in: 'query',
          name: 'isActive',
          schema: {
            type: 'boolean'
          },
          description: 'Filter by user active status'
        },
        {
          in: 'query',
          name: 'role',
          schema: { type: 'string' },
          description: 'Filter by role name or ObjectId'
        },
        {
          in: 'query',
          name: 'sortBy',
          schema: {
            type: 'string',
            enum: ['name', 'email', 'createdAt', 'updatedAt', 'isActive']
          },
          description: 'Sort field'
        },
        {
          in: 'query',
          name: 'sortOrder',
          schema: {
            type: 'string',
            enum: ['asc', 'desc'],
            default: 'desc'
          },
          description: 'Sort order'
        }
      ],
      responses: {
        200: {
          description: 'Users retrieved successfully with pagination and filtering',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  data: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/AuthUserResponse'
                    }
                  },
                  pagination: {
                    type: 'object',
                    properties: {
                      total: { type: 'integer', example: 150 },
                      page: { type: 'integer', example: 1 },
                      limit: { type: 'integer', example: 10 },
                      totalPages: { type: 'integer', example: 15 },
                      hasNextPage: { type: 'boolean', example: true },
                      hasPrevPage: { type: 'boolean', example: false },
                      nextPage: { type: 'integer', example: 2 },
                      prevPage: { type: 'integer', example: null }
                    }
                  },
                  filters: {
                    type: 'object',
                    properties: {
                      applied: { type: 'object' },
                      search: { type: 'string' },
                      isActive: { type: 'boolean' },
                      role: { type: 'string' }
                    }
                  },
                  sort: {
                    type: 'object',
                    example: { "createdAt": -1 }
                  }
                }
              }
            }
          }
        },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        500: { $ref: '#/components/responses/InternalServerError' }
      }
    }
  },

  '/users/admin/user/{id}': {
    get: {
      summary: 'Get user by ID',
      description: `
Get detailed information about a specific user by their ID.

**Permission Required:** \`user.read\`
      `,
      tags: ['User Management'],
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'string',
            pattern: '^[0-9a-fA-F]{24}$'
          },
          description: 'User ID (MongoDB ObjectId)'
        }
      ],
      responses: {
        200: {
          description: 'User retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  user: {
                    $ref: '#/components/schemas/AuthUserResponse'
                  }
                }
              }
            }
          }
        },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: { $ref: '#/components/responses/NotFound' },
        500: { $ref: '#/components/responses/InternalServerError' }
      }
    },
    put: {
      summary: 'Update user details',
      description: `
Update a user's comprehensive information including role, status, and profile details.

**Supported Fields:**
- \`name\` - User's display name
- \`email\` - User's email address
- \`role\` - Role ID (ObjectId) or role name (student, user, admin, manager)
- \`isActive\` - Account active status (boolean)
- \`avatar\` - User avatar with public_id and url

**Role Assignment:**
- Accepts both MongoDB ObjectId (24 hex characters) and role names
- Role must exist and be active
- Examples: \`"507f1f77bcf86cd799439011"\` or \`"admin"\`

**Permission Required:** \`user.update\`
      `,
      tags: ['User Management'],
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'string',
            pattern: '^[0-9a-fA-F]{24}$'
          },
          description: 'User ID (MongoDB ObjectId)'
        }
      ],
      requestBody: {
        required: false,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  minLength: 2,
                  maxLength: 100,
                  description: 'User display name',
                  example: 'John Doe'
                },
                email: {
                  type: 'string',
                  format: 'email',
                  description: 'User email address',
                  example: 'john.doe@example.com'
                },
                role: {
                  type: 'string',
                  description: 'Role ID (ObjectId) or role name',
                  oneOf: [
                    {
                      pattern: '^[0-9a-fA-F]{24}$',
                      example: '507f1f77bcf86cd799439011'
                    },
                    {
                      enum: ['student', 'user', 'admin', 'manager'],
                      example: 'admin'
                    }
                  ]
                },
                isActive: {
                  type: 'boolean',
                  description: 'User account active status',
                  example: true
                },
                avatar: {
                  type: 'object',
                  description: 'User avatar information',
                  properties: {
                    public_id: {
                      type: 'string',
                      description: 'Avatar public ID',
                      example: 'user_avatars/abc123'
                    },
                    url: {
                      type: 'string',
                      format: 'uri',
                      description: 'Avatar image URL',
                      example: 'https://example.com/avatars/user123.jpg'
                    }
                  }
                }
              },
              example: {
                name: 'John Doe Updated',
                email: 'john.updated@example.com',
                role: '507f1f77bcf86cd799439011',
                isActive: true,
                avatar: {
                  public_id: 'user_avatars/john_doe',
                  url: 'https://example.com/avatars/john_doe.jpg'
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'User updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  message: {
                    type: 'string',
                    example: 'User updated successfully'
                  },
                  user: {
                    $ref: '#/components/schemas/AuthUserResponse'
                  }
                }
              },
              example: {
                success: true,
                message: 'User updated successfully',
                user: {
                  _id: '507f1f77bcf86cd799439011',
                  name: 'John Doe Updated',
                  email: 'john.updated@example.com',
                  role: {
                    _id: '507f1f77bcf86cd799439012',
                    RoleName: 'admin',
                    description: 'Administrator with full system access',
                    level: 1,
                    permissions: ['user.create', 'user.read', 'user.update', 'user.delete'],
                    isActive: true
                  },
                  isActive: true,
                  lastLogin: '2024-01-15T10:30:00.000Z',
                  loginAttempts: 0,
                  avatar: {
                    public_id: 'user_avatars/john_doe',
                    url: 'https://example.com/avatars/john_doe.jpg'
                  },
                  createdAt: '2024-01-01T00:00:00.000Z',
                  updatedAt: '2024-01-15T12:00:00.000Z'
                }
              }
            }
          }
        },
        400: {
          description: 'Validation error or invalid role',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: {
                    type: 'string',
                    oneOf: [
                      { example: 'Role with ID \'invalid_id\' not found' },
                      { example: 'Role \'invalid_role\' not found' },
                      { example: 'Role \'inactive_role\' is inactive' },
                      { example: 'Name must be between 2 and 100 characters' },
                      { example: 'Invalid email format' }
                    ]
                  }
                }
              }
            }
          }
        },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: {
          description: 'User not found',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'User not found' }
                }
              }
            }
          }
        },
        500: { $ref: '#/components/responses/InternalServerError' }
      }
    }
  }
};

module.exports = {
  paths
};
