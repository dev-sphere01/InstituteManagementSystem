const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const Role = require('../models/roleModel');
const User = require('../models/userModel');

// Load env
const path = require('path');
dotenv.config({ path: path.join(__dirname, '..', 'config', 'config.env') });

const DB = process.env.NODE_ENV === 'production' ? process.env.DB_URI : process.env.DB_URI_LOCAL || process.env.DB_URI;

const rolesToEnsure = [
  { RoleName: 'admin', description: 'System Administrator', permissions: ['*'], level: 100, isActive: true, isSystem: true },
  { RoleName: 'student', description: 'Student', permissions: ['profile.read'], level: 1, isActive: true, isSystem: true },
  { RoleName: 'finance', description: 'Finance Team', permissions: ['fee.read', 'fee.update', 'workflow.read', 'workflow.update'], level: 50, isActive: true },
  { RoleName: 'counselor', description: 'Counselor', permissions: ['workflow.read', 'workflow.update'], level: 40, isActive: true },
  { RoleName: 'manager', description: 'Manager', permissions: ['workflow.read', 'workflow.update', 'workflow.admin'], level: 70, isActive: true },
  { RoleName: 'operations', description: 'Operations', permissions: ['workflow.read', 'workflow.update'], level: 30, isActive: true }
];

const usersToSeed = [
  {
    name: 'Test Admin',
    email: 'admin@example.com',
    password: 'Password@123',
    roles: ['admin']
  },
  {
    name: 'Test Finance',
    email: 'finance@example.com',
    password: 'Password@123',
    roles: ['finance']
  },
  {
    name: 'Test Counselor',
    email: 'counselor@example.com',
    password: 'Password@123',
    roles: ['counselor']
  },
  {
    name: 'Test Manager',
    email: 'manager@example.com',
    password: 'Password@123',
    roles: ['manager', 'operations']
  },
  {
    name: 'Test Student',
    email: 'student@example.com',
    password: 'Password@123',
    roles: ['student']
  }
];

const ensureRoles = async () => {
  const roleMap = {};
  for (const role of rolesToEnsure) {
    const existing = await Role.findOne({ RoleName: role.RoleName });
    if (existing) {
      roleMap[role.RoleName] = existing;
      continue;
    }
    const created = await Role.create(role);
    roleMap[role.RoleName] = created;
  }
  return roleMap;
};

const seedUsers = async (roleMap) => {
  for (const user of usersToSeed) {
    const roleDocs = user.roles.map((r) => roleMap[r]).filter(Boolean);
    if (roleDocs.length === 0) continue;

    const primaryRole = roleDocs[0];
    const roleIds = roleDocs.map((r) => r._id);

    const passwordHash = await bcrypt.hash(user.password, 10);

    await User.findOneAndUpdate(
      { email: user.email },
      {
        name: user.name,
        email: user.email,
        password: passwordHash,
        role: primaryRole._id,
        roles: roleIds,
        isActive: true,
        avatar: {
          public_id: 'seeded',
          url: 'https://via.placeholder.com/150'
        },
        isPassNew: false
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
};

const run = async () => {
  if (!DB) {
    console.error('Missing DB connection string. Set DB_URI_LOCAL or DB_URI in config.env');
    process.exit(1);
  }

  await mongoose.connect(DB);

  const roleMap = await ensureRoles();
  await seedUsers(roleMap);

  console.log('Roles and users seeded successfully.');
  await mongoose.connection.close();
};

run().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
