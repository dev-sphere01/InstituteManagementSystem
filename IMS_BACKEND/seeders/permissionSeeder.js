const Permission = require('../models/permissionModel');
const Role = require('../models/roleModel');
const User = require('../models/userModel');
const connectDatabase = require('../config/database');
const logger = require('../utils/logger');

/**
 * Permission and Role Seeder
 * Creates default permissions and roles for the application
 */

// Comprehensive permissions for all modules
const defaultPermissions = [
  // User Management Module
  {
    name: 'user.create',
    displayName: 'Create User',
    module: 'user',
    action: 'create',
    description: 'Create new users in the system'
  },
  {
    name: 'user.read',
    displayName: 'View Users',
    module: 'user',
    action: 'read',
    description: 'View user information and profiles'
  },
  {
    name: 'user.update',
    displayName: 'Update User',
    module: 'user',
    action: 'update',
    description: 'Update user information and profiles'
  },
  {
    name: 'user.delete',
    displayName: 'Delete User',
    module: 'user',
    action: 'delete',
    description: 'Delete users from the system'
  },
  {
    name: 'user.export',
    displayName: 'Export Users',
    module: 'user',
    action: 'export',
    description: 'Export user data'
  },
  {
    name: 'user.import',
    displayName: 'Import Users',
    module: 'user',
    action: 'import',
    description: 'Import user data'
  },

  // Role Management Module
  {
    name: 'role.create',
    displayName: 'Create Role',
    module: 'role',
    action: 'create',
    description: 'Create new roles in the system'
  },
  {
    name: 'role.read',
    displayName: 'View Roles',
    module: 'role',
    action: 'read',
    description: 'View role information and permissions'
  },
  {
    name: 'role.update',
    displayName: 'Update Role',
    module: 'role',
    action: 'update',
    description: 'Update role information and permissions'
  },
  {
    name: 'role.delete',
    displayName: 'Delete Role',
    module: 'role',
    action: 'delete',
    description: 'Delete roles from the system'
  },
  {
    name: 'role.export',
    displayName: 'Export Roles',
    module: 'role',
    action: 'export',
    description: 'Export role data'
  },

  // Permission Management Module
  {
    name: 'permission.create',
    displayName: 'Create Permission',
    module: 'permission',
    action: 'create',
    description: 'Create new permissions in the system'
  },
  {
    name: 'permission.read',
    displayName: 'View Permissions',
    module: 'permission',
    action: 'read',
    description: 'View permission information'
  },
  {
    name: 'permission.update',
    displayName: 'Update Permission',
    module: 'permission',
    action: 'update',
    description: 'Update permission information'
  },
  {
    name: 'permission.delete',
    displayName: 'Delete Permission',
    module: 'permission',
    action: 'delete',
    description: 'Delete permissions from the system'
  },

  // Dashboard Module
  {
    name: 'dashboard.read',
    displayName: 'View Dashboard',
    module: 'dashboard',
    action: 'read',
    description: 'Access dashboard and analytics'
  },

  // System Administration
  {
    name: 'admin.read',
    displayName: 'View Admin Panel',
    module: 'admin',
    action: 'read',
    description: 'Access to admin panel and system information'
  },
  {
    name: 'admin.create',
    displayName: 'Admin Create',
    module: 'admin',
    action: 'create',
    description: 'Create administrative resources'
  },
  {
    name: 'admin.update',
    displayName: 'Admin Update',
    module: 'admin',
    action: 'update',
    description: 'Update administrative settings'
  },
  {
    name: 'admin.delete',
    displayName: 'Admin Delete',
    module: 'admin',
    action: 'delete',
    description: 'Delete administrative resources'
  },

  // Logging and Audit
  {
    name: 'log.read',
    displayName: 'View Logs',
    module: 'log',
    action: 'read',
    description: 'View system logs and audit trails'
  },
  {
    name: 'log.export',
    displayName: 'Export Logs',
    module: 'log',
    action: 'export',
    description: 'Export system logs and audit data'
  },
  {
    name: 'log.delete',
    displayName: 'Delete Logs',
    module: 'log',
    action: 'delete',
    description: 'Delete system logs'
  },

  // Profile Management
  {
    name: 'profile.read',
    displayName: 'View Profile',
    module: 'profile',
    action: 'read',
    description: 'View own profile information'
  },
  {
    name: 'profile.update',
    displayName: 'Update Profile',
    module: 'profile',
    action: 'update',
    description: 'Update own profile information'
  },

  // Settings Module
  {
    name: 'settings.read',
    displayName: 'View Settings',
    module: 'settings',
    action: 'read',
    description: 'View system settings'
  },
  {
    name: 'settings.update',
    displayName: 'Update Settings',
    module: 'settings',
    action: 'update',
    description: 'Update system settings'
  },

  // Reports Module
  {
    name: 'reports.read',
    displayName: 'View Reports',
    module: 'reports',
    action: 'read',
    description: 'View system reports'
  },
  {
    name: 'reports.create',
    displayName: 'Create Reports',
    module: 'reports',
    action: 'create',
    description: 'Create new reports'
  },
  {
    name: 'reports.export',
    displayName: 'Export Reports',
    module: 'reports',
    action: 'export',
    description: 'Export reports data'
  }
];

// Default roles with their permissions
const defaultRoles = [
  {
    RoleName: 'admin',
    description: 'Administrator with full system access and all permissions',
    level: 80,
    isSystem: true,
    permissions: [] // Will be populated with ALL permissions
  },
  {
    RoleName: 'student',
    description: 'Default role for new users with read-only permissions',
    level: 15,
    isSystem: true,
    permissions: [
      // Only READ permissions for students
      'user.read',
      'role.read',
      'permission.read',
      'dashboard.read',
      'admin.read',
      'log.read',
      'profile.read',
      'profile.update', // Students can update their own profile
      'settings.read',
      'reports.read'
    ]
  }
];

/**
 * Seed permissions
 */
async function seedPermissions() {
  try {
    console.log('🌱 Seeding permissions...');
    
    for (const permissionData of defaultPermissions) {
      const existingPermission = await Permission.findOne({ name: permissionData.name });
      
      if (!existingPermission) {
        await Permission.create(permissionData);
        console.log(`✅ Created permission: ${permissionData.name}`);
      } else {
        console.log(`⏭️  Permission already exists: ${permissionData.name}`);
      }
    }
    
    console.log('✅ Permissions seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding permissions:', error.message);
    throw error;
  }
}

/**
 * Seed roles
 */
async function seedRoles() {
  try {
    console.log('🌱 Seeding roles...');

    // Get all permissions for admin role
    const allPermissions = await Permission.find({ isActive: true });
    const allPermissionIds = allPermissions.map(p => p._id);

    for (const roleData of defaultRoles) {
      const existingRole = await Role.findOne({ RoleName: roleData.RoleName });

      if (!existingRole) {
        // Get permission IDs for this role
        let permissionIds = [];

        if (roleData.RoleName === 'admin') {
          // Admin gets ALL permissions
          permissionIds = allPermissionIds;
          console.log(`🔑 Admin role will get ALL ${allPermissionIds.length} permissions`);
        } else {
          // Get specific permissions for other roles (like student)
          const permissions = await Permission.find({
            name: { $in: roleData.permissions },
            isActive: true
          });
          permissionIds = permissions.map(p => p._id);
          console.log(`📚 ${roleData.RoleName} role will get ${permissionIds.length} permissions`);
        }

        const role = await Role.create({
          ...roleData,
          permissions: permissionIds
        });

        console.log(`✅ Created role: ${roleData.RoleName} with ${permissionIds.length} permissions`);
      } else {
        console.log(`⏭️  Role already exists: ${roleData.RoleName}`);

        // Update existing role permissions
        if (roleData.RoleName === 'admin') {
          existingRole.permissions = allPermissionIds;
          await existingRole.save();
          console.log(`🔄 Updated admin role with ALL ${allPermissionIds.length} permissions`);
        } else {
          const permissions = await Permission.find({
            name: { $in: roleData.permissions },
            isActive: true
          });
          const permissionIds = permissions.map(p => p._id);
          existingRole.permissions = permissionIds;
          await existingRole.save();
          console.log(`🔄 Updated ${roleData.RoleName} role with ${permissionIds.length} permissions`);
        }
      }
    }

    console.log('✅ Roles seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding roles:', error.message);
    throw error;
  }
}

/**
 * Main seeder function
 */
async function seedPermissionsAndRoles() {
  try {
    console.log('🚀 Starting permission and role seeding...');
    
    await connectDatabase();
    console.log('📦 Database connected');
    
    await seedPermissions();
    await seedRoles();
    
    console.log('🎉 Permission and role seeding completed successfully!');
    
    // Display summary
    const permissionCount = await Permission.countDocuments();
    const roleCount = await Role.countDocuments();
    
    console.log('\n📊 Summary:');
    console.log(`   Permissions: ${permissionCount}`);
    console.log(`   Roles: ${roleCount}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

// Run seeder if called directly
if (require.main === module) {
  seedPermissionsAndRoles();
}

module.exports = {
  seedPermissions,
  seedRoles,
  seedPermissionsAndRoles,
  defaultPermissions,
  defaultRoles
};
