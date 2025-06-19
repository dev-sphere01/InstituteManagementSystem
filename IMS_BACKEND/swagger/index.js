/**
 * Main Swagger configuration file
 * This file combines all the Swagger definitions from different modules
 */

const swaggerJsdoc = require('swagger-jsdoc');

// Import Swagger definitions from modules
const userDefinitions = require('./definitions/userDefinitions');
const adminDefinitions = require('./definitions/adminDefinitions');
const logDefinitions = require('./definitions/logDefinitions');
const enquiryDefinations = require('./definitions/enquiryDefinations')

// Import Swagger paths
const rolePaths = require('./paths/rolePaths');

// Swagger definition
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'User Authentication & Permission Management API',
      version: '1.0.0',
      description: `
## Authentication & Permission Management API Documentation

This API provides comprehensive user authentication, role-based access control, and permission management functionality.

### Features
- **User Authentication** - Login, registration, password management
- **Role-Based Access Control** - Hierarchical roles with permission inheritance
- **Module-wise Permissions** - Granular permissions for different modules (user, role, admin, etc.)
- **Audit Logging** - Complete audit trail for all user actions and permission changes

### Important Authentication Instructions
To use protected endpoints (marked with 🔒):

1. **First, login to the application** by using the login form in the main application
2. Alternatively, you can use the \`POST /users/login\` endpoint directly in your browser (not in Swagger UI)
3. After logging in, return to Swagger UI - you'll now be able to use protected endpoints
4. The authentication is handled via cookies, so you must be logged in to use protected endpoints

### Permission System
- **Permissions** follow the format: \`module.action\` (e.g., \`user.create\`, \`role.manage\`)
- **Roles** are collections of permissions with hierarchical levels (1-100)
- **Users** are assigned roles and inherit all permissions from their role

**Note:** The "Authorize" button in Swagger UI won't work for authentication as it doesn't handle cookies properly.
      `,
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC',
      },
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
    },
    servers: [
      {
        url: '/api/v1',
        description: 'API v1',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
          description: `
## Cookie-based Authentication

This API uses cookies for authentication. Follow these steps:

1. **Login to the application first** using the main application login form
2. Alternatively, use the \`POST /users/login\` endpoint directly in your browser (not in Swagger UI)
3. After logging in, return to Swagger UI - you'll now be authenticated for protected endpoints
4. Protected endpoints (marked with 🔒) require authentication

**Important Notes:**
- The "Authorize" button in Swagger UI won't work for authentication
- You must be logged in to the application to use protected endpoints
- Swagger UI itself doesn't handle the authentication, it relies on your browser's cookies
          `,
        },
      },
      responses: {
        BadRequest: {
          description: 'Bad request - Invalid input data',
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
                    example: 'Invalid input data provided'
                  },
                  errors: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        field: { type: 'string', example: 'email' },
                        message: { type: 'string', example: 'Email is required' }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        Unauthorized: {
          description: 'Authentication information is missing or invalid',
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
                    example: 'Please login to access this resource'
                  }
                }
              }
            }
          }
        },
        Forbidden: {
          description: 'User does not have permission to access this resource',
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
                    example: 'Access denied. Your role does not have permission to access this resource.'
                  }
                }
              }
            }
          }
        },
        NotFound: {
          description: 'Resource not found',
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
                    example: 'Resource not found'
                  }
                }
              }
            }
          }
        },
        InternalServerError: {
          description: 'Internal server error',
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
                    example: 'Internal server error occurred'
                  }
                }
              }
            }
          }
        },
        // Legacy response names for backward compatibility
        UnauthorizedError: {
          description: 'Authentication information is missing or invalid',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false
                  },
                  statusCode: {
                    type: 'integer',
                    example: 401
                  },
                  message: {
                    type: 'string',
                    example: 'Please login to access this resource'
                  }
                }
              }
            }
          }
        },
        ForbiddenError: {
          description: 'User does not have permission to access this resource',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false
                  },
                  statusCode: {
                    type: 'integer',
                    example: 403
                  },
                  message: {
                    type: 'string',
                    example: 'Access denied. Your role does not have permission to access this resource.'
                  }
                }
              }
            }
          }
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'User ID',
            },
            name: {
              type: 'string',
              description: 'User name',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email',
            },
            role: {
              oneOf: [
                { type: 'string', description: 'Role ID' },
                { $ref: '#/components/schemas/Role' }
              ],
              description: 'User role (ID or populated role object)',
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'suspended', 'pending'],
              description: 'User account status',
              default: 'active'
            },
            avatar: {
              type: 'object',
              properties: {
                public_id: {
                  type: 'string',
                  description: 'Avatar public ID',
                },
                url: {
                  type: 'string',
                  description: 'Avatar URL',
                },
              },
            },
            lastLogin: {
              type: 'string',
              format: 'date-time',
              description: 'Last login timestamp',
              nullable: true
            },
            loginAttempts: {
              type: 'integer',
              description: 'Number of failed login attempts',
              default: 0
            },
            lockUntil: {
              type: 'string',
              format: 'date-time',
              description: 'Account locked until this timestamp',
              nullable: true
            },

            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'User creation date',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'User last update date',
            }
          },
          required: ['_id', 'name', 'email', 'role', 'status']
        },

        Role: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Role ID'
            },
            RoleName: {
              type: 'string',
              description: 'Role name'
            },
            description: {
              type: 'string',
              description: 'Role description'
            },
            level: {
              type: 'integer',
              description: 'Role hierarchy level (1-100)',
              minimum: 1,
              maximum: 100
            },
            permissions: {
              type: 'array',
              items: {
                type: 'string',
                pattern: '^[a-z]+\\.[a-z]+$',
                description: 'Permission name in format module.action'
              },
              description: 'Array of permission names assigned to this role (string-based permissions)',
              example: [
                'user.create', 'user.read', 'user.update', 'user.delete',
                'role.create', 'role.read', 'role.update', 'role.delete',
                'dashboard.read', 'profile.read', 'profile.update',
                'settings.read', 'log.read', 'admin.read'
              ]
            },
            isActive: {
              type: 'boolean',
              description: 'Whether this role is active',
              default: true
            },
            isSystem: {
              type: 'boolean',
              description: 'Whether this is a system role (cannot be deleted)',
              default: false
            },
            createdBy: {
              oneOf: [
                { type: 'string', description: 'User ID' },
                {
                  type: 'object',
                  properties: {
                    _id: { type: 'string' },
                    name: { type: 'string' },
                    email: { type: 'string' }
                  }
                }
              ],
              description: 'User who created this role (ID or populated user object)',
              nullable: true
            },
            updatedBy: {
              oneOf: [
                { type: 'string', description: 'User ID' },
                {
                  type: 'object',
                  properties: {
                    _id: { type: 'string' },
                    name: { type: 'string' },
                    email: { type: 'string' }
                  }
                }
              ],
              description: 'User who last updated this role (ID or populated user object)',
              nullable: true
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Role creation date'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Role last update date'
            }
          },
          required: ['_id', 'RoleName', 'description', 'level']
        },

        // Authentication Response Schema - User with populated role data
        AuthUserResponse: {
          type: 'object',
          description: 'User object returned in authentication responses with full role data and permissions',
          properties: {
            _id: {
              type: 'string',
              description: 'User ID',
              example: '507f1f77bcf86cd799439011'
            },
            name: {
              type: 'string',
              description: 'User name',
              example: 'John Doe'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email',
              example: 'john@example.com'
            },
            role: {
              type: 'object',
              description: 'Complete role object with permissions',
              properties: {
                _id: {
                  type: 'string',
                  description: 'Role ID',
                  example: '507f1f77bcf86cd799439012'
                },
                RoleName: {
                  type: 'string',
                  description: 'Role name',
                  example: 'admin'
                },
                description: {
                  type: 'string',
                  description: 'Role description',
                  example: 'Administrator with full system access'
                },
                level: {
                  type: 'integer',
                  description: 'Role hierarchy level',
                  example: 1
                },
                permissions: {
                  type: 'array',
                  items: {
                    type: 'string'
                  },
                  description: 'Array of permission names',
                  example: [
                    'user.create', 'user.read', 'user.update', 'user.delete',
                    'role.create', 'role.read', 'role.update', 'role.delete',
                    'dashboard.read', 'settings.read', 'settings.update',
                    'profile.read', 'profile.update'
                  ]
                },
                isActive: {
                  type: 'boolean',
                  description: 'Whether role is active',
                  example: true
                }
              },
              required: ['_id', 'RoleName', 'description', 'level', 'permissions', 'isActive']
            },
            isActive: {
              type: 'boolean',
              description: 'User account active status',
              example: true
            },

            lastLogin: {
              type: 'string',
              format: 'date-time',
              description: 'Last login timestamp',
              example: '2024-01-15T10:30:00.000Z',
              nullable: true
            },
            loginAttempts: {
              type: 'integer',
              description: 'Number of failed login attempts',
              example: 0
            },
            avatar: {
              type: 'object',
              properties: {
                public_id: {
                  type: 'string',
                  description: 'Avatar public ID',
                  example: 'default_id'
                },
                url: {
                  type: 'string',
                  description: 'Avatar URL',
                  example: 'default_url'
                }
              }
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'User creation date',
              example: '2024-01-01T00:00:00.000Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'User last update date',
              example: '2024-01-01T00:00:00.000Z'
            }
          },
          required: ['_id', 'name', 'email', 'role', 'isActive']
        },

        // Enquiry schemas
        Enquiry: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Enquiry ID',
            },
            userId: {
              type: 'string',
              description: 'ID of the user who made the enquiry',
            },
            productId: {
              type: 'string',
              description: 'ID of the product related to the enquiry',
            },
            message: {
              type: 'string',
              description: 'Enquiry message',
            },
            status: {
              type: 'string',
              enum: ['open', 'in_progress', 'closed'],
              description: 'Status of the enquiry',
              default: 'open'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Enquiry creation date',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Enquiry last update date',
            }
          },
          required: ['_id', 'userId', 'productId', 'message', 'status']
        },

        EnquiryResponse: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Enquiry ID',
              example: '507f1f77bcf86cd799439011'
            },
            userId: {
              type: 'string',
              description: 'ID of the user who made the enquiry',
              example: '507f1f77bcf86cd799439012'
            },
            productId: {
              type: 'string',
              description: 'ID of the product related to the enquiry',
              example: '507f1f77bcf86cd799439013'
            },
            message: {
              type: 'string',
              description: 'Enquiry message',
              example: 'I am interested in this product. Can you provide more details?'
            },
            status: {
              type: 'string',
              enum: ['open', 'in_progress', 'closed'],
              description: 'Status of the enquiry',
              example: 'open'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Enquiry creation date',
              example: '2024-01-01T00:00:00.000Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Enquiry last update date',
              example: '2024-01-01T00:00:00.000Z'
            }
          },
          required: ['_id', 'userId', 'productId', 'message', 'status']
        },

        EnquiryUpdate: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['open', 'in_progress', 'closed'],
              description: 'Status of the enquiry',
            },
            message: {
              type: 'string',
              description: 'Updated enquiry message',
            },
          },
          required: ['status']
        },

      },
      tags: [
        {
          name: 'Authentication',
          description: 'User authentication endpoints (login, register, password reset)',
        },
        {
          name: 'User',
          description: 'User profile and management endpoints',
        },
        {
          name: 'Admin',
          description: 'Administrative endpoints for user management, search, and statistics',
        },
        {
          name: 'Role Management',
          description: 'Complete role management system with CRUD operations, search, statistics, and permission assignment',
        },
        {
          name: 'Logs',
          description: 'System and audit logs endpoints',
        },
        {
          name: 'Enquiries',
          description: 'Product enquiry management endpoints',
        },
      ],
    },
    paths: {
      // Combine paths from all modules
      ...userDefinitions.paths,
      ...enquiryDefinations.paths,
      ...adminDefinitions.paths,
      ...logDefinitions.paths,
      ...rolePaths,
    }
  },
  // Path to the API docs - not needed when we define paths directly
  apis: [],
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = swaggerSpec;
