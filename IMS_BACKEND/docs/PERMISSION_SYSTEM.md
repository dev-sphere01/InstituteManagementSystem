# Role-Based Permission System

A comprehensive module and feature-wise permission system that allows granular access control for your application.

## 🎯 Overview

This system provides:
- **Module-based permissions** (user, role, admin, etc.)
- **Action-based permissions** (create, read, update, delete, manage)
- **Role-based access control** with permission inheritance
- **User-specific permissions** (additional/denied permissions)
- **Hierarchical roles** with level-based access
- **Audit logging** for all permission changes

## 📋 Core Components

### 1. **Permissions**
Granular permissions following the format: `module.action`

**Examples:**
- `user.create` - Create new users
- `user.read` - View user information
- `role.manage` - Full role management
- `admin.manage` - System administration

### 2. **Roles**
Collections of permissions with hierarchical levels

**Default Roles:**
- **Super Admin** (Level 100) - All permissions
- **Admin** (Level 80) - Most administrative permissions
- **Manager** (Level 60) - User oversight capabilities
- **User** (Level 20) - Basic user permissions
- **Guest** (Level 10) - Limited read-only access

### 3. **Users**
Users are assigned roles and can have additional/denied permissions

## 🚀 Quick Start

### 1. **Seed Default Permissions and Roles**
```bash
node backend/scripts/seed-permissions.js
```

### 2. **Assign Role to User**
```javascript
const user = await User.findById(userId);
const role = await Role.findOne({ name: 'admin' });
user.role = role._id;
await user.save();
```

### 3. **Protect Routes with Permissions**
```javascript
const { requirePermission } = require('../middlewares/permission');

// Require specific permission
router.post('/users', 
  isAuthenticatedUser,
  requirePermission('user.create'),
  createUser
);

// Require module permission
router.get('/users', 
  isAuthenticatedUser,
  requireModulePermission('user', 'read'),
  getUsers
);
```

## 🔐 Permission Middleware

### **requirePermission(permissionName)**
Checks if user has specific permission
```javascript
requirePermission('user.create')
```

### **requireModulePermission(module, action)**
Checks if user has permission for module and action
```javascript
requireModulePermission('user', 'create')
```

### **requireAnyPermission(permissions)**
Checks if user has any of the specified permissions (OR logic)
```javascript
requireAnyPermission(['user.read', 'user.list'])
```

### **requireAllPermissions(permissions)**
Checks if user has all specified permissions (AND logic)
```javascript
requireAllPermissions(['user.read', 'user.update'])
```

### **requireRoleLevel(minLevel)**
Checks if user's role level meets minimum requirement
```javascript
requireRoleLevel(80) // Admin level or higher
```

## 📊 API Endpoints

### **Permissions**
```
GET    /api/v1/permissions           # List all permissions
GET    /api/v1/permissions/modules   # Get permissions grouped by module
GET    /api/v1/permissions/:id       # Get single permission
POST   /api/v1/permissions           # Create permission
PUT    /api/v1/permissions/:id       # Update permission
DELETE /api/v1/permissions/:id       # Delete permission
```

### **Roles**
```
GET    /api/v1/roles                 # List all roles
GET    /api/v1/roles/:id             # Get single role
POST   /api/v1/roles                 # Create role
PUT    /api/v1/roles/:id             # Update role
DELETE /api/v1/roles/:id             # Delete role
GET    /api/v1/roles/:id/permissions # Get role permissions
POST   /api/v1/roles/:id/permissions # Assign permissions to role
```

## 💡 Usage Examples

### **Check User Permissions**
```javascript
// Check if user has specific permission
const hasPermission = await user.hasPermission('user.create');

// Check module permission
const canManageUsers = await user.hasModulePermission('user', 'manage');

// Get all user permissions
const permissions = await user.getAllPermissions();
```

### **Role Management**
```javascript
// Create new role
const role = await Role.create({
  name: 'moderator',
  displayName: 'Moderator',
  description: 'Content moderation role',
  level: 40,
  permissions: [permissionId1, permissionId2]
});

// Add permission to role
await role.addPermission(permissionId);

// Check if role has permission
const hasPermission = role.hasPermission('user.read');
```

### **User Permission Management**
```javascript
// User permissions are now managed entirely through roles
// To give a user additional permissions, assign them to a role with those permissions
// To restrict permissions, create a custom role with limited permissions

// Example: Assign user to a role with specific permissions
const customRole = await Role.findOne({ RoleName: 'custom_role' });
user.role = customRole._id;
await user.save();
```

## 🏗️ Database Schema

### **Permission Schema**
```javascript
{
  name: String,           // 'user.create'
  displayName: String,    // 'Create User'
  module: String,         // 'user'
  action: String,         // 'create'
  description: String,    // Description of permission
  isCritical: Boolean,    // Is this a dangerous permission?
  category: String,       // 'admin', 'user', 'system'
  isActive: Boolean       // Is permission active?
}
```

### **Role Schema**
```javascript
{
  name: String,           // 'admin'
  displayName: String,    // 'Administrator'
  description: String,    // Role description
  permissions: [ObjectId], // Array of permission IDs
  level: Number,          // Hierarchy level (1-100)
  category: String,       // 'admin', 'manager', 'user'
  isSystem: Boolean,      // System role (cannot be deleted)
  maxUsers: Number        // Max users allowed (0 = unlimited)
}
```

### **User Schema Updates**
```javascript
{
  role: ObjectId,                    // Reference to Role (contains all permissions)
  status: String,                    // 'active', 'inactive', 'suspended'
  lastLogin: Date,                   // Last login timestamp
  loginAttempts: Number,             // Failed login attempts
  lockUntil: Date                    // Account locked until
}
```

## 🔒 Security Features

### **Account Locking**
- Accounts lock after 5 failed login attempts
- Locked for 2 hours
- Automatic unlock after timeout

### **Permission Hierarchy**
- Denied permissions override role permissions
- Additional permissions extend role permissions
- Role level determines access hierarchy

### **Audit Logging**
- All permission changes are logged
- User access attempts are tracked
- Failed authorization attempts are recorded

## 🎨 Frontend Integration

### **Permission Checking in UI**
```javascript
// Check if user can perform action
const canCreateUser = user.permissions.includes('user.create');

// Show/hide UI elements based on permissions
{hasPermission('user.create') && (
  <CreateUserButton />
)}
```

### **Role-based Navigation**
```javascript
// Filter navigation items by user permissions
const navigationItems = allNavItems.filter(item => 
  user.permissions.includes(item.requiredPermission)
);
```

## 🚨 Best Practices

### **Permission Naming**
- Use lowercase module names: `user`, `product`, `order`
- Use standard actions: `create`, `read`, `update`, `delete`, `list`, `manage`
- Format: `module.action` (e.g., `user.create`)

### **Role Design**
- Keep roles focused and specific
- Use hierarchical levels appropriately
- Avoid role explosion - combine related permissions

### **Security**
- Always check permissions on both frontend and backend
- Use middleware for route protection
- Log all permission-related activities
- Regularly audit user permissions

## 📈 Monitoring

### **Permission Usage**
- Track which permissions are most used
- Identify unused permissions for cleanup
- Monitor permission assignment patterns

### **Security Monitoring**
- Failed authorization attempts
- Privilege escalation attempts
- Unusual permission usage patterns

Your role-based permission system is now ready for production use! 🎉
