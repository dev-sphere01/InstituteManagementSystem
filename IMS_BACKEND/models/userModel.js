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
    roles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role',
        index: true
    }],



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

    // Last activity timestamp (for tracking active users)
    lastActivity: {
        type: Date,
        default: Date.now,
        index: true
    },

    // Online status
    isOnline: {
        type: Boolean,
        default: false,
        index: true
    },

    // Current session information
    currentSession: {
        sessionId: String,
        ipAddress: String,
        userAgent: String,
        loginTime: Date,
        lastActivity: Date
    },

    // Session history (keep last 10 sessions)
    sessionHistory: [{
        sessionId: String,
        ipAddress: String,
        userAgent: String,
        loginTime: Date,
        logoutTime: Date,
        duration: Number, // in minutes
        _id: false
    }],

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
    resetPasswordExpire: Date,

    // Additional fields
    phone: {
        type: String,
        required: false,
        maxLength: 20
    },
    address: {
        type: String,
        required: false,
        maxLength: 255
    },
    // Track if password is system-generated/new
    isPassNew: {
        type: Boolean,
        default: false
    }
});

// Hash password before saving the user
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
});

// JWT token generation method
userSchema.methods.getJWTToken = function() {
    // Include permissions if role is populated (it is at login via authenticateUser)
    const permissions = this.role && this.role.permissions ? this.role.permissions : [];
    return jwt.sign(
        { id: this._id, permissions },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
    );
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
    // Populate role/roles if not already populated
    if (!this.populated('role') && this.role) {
        await this.populate('role');
    }
    if (!this.populated('roles') && this.roles && this.roles.length > 0) {
        await this.populate('roles');
    }

    const roleDocs = [];
    if (this.role) roleDocs.push(this.role);
    if (Array.isArray(this.roles)) {
        this.roles.forEach((r) => {
            if (r) roleDocs.push(r);
        });
    }

    if (roleDocs.length === 0) return false;

    const permissions = roleDocs.reduce((acc, role) => {
        if (role && Array.isArray(role.permissions)) {
            acc.push(...role.permissions);
        }
        return acc;
    }, []);

    // Full wildcard access
    if (permissions.includes('*')) return true;

    // Exact match
    if (permissions.includes(permissionName)) return true;

    // Module wildcard match (e.g., 'role.*' matches 'role.read')
    const matchesModuleWildcard = permissions.some((perm) => {
        if (!perm || typeof perm !== 'string') return false;
        if (!perm.endsWith('.*')) return false;
        const prefix = perm.slice(0, -2);
        return permissionName.startsWith(`${prefix}.`);
    });

    const hasRolePermission = matchesModuleWildcard;

    // Wildcard — admin role grants everything
    if (rolePermissions.includes('*')) return true;

    return rolePermissions.includes(permissionName);
};

// Check if user has permission for module and action
userSchema.methods.hasModulePermission = function(module, action) {
    const permissionName = `${module}.${action}`;
    return this.hasPermission(permissionName);
};

// Get all user permissions (from role only)
userSchema.methods.getAllPermissions = async function() {
    if (!this.populated('role') && this.role) {
        await this.populate('role');
    }
    if (!this.populated('roles') && this.roles && this.roles.length > 0) {
        await this.populate('roles');
    }

    const roleDocs = [];
    if (this.role) roleDocs.push(this.role);
    if (Array.isArray(this.roles)) {
        this.roles.forEach((r) => {
            if (r) roleDocs.push(r);
        });
    }

    const permissions = roleDocs.reduce((acc, role) => {
        if (role && Array.isArray(role.permissions)) {
            acc.push(...role.permissions);
        }
        return acc;
    }, []);

    return permissions;
};

userSchema.methods.getRoleIds = function() {
    const ids = [];
    if (this.role) ids.push(this.role);
    if (Array.isArray(this.roles)) {
        this.roles.forEach((r) => {
            if (r) ids.push(r);
        });
    }
    return Array.from(new Set(ids.map((id) => id.toString()))).map((id) => mongoose.Types.ObjectId(id));
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

// Start a new session
userSchema.methods.startSession = function(sessionData) {
    const sessionId = require('crypto').randomBytes(32).toString('hex');
    const now = new Date();

    // Add current session to history if it exists
    if (this.currentSession && this.currentSession.sessionId) {
        const sessionDuration = Math.floor((now - this.currentSession.loginTime) / (1000 * 60)); // in minutes

        this.sessionHistory.unshift({
            sessionId: this.currentSession.sessionId,
            ipAddress: this.currentSession.ipAddress,
            userAgent: this.currentSession.userAgent,
            loginTime: this.currentSession.loginTime,
            logoutTime: now,
            duration: sessionDuration
        });

        // Keep only last 10 sessions
        if (this.sessionHistory.length > 10) {
            this.sessionHistory = this.sessionHistory.slice(0, 10);
        }
    }

    // Set new current session
    this.currentSession = {
        sessionId: sessionId,
        ipAddress: sessionData.ipAddress,
        userAgent: sessionData.userAgent,
        loginTime: now,
        lastActivity: now
    };

    this.isOnline = true;
    this.lastActivity = now;
    this.lastLogin = now;

    return this.save();
};

// Update user activity
userSchema.methods.updateActivity = function() {
    const now = new Date();
    this.lastActivity = now;
    this.isOnline = true;

    if (this.currentSession) {
        this.currentSession.lastActivity = now;
    }

    return this.updateOne({
        $set: {
            lastActivity: now,
            isOnline: true,
            'currentSession.lastActivity': now
        }
    });
};

// End current session
userSchema.methods.endSession = function() {
    const now = new Date();

    if (this.currentSession && this.currentSession.sessionId) {
        const sessionDuration = Math.floor((now - this.currentSession.loginTime) / (1000 * 60)); // in minutes

        this.sessionHistory.unshift({
            sessionId: this.currentSession.sessionId,
            ipAddress: this.currentSession.ipAddress,
            userAgent: this.currentSession.userAgent,
            loginTime: this.currentSession.loginTime,
            logoutTime: now,
            duration: sessionDuration
        });

        // Keep only last 10 sessions
        if (this.sessionHistory.length > 10) {
            this.sessionHistory = this.sessionHistory.slice(0, 10);
        }
    }

    this.currentSession = undefined;
    this.isOnline = false;

    return this.save();
};

// Check if user is currently active (active within last 5 minutes)
userSchema.methods.isCurrentlyActive = function() {
    if (!this.lastActivity) return false;
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return this.lastActivity > fiveMinutesAgo && this.isOnline;
};

// Get user's current status
userSchema.methods.getActivityStatus = function() {
    if (!this.lastActivity) return 'never_active';

    const now = Date.now();
    const lastActivityTime = this.lastActivity.getTime();
    const timeDiff = now - lastActivityTime;

    if (this.isOnline && timeDiff < 5 * 60 * 1000) { // 5 minutes
        return 'online';
    } else if (timeDiff < 30 * 60 * 1000) { // 30 minutes
        return 'away';
    } else if (timeDiff < 24 * 60 * 60 * 1000) { // 24 hours
        return 'offline';
    } else {
        return 'inactive';
    }
};



module.exports = mongoose.model('User', userSchema);
