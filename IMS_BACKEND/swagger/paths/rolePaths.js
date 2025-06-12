/**
 * Swagger paths for Role management endpoints
 * Updated for new role structure with permission names as strings
 */

const rolePaths = {
  '/roles': {
    get: {
      tags: ['Role Management'],
      summary: 'Get all roles with pagination and filtering',
      description: `
Get all roles in the system with comprehensive filtering and pagination options.

**Features:**
- Pagination with configurable page size
- Search across role name and description
- Filter by level, active status, and system status
- Sort by multiple fields
- Includes user references and permission counts

**Permission Required:** \`role.read\`
      `,
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'page',
          in: 'query',
          description: 'Page number for pagination',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1
          }
        },
        {
          name: 'limit',
          in: 'query',
          description: 'Number of items per page',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 10
          }
        },
        {
          name: 'search',
          in: 'query',
          description: 'Search in role name and description',
          required: false,
          schema: {
            type: 'string'
          }
        },
        {
          name: 'level',
          in: 'query',
          description: 'Filter by minimum role level',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100
          }
        },
        {
          name: 'isActive',
          in: 'query',
          description: 'Filter by active status',
          required: false,
          schema: {
            type: 'boolean'
          }
        },
        {
          name: 'isSystem',
          in: 'query',
          description: 'Filter by system role status',
          required: false,
          schema: {
            type: 'boolean'
          }
        },
        {
          name: 'sortBy',
          in: 'query',
          description: 'Field to sort by',
          required: false,
          schema: {
            type: 'string',
            enum: ['RoleName', 'level', 'createdAt', 'updatedAt'],
            default: 'level'
          }
        },
        {
          name: 'sortOrder',
          in: 'query',
          description: 'Sort order',
          required: false,
          schema: {
            type: 'string',
            enum: ['asc', 'desc'],
            default: 'asc'
          }
        }
      ],
      responses: {
        200: {
          description: 'Roles retrieved successfully with pagination and filtering',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Role' }
                  },
                  pagination: {
                    type: 'object',
                    properties: {
                      total: { type: 'integer', example: 5 },
                      page: { type: 'integer', example: 1 },
                      limit: { type: 'integer', example: 10 },
                      totalPages: { type: 'integer', example: 1 },
                      hasNextPage: { type: 'boolean', example: false },
                      hasPrevPage: { type: 'boolean', example: false },
                      nextPage: { type: 'integer', nullable: true, example: null },
                      prevPage: { type: 'integer', nullable: true, example: null }
                    }
                  },
                  filters: {
                    type: 'object',
                    properties: {
                      applied: { type: 'object', example: { "isActive": true } },
                      search: { type: 'string', nullable: true, example: null },
                      level: { type: 'integer', nullable: true, example: null },
                      isActive: { type: 'boolean', nullable: true, example: true },
                      isSystem: { type: 'boolean', nullable: true, example: null }
                    }
                  },
                  sort: {
                    type: 'object',
                    example: { "level": 1 }
                  }
                }
              },
              example: {
                "success": true,
                "data": [
                  {
                    "_id": "admin_role_id",
                    "RoleName": "admin",
                    "description": "Administrator with full system access",
                    "level": 1,
                    "isActive": true,
                    "isSystem": true,
                    "permissions": [
                      "user.create", "user.read", "user.update", "user.delete",
                      "role.create", "role.read", "role.update", "role.delete",
                      "admin.create", "admin.read", "admin.update", "admin.delete",
                      "dashboard.read", "settings.read", "settings.update",
                      "reports.create", "reports.read", "reports.export",
                      "log.read", "log.delete", "log.export",
                      "profile.read", "profile.update"
                    ],
                    "createdBy": {
                      "_id": "admin_user_id",
                      "name": "System Admin",
                      "email": "admin@example.com"
                    },
                    "createdAt": "2024-01-01T00:00:00.000Z",
                    "updatedAt": "2024-01-01T00:00:00.000Z"
                  }
                ],
                "pagination": {
                  "total": 5,
                  "page": 1,
                  "limit": 10,
                  "totalPages": 1,
                  "hasNextPage": false,
                  "hasPrevPage": false,
                  "nextPage": null,
                  "prevPage": null
                }
              }
            }
          }
        },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        500: { $ref: '#/components/responses/InternalServerError' }
      }
    },
    post: {
      tags: ['Role Management'],
      summary: 'Create new role',
      description: `
Create a new role in the system with specified permissions.

**Features:**
- Validates role name uniqueness
- Validates permission names against existing permissions
- Sets default level and active status
- Supports system role creation
- Automatic audit logging

**Permission Required:** \`role.create\`
      `,
      security: [{ cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['RoleName', 'description'],
              properties: {
                RoleName: {
                  type: 'string',
                  description: 'Unique role name',
                  example: 'manager'
                },
                description: {
                  type: 'string',
                  description: 'Role description',
                  example: 'Manager role with limited admin access'
                },
                level: {
                  type: 'integer',
                  minimum: 1,
                  maximum: 100,
                  description: 'Role hierarchy level (1 = highest)',
                  example: 50,
                  default: 1
                },
                isActive: {
                  type: 'boolean',
                  description: 'Whether the role is active',
                  example: true,
                  default: true
                },
                isSystem: {
                  type: 'boolean',
                  description: 'Whether this is a system role (cannot be deleted)',
                  example: false,
                  default: false
                },
                permissions: {
                  type: 'array',
                  items: {
                    type: 'string',
                    pattern: '^[a-z]+\\.[a-z]+$'
                  },
                  description: 'Array of permission names in format module.action',
                  example: [
                    'user.read', 'user.update', 'role.read',
                    'dashboard.read', 'reports.read', 'reports.create',
                    'profile.read', 'profile.update'
                  ]
                }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Role created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Role created successfully' },
                  role: { $ref: '#/components/schemas/Role' }
                }
              },
              example: {
                "success": true,
                "message": "Role created successfully",
                "role": {
                  "_id": "role_id_here",
                  "RoleName": "manager",
                  "description": "Manager role with limited admin access",
                  "level": 50,
                  "isActive": true,
                  "isSystem": false,
                  "permissions": [
                    "user.read", "user.update", "role.read",
                    "dashboard.read", "reports.read", "reports.create",
                    "profile.read", "profile.update"
                  ],
                  "createdBy": {
                    "_id": "admin_user_id",
                    "name": "Admin User",
                    "email": "admin@example.com"
                  },
                  "createdAt": "2024-01-01T00:00:00.000Z",
                  "updatedAt": "2024-01-01T00:00:00.000Z"
                }
              }
            }
          }
        },
        400: {
          description: 'Bad Request - Validation errors',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: {
                    type: 'string',
                    oneOf: [
                      { example: 'Role name already exists' },
                      { example: 'Invalid permissions: invalid.permission' }
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

  '/roles/{id}': {
    get: {
      tags: ['Role Management'],
      summary: 'Get role by ID',
      description: `
Retrieve a single role by its ID with complete details including permissions and user references.

**Features:**
- Returns complete role information
- Includes permission list as strings
- Populated user references (createdBy, updatedBy)
- Shows system role status

**Permission Required:** \`role.read\`
      `,
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Role ID (MongoDB ObjectId)',
          schema: {
            type: 'string',
            pattern: '^[0-9a-fA-F]{24}$',
            example: '507f1f77bcf86cd799439011'
          }
        }
      ],
      responses: {
        200: {
          description: 'Role retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  role: { $ref: '#/components/schemas/Role' }
                }
              },
              example: {
                "success": true,
                "role": {
                  "_id": "507f1f77bcf86cd799439011",
                  "RoleName": "admin",
                  "description": "Administrator with full system access",
                  "level": 1,
                  "isActive": true,
                  "isSystem": true,
                  "permissions": [
                    "user.create", "user.read", "user.update", "user.delete",
                    "role.create", "role.read", "role.update", "role.delete",
                    "admin.create", "admin.read", "admin.update", "admin.delete",
                    "dashboard.read", "settings.read", "settings.update",
                    "reports.create", "reports.read", "reports.export",
                    "log.read", "log.delete", "log.export",
                    "profile.read", "profile.update"
                  ],
                  "createdBy": {
                    "_id": "admin_user_id",
                    "name": "System Admin",
                    "email": "admin@example.com"
                  },
                  "updatedBy": {
                    "_id": "admin_user_id",
                    "name": "System Admin",
                    "email": "admin@example.com"
                  },
                  "createdAt": "2024-01-01T00:00:00.000Z",
                  "updatedAt": "2024-01-01T00:00:00.000Z"
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
      tags: ['Role Management'],
      summary: 'Update role',
      description: `
Update an existing role with new information and permissions.

**Features:**
- Update role name, description, level, and status
- Replace or modify permission list
- **System Role Protection**: System roles cannot have their name or level changed
- Automatic audit logging
- Validates permission names

**System Role Restrictions:**
- ❌ Cannot change \`RoleName\`
- ❌ Cannot change \`level\`
- ❌ Cannot change \`isSystem\` from true to false
- ✅ Can change \`description\`
- ✅ Can change \`permissions\`
- ✅ Can change \`isActive\`

**Permission Required:** \`role.update\`
      `,
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Role ID (MongoDB ObjectId)',
          schema: {
            type: 'string',
            pattern: '^[0-9a-fA-F]{24}$',
            example: '507f1f77bcf86cd799439011'
          }
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                RoleName: {
                  type: 'string',
                  description: '⚠️ Role name (CANNOT be changed for system roles)',
                  example: 'senior-manager'
                },
                description: {
                  type: 'string',
                  description: 'Updated role description',
                  example: 'Updated manager role description'
                },
                level: {
                  type: 'integer',
                  minimum: 1,
                  maximum: 100,
                  description: '⚠️ Role hierarchy level (CANNOT be changed for system roles)',
                  example: 55
                },
                isActive: {
                  type: 'boolean',
                  description: 'Whether the role is active',
                  example: true
                },
                isSystem: {
                  type: 'boolean',
                  description: '⚠️ Whether this is a system role (CANNOT be changed from true to false)',
                  example: false
                },
                permissions: {
                  type: 'array',
                  items: {
                    type: 'string',
                    pattern: '^[a-z]+\\.[a-z]+$'
                  },
                  description: 'Updated array of permission names',
                  example: [
                    'user.read', 'user.update', 'user.create', 'role.read',
                    'dashboard.read', 'reports.read', 'reports.create', 'reports.export',
                    'profile.read', 'profile.update'
                  ]
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Role updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Role updated successfully' },
                  role: { $ref: '#/components/schemas/Role' }
                }
              }
            }
          }
        },
        400: {
          description: 'Bad Request - Validation or system role protection',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: {
                    type: 'string',
                    oneOf: [
                      { example: 'Cannot modify system role name' },
                      { example: 'Cannot modify system role level' },
                      { example: 'Cannot change system role to non-system role' },
                      { example: 'Role name already exists' },
                      { example: 'Invalid permissions: invalid.permission' }
                    ]
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
    delete: {
      tags: ['Role Management'],
      summary: 'Delete role',
      description: `
Delete an existing role from the system.

**System Role Protection:**
- ❌ System roles (isSystem: true) CANNOT be deleted
- ❌ Roles with assigned users cannot be deleted
- ✅ Only custom roles without user assignments can be deleted

**Permission Required:** \`role.delete\`
      `,
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Role ID',
          schema: {
            type: 'string',
            example: '507f1f77bcf86cd799439011'
          }
        }
      ],
      responses: {
        200: {
          description: 'Role deleted successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Role deleted successfully' }
                }
              }
            }
          }
        },
        400: {
          description: 'Role cannot be deleted',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: {
                    type: 'string',
                    oneOf: [
                      { example: "Cannot delete system role 'admin'. System roles are protected and cannot be removed." },
                      { example: 'Cannot delete role. 5 users are assigned to this role' }
                    ]
                  },
                  userCount: { type: 'integer', example: 5 }
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
    }
  },

  '/roles/stats': {
    get: {
      tags: ['Role Management'],
      summary: 'Get role statistics',
      description: `
Get comprehensive statistics about roles in the system.

**Features:**
- Total role counts (active, system, custom)
- Role distribution by level
- User assignment statistics by role
- Permission distribution statistics

**Permission Required:** \`role.read\`
      `,
      security: [{ cookieAuth: [] }],
      responses: {
        200: {
          description: 'Role statistics retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  stats: {
                    type: 'object',
                    properties: {
                      total: { type: 'integer', example: 5 },
                      active: { type: 'integer', example: 4 },
                      system: { type: 'integer', example: 2 },
                      custom: { type: 'integer', example: 3 },
                      rolesByLevel: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            _id: { type: 'string', example: 'High (80-100)' },
                            count: { type: 'integer', example: 1 }
                          }
                        }
                      },
                      usersByRole: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            _id: { type: 'string', example: 'admin' },
                            count: { type: 'integer', example: 2 },
                            level: { type: 'integer', example: 1 }
                          }
                        }
                      },
                      permissionStats: {
                        type: 'object',
                        properties: {
                          avgPermissions: { type: 'number', example: 12.5 },
                          maxPermissions: { type: 'integer', example: 25 },
                          minPermissions: { type: 'integer', example: 5 }
                        }
                      }
                    }
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

  '/roles/search': {
    get: {
      tags: ['Role Management'],
      summary: 'Advanced role search',
      description: `
Search roles with advanced filtering and aggregation capabilities.

**Permission Required:** \`role.read\`
      `,
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          in: 'query',
          name: 'query',
          schema: { type: 'string' },
          description: 'Search term for role name and description'
        },
        {
          in: 'query',
          name: 'level',
          schema: { type: 'integer', minimum: 1, maximum: 100 },
          description: 'Filter by minimum role level'
        },
        {
          in: 'query',
          name: 'isActive',
          schema: { type: 'boolean' },
          description: 'Filter by active status'
        },
        {
          in: 'query',
          name: 'isSystem',
          schema: { type: 'boolean' },
          description: 'Filter by system role status'
        },
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
        }
      ],
      responses: {
        200: {
          description: 'Search results retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Role' }
                  },
                  pagination: {
                    type: 'object',
                    properties: {
                      total: { type: 'integer' },
                      page: { type: 'integer' },
                      limit: { type: 'integer' },
                      totalPages: { type: 'integer' },
                      hasNextPage: { type: 'boolean' },
                      hasPrevPage: { type: 'boolean' }
                    }
                  },
                  searchCriteria: { type: 'object' }
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
  }
};

module.exports = rolePaths;
