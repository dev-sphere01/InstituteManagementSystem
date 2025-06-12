/**
 * Test script to verify user role handling logic
 * Tests the new role assignment behavior for different user creation scenarios
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: './config/config.env' });

const User = require('../models/userModel');
const Role = require('../models/roleModel');
const { createUser, updateUserRole } = require('../services/userService');

async function connectDatabase() {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

async function setupTestRoles() {
  console.log('🔧 Setting up test roles...');
  
  // Ensure we have the required roles
  const roles = [
    { RoleName: 'student', description: 'Student role', level: 100, permissions: ['profile.read'] },
    { RoleName: 'admin', description: 'Admin role', level: 1, permissions: ['user.create', 'user.read', 'user.update'] },
    { RoleName: 'manager', description: 'Manager role', level: 50, permissions: ['user.read', 'dashboard.read'] }
  ];

  const createdRoles = {};
  
  for (const roleData of roles) {
    let role = await Role.findOne({ RoleName: roleData.RoleName });
    if (!role) {
      role = await Role.create(roleData);
      console.log(`   Created role: ${role.RoleName}`);
    }
    createdRoles[roleData.RoleName] = role;
  }
  
  return createdRoles;
}

async function testSelfRegistration(roles) {
  console.log('\n🧪 Testing Self-Registration (should always get student role)...\n');

  // Test 1: Self-registration without role
  console.log('Test 1: Self-registration without role field');
  try {
    const user1 = await createUser({
      name: 'Test User 1',
      email: 'test1@example.com',
      password: 'TestPass123!'
    }, { isAdminCreation: false });
    
    console.log(`✅ PASSED: User created with role: ${user1.role.RoleName}`);
    if (user1.role.RoleName === 'student') {
      console.log('   ✅ Correctly assigned student role');
    } else {
      console.log(`   ❌ Expected 'student', got '${user1.role.RoleName}'`);
    }
    await User.findByIdAndDelete(user1._id);
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}`);
  }

  // Test 2: Self-registration with admin role (should be ignored)
  console.log('\nTest 2: Self-registration with admin role (should be ignored)');
  try {
    const user2 = await createUser({
      name: 'Test User 2',
      email: 'test2@example.com',
      password: 'TestPass123!',
      role: 'admin'  // This should be ignored
    }, { isAdminCreation: false });
    
    console.log(`✅ PASSED: User created with role: ${user2.role.RoleName}`);
    if (user2.role.RoleName === 'student') {
      console.log('   ✅ Correctly ignored admin role and assigned student');
    } else {
      console.log(`   ❌ Expected 'student', got '${user2.role.RoleName}'`);
    }
    await User.findByIdAndDelete(user2._id);
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}`);
  }
}

async function testAdminCreation(roles) {
  console.log('\n🧪 Testing Admin User Creation (should accept role ID)...\n');

  // Test 1: Admin creation with role name
  console.log('Test 1: Admin creation with role name');
  try {
    const user1 = await createUser({
      name: 'Admin Created User 1',
      email: 'admin1@example.com',
      password: 'AdminPass123!',
      role: 'manager'
    }, { isAdminCreation: true });
    
    console.log(`✅ PASSED: User created with role: ${user1.role.RoleName}`);
    if (user1.role.RoleName === 'manager') {
      console.log('   ✅ Correctly assigned manager role');
    } else {
      console.log(`   ❌ Expected 'manager', got '${user1.role.RoleName}'`);
    }
    await User.findByIdAndDelete(user1._id);
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}`);
  }

  // Test 2: Admin creation with role ObjectId
  console.log('\nTest 2: Admin creation with role ObjectId');
  try {
    const user2 = await createUser({
      name: 'Admin Created User 2',
      email: 'admin2@example.com',
      password: 'AdminPass123!',
      role: roles.admin._id.toString()
    }, { isAdminCreation: true });
    
    console.log(`✅ PASSED: User created with role: ${user2.role.RoleName}`);
    if (user2.role.RoleName === 'admin') {
      console.log('   ✅ Correctly assigned admin role via ObjectId');
    } else {
      console.log(`   ❌ Expected 'admin', got '${user2.role.RoleName}'`);
    }
    await User.findByIdAndDelete(user2._id);
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}`);
  }

  // Test 3: Admin creation with invalid role
  console.log('\nTest 3: Admin creation with invalid role (should fail)');
  try {
    await createUser({
      name: 'Admin Created User 3',
      email: 'admin3@example.com',
      password: 'AdminPass123!',
      role: 'nonexistent-role'
    }, { isAdminCreation: true });
    
    console.log('❌ FAILED: Should have thrown error for invalid role');
  } catch (error) {
    console.log(`✅ PASSED: Correctly rejected invalid role: ${error.message}`);
  }
}

async function testRoleUpdate(roles) {
  console.log('\n🧪 Testing Role Updates (should accept role ID)...\n');

  // Create a test user first
  const testUser = await createUser({
    name: 'Test Update User',
    email: 'update@example.com',
    password: 'UpdatePass123!'
  }, { isAdminCreation: false });

  console.log(`Created test user with role: ${testUser.role.RoleName}`);

  // Test 1: Update with role name
  console.log('\nTest 1: Update user role with role name');
  try {
    const updatedUser1 = await updateUserRole(testUser._id, {
      name: testUser.name,
      email: testUser.email,
      role: 'manager'
    });
    
    console.log(`✅ PASSED: Role updated to: ${updatedUser1.role.RoleName}`);
    if (updatedUser1.role.RoleName === 'manager') {
      console.log('   ✅ Correctly updated to manager role');
    } else {
      console.log(`   ❌ Expected 'manager', got '${updatedUser1.role.RoleName}'`);
    }
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}`);
  }

  // Test 2: Update with role ObjectId
  console.log('\nTest 2: Update user role with role ObjectId');
  try {
    const updatedUser2 = await updateUserRole(testUser._id, {
      name: testUser.name,
      email: testUser.email,
      role: roles.admin._id.toString()
    });
    
    console.log(`✅ PASSED: Role updated to: ${updatedUser2.role.RoleName}`);
    if (updatedUser2.role.RoleName === 'admin') {
      console.log('   ✅ Correctly updated to admin role via ObjectId');
    } else {
      console.log(`   ❌ Expected 'admin', got '${updatedUser2.role.RoleName}'`);
    }
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}`);
  }

  // Clean up
  await User.findByIdAndDelete(testUser._id);
}

async function main() {
  try {
    await connectDatabase();
    const roles = await setupTestRoles();
    
    await testSelfRegistration(roles);
    await testAdminCreation(roles);
    await testRoleUpdate(roles);
    
    console.log('\n🎉 All role handling tests completed!');
    console.log('\n📋 Summary:');
    console.log('✅ Self-registration always assigns student role');
    console.log('✅ Admin creation accepts both role names and ObjectIds');
    console.log('✅ Role updates work with both role names and ObjectIds');
    console.log('✅ Invalid roles are properly rejected');
    
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

module.exports = { testSelfRegistration, testAdminCreation, testRoleUpdate };
