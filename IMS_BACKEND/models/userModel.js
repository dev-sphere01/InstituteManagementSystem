const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please Enter Your Name"],
        maxLength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
        type: String,
        required: [true, "Please Enter Your Email"],
        unique: true,
        validate: [validator.isEmail, "Please Enter a valid Email"]
    },
    password: {
        type: String,
        required: [true, "Please Enter Your Password"],
        minLength: [8, "Password should be greater than 8 characters"],
        select: false
    },
    avatar: {
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role',
        required: true,
        index: true
    },



    // User active status
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },

    // Last login timestamp
    lastLogin: {
        type: Date
    },

    // Login attempts tracking
    loginAttempts: {
        type: Number,
        default: 0
    },

    // Account locked until
    lockUntil: {
        type: Date
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
});

// Hash password before saving the user
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
});

// JWT token generation method
userSchema.methods.getJWTToken = function() {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

// Compare user password
userSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};


// Generate reset password token
userSchema.methods.getResetPasswordToken = function() {
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hashing and adding resetPasswordToken to userSchema
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    return resetToken;
}

// Check if user has specific permission (using role-based permissions only)
userSchema.methods.hasPermission = async function(permissionName) {
    // Populate role if not already populated
    if (!this.populated('role')) {
        await this.populate('role');
    }

    // Check role permissions (permissions are stored as strings)
    const hasRolePermission = this.role && this.role.permissions &&
        this.role.permissions.includes(permissionName);

    return hasRolePermission;
};

// Check if user has permission for module and action
userSchema.methods.hasModulePermission = function(module, action) {
    const permissionName = `${module}.${action}`;
    return this.hasPermission(permissionName);
};

// Get all user permissions (from role only)
userSchema.methods.getAllPermissions = async function() {
    await this.populate('role');

    // Role permissions are stored as strings
    const rolePermissions = this.role && this.role.permissions ? this.role.permissions : [];

    return rolePermissions;
};

// Check if user account is locked
userSchema.methods.isLocked = function() {
    return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Increment login attempts
userSchema.methods.incLoginAttempts = function() {
    // If we have a previous lock that has expired, restart at 1
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.updateOne({
            $unset: { lockUntil: 1 },
            $set: { loginAttempts: 1 }
        });
    }

    const updates = { $inc: { loginAttempts: 1 } };

    // Lock account after 5 failed attempts for 2 hours
    if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
        updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
    }

    return this.updateOne(updates);
};

// Reset login attempts
userSchema.methods.resetLoginAttempts = function() {
    return this.updateOne({
        $unset: { loginAttempts: 1, lockUntil: 1 },
        $set: { lastLogin: new Date() }
    });
};



module.exports = mongoose.model('User', userSchema);
