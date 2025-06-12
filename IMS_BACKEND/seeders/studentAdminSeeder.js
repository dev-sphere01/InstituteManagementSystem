const mongoose = require('mongoose');
const Role = require('../models/roleModel');
const Permission = require('../models/permissionModel');
const connectDatabase = require('../config/database');

/**
 * Seeder specifically for Student and Admin roles
 * This seeder focuses on creating the two main roles needed for the system
 */

// Required permissions for the roles
const requiredPermissions = [
  // Profile permissions (for both student and admin)
  {
    name: 'profile.read',
    displayName: 'Read Profile',
    description: 'View user profile information',
    module: 'profile',
    action: 'read',
    isActive: true,
    isCritical: false
  },
  {
    name: 'profile.update',
    displayName: 'Update Profile',
    description: 'Update user profile information',
    module: 'profile',
    action: 'update',
    isActive: true,
    isCritical: false
  },
  // User management permissions (for admin)
  {
    name: 'user.create',
    displayName: 'Create User',
    description: 'Create new users in the system',
    module: 'user',
    action: 'create',
    isActive: true,
    isCritical: true
  },
  {
    name: 'user.read',
    displayName: 'Read User',
    description: 'View user information',
    module: 'user',
    action: 'read',
    isActive: true,
    isCritical: false
  },
  {
    name: 'user.update',
    displayName: 'Update User',
    description: 'Update user information',
    module: 'user',
    action: 'update',
    isActive: true,
    isCritical: true
  },
  {
    name: 'user.list',
    displayName: 'List Users',
    description: 'View list of all users',
    module: 'user',
    action: 'read',
    isActive: true,
    isCritical: false
  },
  // Role and permission management (for admin)
  {
    name: 'role.read',
    displayName: 'Read Role',
    description: 'View role information',
    module: 'role',
    action: 'read',
    isActive: true,
    isCritical: false
  },
  {
    name: 'permission.read',
    displayName: 'Read Permission',
    description: 'View permission information',
    module: 'permission',
    action: 'read',
    isActive: true,
    isCritical: false
  },
  // Admin and logging permissions
  {
    name: 'admin.read',
    displayName: 'Admin Dashboard',
    description: 'Access admin dashboard',
    module: 'admin',
    action: 'read',
    isActive: true,
    isCritical: false
  },
  {
    name: 'log.read',
    displayName: 'Read Logs',
    description: 'View system logs',
    module: 'log',
    action: 'read',
    isActive: true,
    isCritical: false
  },
  {
    name: 'log.export',
    displayName: 'Export Logs',
    description: 'Export system logs',
    module: 'log',
    action: 'export',
    isActive: true,
    isCritical: false
  }
];

// Student and Admin roles configuration
const rolesToSeed = [
  {
    name: 'admin',
    displayName: 'Administrator',
    description: 'Administrative access with most permissions',
    level: 80,
    category: 'admin',
    color: '#ea580c',
    isSystem: true,
    permissions: [
      'user.create', 'user.read', 'user.update', 'user.list',
      'role.read', 'permission.read',
      'admin.read', 'log.read', 'log.export',
      'profile.read', 'profile.update'
    ]
  },
  {
    name: 'student',
    displayName: 'Student',
    description: 'Default role for new users with basic student permissions',
    level: 15,
    category: 'user',
    color: '#3b82f6',
    isSystem: true,
    permissions: [
      'profile.read', 'profile.update'
    ]
  }
];

/**
 * Seed required permissions
 */
async function seedRequiredPermissions() {
  try {
    console.log('🌱 Seeding required permissions...');
    
    for (const permissionData of requiredPermissions) {
      const existingPermission = await Permission.findOne({ name: permissionData.name });
      
      if (!existingPermission) {
        await Permission.create(permissionData);
        console.log(`✅ Created permission: ${permissionData.name}`);
      } else {
        console.log(`⏭️  Permission already exists: ${permissionData.name}`);
      }
    }
    
    console.log('✅ Required permissions seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding permissions:', error.message);
    throw error;
  }
}

/**
 * Seed Student and Admin roles
 */
async function seedStudentAndAdminRoles() {
  try {
    console.log('🌱 Seeding Student and Admin roles...');
    
    for (const roleData of rolesToSeed) {
      const existingRole = await Role.findOne({ name: roleData.name });
      
      if (!existingRole) {
        // Get permission IDs for this role
        const permissions = await Permission.find({
          name: { $in: roleData.permissions },
          isActive: true
        });
        const permissionIds = permissions.map(p => p._id);
        
        if (permissionIds.length !== roleData.permissions.length) {
          console.warn(`⚠️  Warning: Some permissions not found for role ${roleData.name}`);
          console.warn(`   Expected: ${roleData.permissions.length}, Found: ${permissionIds.length}`);
        }
        
        const role = await Role.create({
          ...roleData,
          permissions: permissionIds
        });
        
        console.log(`✅ Created role: ${roleData.name} with ${permissionIds.length} permissions`);
      } else {
        console.log(`⏭️  Role already exists: ${roleData.name}`);
        
        // Optionally update permissions if role exists
        const permissions = await Permission.find({
          name: { $in: roleData.permissions },
          isActive: true
        });
        const permissionIds = permissions.map(p => p._id);
        
        existingRole.permissions = permissionIds;
        await existingRole.save();
        console.log(`🔄 Updated permissions for existing role: ${roleData.name}`);
      }
    }
    
    console.log('✅ Student and Admin roles seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding roles:', error.message);
    throw error;
  }
}

/**
 * Main seeder function
 */
async function seedStudentAndAdmin() {
  try {
    console.log('🚀 Starting Student and Admin role seeding...');
    
    await connectDatabase();
    console.log('📦 Database connected');
    
    await seedRequiredPermissions();
    await seedStudentAndAdminRoles();
    
    console.log('🎉 Student and Admin seeding completed successfully!');
    
    // Display summary
    const studentRole = await Role.findOne({ name: 'student' }).populate('permissions');
    const adminRole = await Role.findOne({ name: 'admin' }).populate('permissions');
    
    console.log('\n📊 Summary:');
    console.log(`   Student role: ${studentRole ? 'Created' : 'Failed'} (${studentRole?.permissions?.length || 0} permissions)`);
    console.log(`   Admin role: ${adminRole ? 'Created' : 'Failed'} (${adminRole?.permissions?.length || 0} permissions)`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

// Run seeder if called directly
if (require.main === module) {
  seedStudentAndAdmin();
}

module.exports = {
  seedRequiredPermissions,
  seedStudentAndAdminRoles,
  seedStudentAndAdmin,
  requiredPermissions,
  rolesToSeed
};
