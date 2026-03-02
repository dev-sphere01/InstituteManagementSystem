const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDatabase = require('./config/database');
const User = require('./models/userModel');
const Role = require('./models/roleModel');

// Load env vars
dotenv.config({ path: './config/config.env' });

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await connectDatabase();
        console.log('Database connected successfully.');

        // 1. Setup Data for Roles
        const adminRoleData = {
            RoleName: 'admin',
            description: 'System Administrator',
            permissions: ['*'], // Define appropriate permissions
            level: 100,
            isSystem: true,
            isActive: true
        };

        const studentRoleData = {
            RoleName: 'student',
            description: 'Student',
            permissions: ['read_courses', 'update_profile'],
            level: 10,
            isSystem: true,
            isActive: true
        };

        // Upsert Roles (Create if not exist, Update if exist)
        const adminRole = await Role.findOneAndUpdate(
            { RoleName: adminRoleData.RoleName },
            adminRoleData,
            { new: true, upsert: true }
        );
        console.log(`Role '${adminRole.RoleName}' prepared.`);

        const studentRole = await Role.findOneAndUpdate(
            { RoleName: studentRoleData.RoleName },
            studentRoleData,
            { new: true, upsert: true }
        );
        console.log(`Role '${studentRole.RoleName}' prepared.`);

        // 2. Setup Data for Users
        const adminUserData = {
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'password123',
            avatar: {
                public_id: 'default_admin_avatar',
                url: 'https://example.com/admin_avatar.png'
            },
            role: adminRole._id,
            isActive: true
        };

        const studentUserData = {
            name: 'Student User',
            email: 'student@example.com',
            password: 'password123',
            avatar: {
                public_id: 'default_student_avatar',
                url: 'https://example.com/student_avatar.png'
            },
            role: studentRole._id,
            isActive: true
        };

        // Create Users if they don't exist
        const adminExists = await User.findOne({ email: adminUserData.email });
        if (!adminExists) {
            await User.create(adminUserData);
            console.log('Admin user created successfully.');
        } else {
            console.log('Admin user already exists. Skipping creation.');
        }

        const studentExists = await User.findOne({ email: studentUserData.email });
        if (!studentExists) {
            await User.create(studentUserData);
            console.log('Student user created successfully.');
        } else {
            console.log('Student user already exists. Skipping creation.');
        }

        console.log('Seeding finished.');
        process.exit();

    } catch (error) {
        console.error('Error with seeder script:', error);
        process.exit(1);
    }
};

seedDatabase();
