# Role Management API Examples

This document provides comprehensive examples for using the Role Management API endpoints.

## Base URL
All role endpoints are prefixed with `/api/v1/roles`

## Authentication & Permissions
All endpoints require:
- **Authentication**: Valid JWT token (admin login required)
- **Permissions**: Specific role permissions as noted for each endpoint

---

## 📋 **API Endpoints**

### 1. **Create Role**
**POST** `/api/v1/roles`
**Permission Required**: `role.create`

#### Request Body:
```json
{
  "RoleName": "manager",
  "description": "Manager role with limited admin access",
  "level": 50,
  "isActive": true,
  "isSystem": false,
  "permissions": [
    "user.read",
    "user.update", 
    "role.read",
    "dashboard.read",
    "reports.read",
    "reports.create",
    "profile.read",
    "profile.update"
  ]
}
```

#### Response:
```json
{
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
```

---

### 2. **Get All Roles**
**GET** `/api/v1/roles`
**Permission Required**: `role.read`

#### Query Parameters:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `search` (string): Search in role name and description
- `level` (number): Filter by minimum level
- `isActive` (boolean): Filter by active status
- `isSystem` (boolean): Filter by system status
- `sortBy` (string): Sort field (level, RoleName, createdAt)
- `sortOrder` (string): Sort order (asc, desc)

#### Example Requests:
```bash
# Basic pagination
GET /api/v1/roles?page=1&limit=10

# Search roles
GET /api/v1/roles?search=admin

# Filter by level and status
GET /api/v1/roles?level=50&isActive=true&sortBy=level&sortOrder=asc

# Get system roles only
GET /api/v1/roles?isSystem=true
```

#### Response:
```json
{
  "success": true,
  "data": [
    {
      "_id": "admin_role_id",
      "RoleName": "admin",
      "description": "Administrator with full system access",
      "level": 1,
      "isActive": true,
      "isSystem": true,
      "permissions": ["user.create", "user.read", "..."],
      "createdBy": { "name": "System", "email": "system@example.com" },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  },
  "filters": {
    "applied": { "isActive": true },
    "search": null
  },
  "sort": { "level": 1 }
}
```

---

### 3. **Get Role by ID**
**GET** `/api/v1/roles/:id`
**Permission Required**: `role.read`

#### Example Request:
```bash
GET /api/v1/roles/507f1f77bcf86cd799439011
```

#### Response:
```json
{
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
```

---

### 4. **Update Role**
**PUT** `/api/v1/roles/:id`
**Permission Required**: `role.update`

#### Request Body:
```json
{
  "description": "Updated manager role description",
  "level": 55,
  "isActive": true,
  "permissions": [
    "user.read",
    "user.update",
    "user.create",
    "role.read",
    "dashboard.read",
    "reports.read",
    "reports.create",
    "reports.export",
    "profile.read",
    "profile.update"
  ]
}
```

#### Response:
```json
{
  "success": true,
  "message": "Role updated successfully",
  "role": {
    "_id": "role_id_here",
    "RoleName": "manager",
    "description": "Updated manager role description",
    "level": 55,
    "isActive": true,
    "permissions": [
      "user.read", "user.update", "user.create", "role.read",
      "dashboard.read", "reports.read", "reports.create", "reports.export",
      "profile.read", "profile.update"
    ],
    "updatedBy": {
      "_id": "admin_user_id",
      "name": "Admin User",
      "email": "admin@example.com"
    },
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

---

### 5. **Delete Role**
**DELETE** `/api/v1/roles/:id`
**Permission Required**: `role.delete`

#### Example Request:
```bash
DELETE /api/v1/roles/507f1f77bcf86cd799439011
```

#### Success Response:
```json
{
  "success": true,
  "message": "Role deleted successfully",
  "deletedRole": {
    "_id": "507f1f77bcf86cd799439011",
    "RoleName": "manager",
    "description": "Manager role with limited admin access"
  }
}
```

#### Error Responses:
```json
// System role protection
{
  "success": false,
  "message": "Cannot delete system role"
}

// Users assigned to role
{
  "success": false,
  "message": "Cannot delete role. 5 users are assigned to this role"
}
```

---

### 6. **Get Role Statistics**
**GET** `/api/v1/roles/stats`
**Permission Required**: `role.read`

#### Response:
```json
{
  "success": true,
  "stats": {
    "total": 5,
    "active": 4,
    "system": 2,
    "custom": 3,
    "rolesByLevel": [
      { "_id": "High (80-100)", "count": 1 },
      { "_id": "Medium (50-79)", "count": 2 },
      { "_id": "Low (20-49)", "count": 1 },
      { "_id": "Basic (1-19)", "count": 1 }
    ],
    "usersByRole": [
      { "_id": "admin", "count": 2, "level": 1 },
      { "_id": "student", "count": 150, "level": 15 },
      { "_id": "manager", "count": 10, "level": 50 }
    ],
    "permissionStats": {
      "avgPermissions": 12.5,
      "maxPermissions": 25,
      "minPermissions": 5
    }
  }
}
```

---

### 7. **Search Roles**
**GET** `/api/v1/roles/search`
**Permission Required**: `role.read`

#### Query Parameters:
- `query` (string): Search term for name/description
- `level` (object/number): Level filter
- `isActive` (boolean): Active status filter
- `isSystem` (boolean): System status filter
- `hasPermissions` (boolean): Filter roles with/without permissions
- `permissionCount` (number): Minimum permission count
- `page`, `limit`, `sortBy`, `sortOrder`: Pagination and sorting

#### Example Requests:
```bash
# Search by query
GET /api/v1/roles/search?query=admin

# Filter by level range and permissions
GET /api/v1/roles/search?level=50&hasPermissions=true&permissionCount=10

# Complex search
GET /api/v1/roles/search?query=manager&isActive=true&isSystem=false&sortBy=level
```

---

## 🔒 **Error Handling**

### Common Error Responses:

#### 400 - Bad Request
```json
{
  "success": false,
  "message": "Role name already exists"
}
```

#### 401 - Unauthorized
```json
{
  "success": false,
  "message": "Please login to access this resource"
}
```

#### 403 - Forbidden
```json
{
  "success": false,
  "message": "Access denied. Your role does not have permission to access this resource."
}
```

#### 404 - Not Found
```json
{
  "success": false,
  "message": "Role not found"
}
```

---

## 💡 **Best Practices**

1. **Role Naming**: Use descriptive, lowercase names
2. **Permission Assignment**: Only assign necessary permissions
3. **Level Management**: Use consistent level hierarchy
4. **System Roles**: Never delete or modify critical system roles
5. **Audit Trail**: All role changes are automatically logged
6. **User Assignment**: Check user assignments before role deletion
7. **Validation**: Always validate permissions exist before assignment

---

## 🧪 **Testing Examples**

### Using cURL:
```bash
# Create role
curl -X POST http://localhost:4000/api/v1/roles \
  -H "Content-Type: application/json" \
  -H "Cookie: token=your_jwt_token" \
  -d '{
    "RoleName": "editor",
    "description": "Content editor role",
    "level": 30,
    "permissions": ["user.read", "reports.read", "profile.read", "profile.update"]
  }'

# Get all roles
curl -X GET "http://localhost:4000/api/v1/roles?page=1&limit=5" \
  -H "Cookie: token=your_jwt_token"

# Update role
curl -X PUT http://localhost:4000/api/v1/roles/ROLE_ID \
  -H "Content-Type: application/json" \
  -H "Cookie: token=your_jwt_token" \
  -d '{"description": "Updated description", "level": 35}'

# Delete role
curl -X DELETE http://localhost:4000/api/v1/roles/ROLE_ID \
  -H "Cookie: token=your_jwt_token"
```
