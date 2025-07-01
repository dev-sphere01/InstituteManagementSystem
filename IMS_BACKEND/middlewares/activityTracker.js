const User = require('../models/userModel');
const logger = require('../utils/logger');

/**
 * Middleware to track user activity
 * Updates lastActivity timestamp for authenticated users
 */
const trackActivity = async (req, res, next) => {
    try {
        // Only track activity for authenticated users
        if (req.user && req.user._id) {
            // Update user activity asynchronously to avoid blocking the request
            setImmediate(async () => {
                try {
                    await req.user.updateActivity();
                } catch (error) {
                    logger.error('Failed to update user activity', {
                        userId: req.user._id,
                        error: error.message
                    });
                }
            });
        }
        
        next();
    } catch (error) {
        // Don't block the request if activity tracking fails
        logger.error('Activity tracking middleware error', {
            error: error.message,
            userId: req.user?._id
        });
        next();
    }
};

/**
 * Get currently active users (online within last 5 minutes)
 */
const getActiveUsers = async () => {
    try {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        
        const activeUsers = await User.find({
            isOnline: true,
            lastActivity: { $gte: fiveMinutesAgo },
            isActive: true
        })
        .select('name email role lastActivity currentSession.ipAddress')
        .populate('role', 'RoleName')
        .sort({ lastActivity: -1 });
        
        return activeUsers;
    } catch (error) {
        logger.error('Failed to get active users', { error: error.message });
        throw error;
    }
};

/**
 * Get user activity statistics
 */
const getActivityStats = async () => {
    try {
        const now = new Date();
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
        const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const [
            onlineUsers,
            awayUsers,
            todayActiveUsers,
            weekActiveUsers,
            totalUsers
        ] = await Promise.all([
            // Online users (active within 5 minutes)
            User.countDocuments({
                isOnline: true,
                lastActivity: { $gte: fiveMinutesAgo },
                isActive: true
            }),
            
            // Away users (active within 30 minutes but not online)
            User.countDocuments({
                lastActivity: { $gte: thirtyMinutesAgo, $lt: fiveMinutesAgo },
                isActive: true
            }),
            
            // Users active today
            User.countDocuments({
                lastActivity: { $gte: oneDayAgo },
                isActive: true
            }),
            
            // Users active this week
            User.countDocuments({
                lastActivity: { $gte: oneWeekAgo },
                isActive: true
            }),
            
            // Total active users
            User.countDocuments({ isActive: true })
        ]);

        return {
            online: onlineUsers,
            away: awayUsers,
            todayActive: todayActiveUsers,
            weekActive: weekActiveUsers,
            total: totalUsers,
            timestamp: now
        };
    } catch (error) {
        logger.error('Failed to get activity stats', { error: error.message });
        throw error;
    }
};

/**
 * Clean up inactive sessions (mark users as offline if inactive for more than 30 minutes)
 */
const cleanupInactiveSessions = async () => {
    try {
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
        
        const result = await User.updateMany(
            {
                isOnline: true,
                lastActivity: { $lt: thirtyMinutesAgo }
            },
            {
                $set: { isOnline: false }
            }
        );
        
        if (result.modifiedCount > 0) {
            logger.info(`Marked ${result.modifiedCount} users as offline due to inactivity`);
        }
        
        return result.modifiedCount;
    } catch (error) {
        logger.error('Failed to cleanup inactive sessions', { error: error.message });
        throw error;
    }
};

/**
 * Get user session history
 */
const getUserSessionHistory = async (userId, limit = 10) => {
    try {
        const user = await User.findById(userId)
            .select('sessionHistory currentSession')
            .lean();
        
        if (!user) {
            throw new Error('User not found');
        }
        
        let sessions = [...(user.sessionHistory || [])];
        
        // Add current session if exists
        if (user.currentSession && user.currentSession.sessionId) {
            sessions.unshift({
                ...user.currentSession,
                logoutTime: null,
                duration: Math.floor((Date.now() - user.currentSession.loginTime) / (1000 * 60)),
                isCurrent: true
            });
        }
        
        return sessions.slice(0, limit);
    } catch (error) {
        logger.error('Failed to get user session history', { 
            error: error.message,
            userId 
        });
        throw error;
    }
};

module.exports = {
    trackActivity,
    getActiveUsers,
    getActivityStats,
    cleanupInactiveSessions,
    getUserSessionHistory
};
