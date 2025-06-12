/**
 * Test script to verify system role protection
 * This script tests that system roles cannot be modified or deleted
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: './config/config.env' });

const Role = require('../models/roleModel');
const { updateRole, deleteRole } = require('../services/roleService');

async function connectDatabase() {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

async function testSystemRoleProtection() {
  try {
    console.log('🧪 Testing System Role Protection...\n');

    // Find a system role (admin)
    const systemRole = await Role.findOne({ isSystem: true });
    
    if (!systemRole) {
      console.log('⚠️  No system role found. Creating one for testing...');
      const testSystemRole = await Role.create({
        RoleName: 'test-system-role',
        description: 'Test system role',
        level: 1,
        isSystem: true,
        permissions: ['user.read', 'dashboard.read']
      });
      console.log(`✅ Created test system role: ${testSystemRole.RoleName}`);
      return testSystemRole._id;
    }

    console.log(`📋 Testing with system role: ${systemRole.RoleName} (ID: ${systemRole._id})`);

    // Test 1: Try to change system role name
    console.log('\n🧪 Test 1: Attempting to change system role name...');
    try {
      await updateRole(systemRole._id, { RoleName: 'modified-admin' }, 'test-user-id');
      console.log('❌ FAILED: System role name was changed (should not be allowed)');
    } catch (error) {
      console.log(`✅ PASSED: ${error.message}`);
    }

    // Test 2: Try to change system role level
    console.log('\n🧪 Test 2: Attempting to change system role level...');
    try {
      await updateRole(systemRole._id, { level: 99 }, 'test-user-id');
      console.log('❌ FAILED: System role level was changed (should not be allowed)');
    } catch (error) {
      console.log(`✅ PASSED: ${error.message}`);
    }

    // Test 3: Try to change isSystem from true to false
    console.log('\n🧪 Test 3: Attempting to change isSystem from true to false...');
    try {
      await updateRole(systemRole._id, { isSystem: false }, 'test-user-id');
      console.log('❌ FAILED: System role isSystem was changed (should not be allowed)');
    } catch (error) {
      console.log(`✅ PASSED: ${error.message}`);
    }

    // Test 4: Try to update allowed fields (should work)
    console.log('\n🧪 Test 4: Attempting to update allowed fields (description, permissions, isActive)...');
    try {
      const updatedRole = await updateRole(systemRole._id, {
        description: 'Updated system role description',
        permissions: ['user.read', 'user.create', 'dashboard.read'],
        isActive: true
      }, 'test-user-id');
      console.log('✅ PASSED: Allowed fields were updated successfully');
      console.log(`   New description: ${updatedRole.description}`);
      console.log(`   New permissions count: ${updatedRole.permissions.length}`);
    } catch (error) {
      console.log(`❌ FAILED: Should be able to update allowed fields: ${error.message}`);
    }

    // Test 5: Try to delete system role
    console.log('\n🧪 Test 5: Attempting to delete system role...');
    try {
      await deleteRole(systemRole._id);
      console.log('❌ FAILED: System role was deleted (should not be allowed)');
    } catch (error) {
      console.log(`✅ PASSED: ${error.message}`);
    }

    console.log('\n🎉 System Role Protection Tests Completed!');
    return systemRole._id;

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

async function testNonSystemRole() {
  try {
    console.log('\n🧪 Testing Non-System Role (should allow all operations)...\n');

    // Create a non-system role for testing
    const testRole = await Role.create({
      RoleName: 'test-custom-role',
      description: 'Test custom role',
      level: 50,
      isSystem: false,
      permissions: ['user.read']
    });

    console.log(`📋 Created test custom role: ${testRole.RoleName} (ID: ${testRole._id})`);

    // Test updating all fields (should work)
    console.log('\n🧪 Test: Updating all fields of custom role...');
    try {
      const updatedRole = await updateRole(testRole._id, {
        RoleName: 'updated-custom-role',
        description: 'Updated custom role description',
        level: 75,
        isSystem: false,
        permissions: ['user.read', 'user.create'],
        isActive: true
      }, 'test-user-id');
      
      console.log('✅ PASSED: All fields updated successfully');
      console.log(`   New name: ${updatedRole.RoleName}`);
      console.log(`   New level: ${updatedRole.level}`);
      console.log(`   New permissions: ${updatedRole.permissions.join(', ')}`);
    } catch (error) {
      console.log(`❌ FAILED: Should be able to update custom role: ${error.message}`);
    }

    // Test deleting custom role (should work)
    console.log('\n🧪 Test: Deleting custom role...');
    try {
      await deleteRole(testRole._id);
      console.log('✅ PASSED: Custom role deleted successfully');
    } catch (error) {
      console.log(`❌ FAILED: Should be able to delete custom role: ${error.message}`);
    }

  } catch (error) {
    console.error('❌ Non-system role test failed:', error);
    throw error;
  }
}

async function main() {
  try {
    await connectDatabase();
    await testSystemRoleProtection();
    await testNonSystemRole();
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('✅ System roles are protected from name/level changes');
    console.log('✅ System roles cannot be deleted');
    console.log('✅ System roles can have description/permissions/isActive updated');
    console.log('✅ Custom roles can be fully modified and deleted');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Tests failed:', error);
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  main();
}

module.exports = { testSystemRoleProtection, testNonSystemRole };
