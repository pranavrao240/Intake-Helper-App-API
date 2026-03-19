const mongoose = require('mongoose');



const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    type: {
        type: String,
        required: true,
        enum: [
            'streak_milestone',    // Streak achievements
            'streak_warning',      // About to lose streak
            'streak_lost',         // Streak reset
            'meal_reminder',       // Meal time reminders
            'nutrition_goal',      // Nutrition goal achievements
            'profile_update',      // Profile related updates
            'system',              // System notifications
            'todo_reminder',       // Todo completion reminders
            'achievement'          // General achievements
        ],
        default: 'system'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    isRead: {
        type: Boolean,
        default: false,
        index: true
    },
    actionUrl: {
        type: String,
        default: null // URL to navigate to when notification is clicked
    },
    actionText: {
        type: String,
        default: null // Text for action button
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {} // Additional data like streak count, meal type, etc.
    },
    expiresAt: {
        type: Date,
        default: null // Auto-delete notification after this date
    },
    scheduledFor: {
        type: Date,
        default: null // Send notification at this future time
    },
    sentAt: {
        type: Date,
        default: null // When notification was actually sent
    }
}, {
    timestamps: true,
    toJSON: {
        transform: function(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

// Indexes for efficient queries
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ scheduledFor: 1 });
notificationSchema.index({ expiresAt: 1 });

// Static method to create notification
notificationSchema.statics.createNotification = async function(notificationData) {
    try {
        const notification = new this(notificationData);
        await notification.save();
        return notification;
    } catch (error) {
        throw new Error(`Failed to create notification: ${error.message}`);
    }
};

// Static method to get user notifications
notificationSchema.statics.getUserNotifications = async function(userId, options = {}) {
    try {
        const {
            page = 1,
            limit = 20,
            isRead,
            type,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = options;

        const query = { userId };
        
        if (isRead !== undefined) {
            query.isRead = isRead;
        }
        
        if (type) {
            query.type = type;
        }

        const skip = (page - 1) * limit;
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

         const notifications = await this.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean({ virtuals: false });

    const mapped = notifications.map(({ _id, __v, ...rest }) => ({
        id: _id,
        ...rest,
    }));

    const total = await this.countDocuments(query);

    return {
        notifications: mapped,  
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
    } catch (error) {
        throw new Error(`Failed to get notifications: ${error.message}`);
    }
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = async function(userId) {
    try {
        return await this.countDocuments({ 
            userId, 
            isRead: false 
        });
    } catch (error) {
        throw new Error(`Failed to get unread count: ${error.message}`);
    }
};

// Static method to mark notifications as read
notificationSchema.statics.markAsRead = async function(userId, notificationIds = null) {
    try {
        const query = { userId, isRead: false };
        
        if (notificationIds) {
            query._id = { $in: notificationIds };
        }

        const result = await this.updateMany(
            query,
            { isRead: true }
        );

        return {
            modifiedCount: result.modifiedCount,
            message: `Marked ${result.modifiedCount} notifications as read`
        };
    } catch (error) {
        throw new Error(`Failed to mark notifications as read: ${error.message}`);
    }
};

// Static method to delete old notifications
notificationSchema.statics.deleteOldNotifications = async function(userId, daysOld = 30) {
    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        const result = await this.deleteMany({
            userId,
            createdAt: { $lt: cutoffDate },
            isRead: true // Only delete read notifications
        });

        return {
            deletedCount: result.deletedCount,
            message: `Deleted ${result.deletedCount} old notifications`
        };
    } catch (error) {
        throw new Error(`Failed to delete old notifications: ${error.message}`);
    }
};

// Static method to create streak notifications
notificationSchema.statics.createStreakNotification = async function(userId, type, streakCount = 0) {
    try {
        let title, message, actionUrl, actionText;
        
        switch (type) {
            case 'milestone':
                title = `🔥 ${streakCount} Day Streak!`;
                message = `Congratulations! You've maintained your streak for ${streakCount} days. Keep it up!`;
                actionUrl = '/streak';
                actionText = 'View Streak';
                break;
                
            case 'warning':
                title = '⚠️ Streak at Risk!';
                message = 'Complete a todo today to maintain your streak!';
                actionUrl = '/todos';
                actionText = 'Complete Todo';
                break;
                
            case 'lost':
                title = '😔 Streak Lost';
                message = 'Your streak has been reset. Start fresh today!';
                actionUrl = '/todos';
                actionText = 'Start New Streak';
                break;
                
            default:
                throw new Error('Invalid streak notification type');
        }

        return await this.createNotification({
            userId,
            title,
            message,
            type: type === 'milestone' ? 'streak_milestone' : 
                  type === 'warning' ? 'streak_warning' : 'streak_lost',
            priority: type === 'warning' ? 'high' : 'medium',
            actionUrl,
            actionText,
            metadata: { streakCount }
        });
    } catch (error) {
        throw new Error(`Failed to create streak notification: ${error.message}`);
    }
};

// Static method to create meal reminder
notificationSchema.statics.createMealReminder = async function(userId, mealType, time) {
    try {
        const title = `🍽️ ${mealType} Time!`;
        const message = `Don't forget to log your ${mealType.toLowerCase()} today.`;
        
        return await this.createNotification({
            userId,
            title,
            message,
            type: 'meal_reminder',
            priority: 'medium',
            actionUrl: '/nutrition',
            actionText: 'Log Meal',
            metadata: { mealType, time },
            scheduledFor: time
        });
    } catch (error) {
        throw new Error(`Failed to create meal reminder: ${error.message}`);
    }
};

// Static method to create achievement notification
notificationSchema.statics.createAchievementNotification = async function(userId, achievement) {
    try {
        const { title, description, icon = '🏆' } = achievement;
        
        return await this.createNotification({
            userId,
            title: `${icon} ${title}`,
            message: description,
            type: 'achievement',
            priority: 'high',
            actionUrl: '/profile',
            actionText: 'View Profile',
            metadata: achievement
        });
    } catch (error) {
        throw new Error(`Failed to create achievement notification: ${error.message}`);
    }
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;