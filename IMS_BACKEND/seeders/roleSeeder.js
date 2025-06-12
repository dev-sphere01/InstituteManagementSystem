require('dotenv').config({ path: './config/config.env' });
const Role = require('../models/roleModel');
const User = require('../models/userModel');
const connectDatabase = require('../config/database');
const logger = require('../utils/logger');

/**
 * Simplified Role Seeder (No Permission Model Required)
 * Creates default roles with permission names as strings
 */

// Default roles with their permissions as strings
const defaultRoles = [
  {
    RoleName: 'admin',
    description: 'Administrator with full system access and all permissions',
    level: 1,
    isActive: true,
    isSystem: true,
    permissions: [
      // User permissions
      'user.create', 'user.read', 'user.update', 'user.delete', 'user.export', 'user.import',
      // Role permissions
      'role.create', 'role.read', 'role.update', 'role.delete', 'role.export',
      // Permission permissions
      'permission.create', 'permission.read', 'permission.update', 'permission.delete',
      // Admin permissions
      'admin.create', 'admin.read', 'admin.update', 'admin.delete',
      // Dashboard permissions
      'dashboard.read',
      // Settings permissions
      'settings.read', 'settings.update',
      // Reports permissions
      'reports.create', 'reports.read', 'reports.export',
      // Log permissions
      'log.read', 'log.delete', 'log.export',
      // Profile permissions
      'profile.read', 'profile.update'
    ]
  },
  {
    RoleName: 'student',
    description: 'Default role for new users with read-only permissions',
    level: 15,
    isActive: true,
    isSystem: true,
    permissions: [
      // Read-only permissions for students
      'user.read',
      'role.read',
      'permission.read',
      'admin.read',
      'dashboard.read',
      'settings.read',
      'reports.read',
      'log.read',
      'profile.read',
      'profile.update' // Students can update their own profile
    ]
  }
];

/**
 * Seed roles with string permissions
 */
async function seedRoles() {
  try {
    console.log('🌱 Seeding roles with string permissions...');

    for (const roleData of defaultRoles) {
      const existingRole = await Role.findOne({ RoleName: roleData.RoleName });

      if (!existingRole) {
        const role = await Role.create(roleData);
        console.log(`✅ Created role: ${roleData.RoleName} with ${roleData.permissions.length} permissions`);
        
        // Log the permissions for verification
        console.log(`   Permissions: ${roleData.permissions.slice(0, 5).join(', ')}${roleData.permissions.length > 5 ? '...' : ''}`);
      } else {
        // Update existing role with new permission format
        existingRole.permissions = roleData.permissions;
        existingRole.level = roleData.level;
        existingRole.isSystem = roleData.isSystem;
        existingRole.description = roleData.description;
        await existingRole.save();
        
        console.log(`🔄 Updated existing role: ${roleData.RoleName} with ${roleData.permissions.length} permissions`);
        console.log(`   Permissions: ${roleData.permissions.slice(0, 5).join(', ')}${roleData.permissions.length > 5 ? '...' : ''}`);
      }
    }

    console.log('✅ Roles seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding roles:', error.message);
    throw error;
  }
}

/**
 * Create default admin user if not exists
 */
async function createDefaultAdmin() {
  try {
    console.log('👤 Checking for default admin user...');
    
    const adminRole = await Role.findOne({ RoleName: 'admin' });
    if (!adminRole) {
      console.log('⚠️  Admin role not found, skipping admin user creation');
      return;
    }

    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    
    if (!existingAdmin) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      const adminUser = await User.create({
        name: 'System Administrator',
        email: 'admin@example.com',
        password: hashedPassword,
        role: adminRole._id,
        status: 'active',
        isEmailVerified: true
      });
      
      console.log('✅ Created default admin user:');
      console.log('   Email: admin@example.com');
      console.log('   Password: admin123');
      console.log('   ⚠️  Please change the password after first login!');
    } else {
      console.log('⏭️  Admin user already exists');
      
      // Update admin user role if needed
      if (existingAdmin.role.toString() !== adminRole._id.toString()) {
        existingAdmin.role = adminRole._id;
        await existingAdmin.save();
        console.log('🔄 Updated admin user role');
      }
    }
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    throw error;
  }
}

/**
 * Main seeder function
 */
async function seedRolesAndAdmin() {
  try {
    console.log('🚀 Starting role and admin seeding...');
    
    await connectDatabase();
    console.log('📦 Database connected');
    
    await seedRoles();
    await createDefaultAdmin();
    
    console.log('🎉 Role and admin seeding completed successfully!');
    
    // Display summary
    const roleCount = await Role.countDocuments();
    const userCount = await User.countDocuments();
    
    console.log('\n📊 Summary:');
    console.log(`   Roles: ${roleCount}`);
    console.log(`   Users: ${userCount}`);
    
    // Show role details
    const roles = await Role.find({});
    console.log('\n🎭 Created Roles:');
    roles.forEach(role => {
      console.log(`   - ${role.RoleName} (Level: ${role.level}, Permissions: ${role.permissions.length})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

/**
 * Clean and reseed (removes all roles and recreates them)
 */
async function cleanAndReseed() {
  try {
    console.log('🧹 Cleaning existing roles...');
    
    await connectDatabase();
    
    // Remove all non-system roles or all roles if force clean
    await Role.deleteMany({});
    console.log('✅ Removed all existing roles');
    
    await seedRoles();
    await createDefaultAdmin();
    
    console.log('🎉 Clean and reseed completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Clean and reseed failed:', error.message);
    process.exit(1);
  }
}

// Run seeder based on command line argument
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--clean')) {
    cleanAndReseed();
  } else {
    seedRolesAndAdmin();
  }
}

module.exports = {
  seedRoles,
  createDefaultAdmin,
  seedRolesAndAdmin,
  cleanAndReseed,
  defaultRoles
};
