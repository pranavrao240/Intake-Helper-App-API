const Notification = require('../models/notifications.model.js');

async function getNotifications(userId, options = {}) {
    try {
        const {
            page = 1,
            limit = 20,
            isRead,
            type,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = options;

        const result = await Notification.getUserNotifications(userId, {
            page,
            limit,
            isRead,
            type,
            sortBy,
            sortOrder
        });

        return result;
    } catch (error) {
        throw new Error(`Failed to get notifications: ${error.message}`);
    }
}

async function createNotification(userId, notificationData) {
    try {
        const notification = await Notification.createNotification({
            userId,
            ...notificationData
        });

        return notification;
    } catch (error) {
        throw new Error(`Failed to create notification: ${error.message}`);
    }
}

async function deleteNotifications(userId, notificationIds = null) {
    try {
        let query = { userId };
        
        if (notificationIds) {
            query._id = { $in: notificationIds };
        }

        const result = await Notification.deleteMany(query);

        return {
            deletedCount: result.deletedCount,
            message: `Deleted ${result.deletedCount} notifications`
        };
    } catch (error) {
        throw new Error(`Failed to delete notifications: ${error.message}`);
    }
}

async function markAsRead(userId, notificationIds = null) {
    try {
        const result = await Notification.markAsRead(userId, notificationIds);
        return result;
    } catch (error) {
        throw new Error(`Failed to mark notifications as read: ${error.message}`);
    }
}

async function getUnreadCount(userId) {
    try {
        const count = await Notification.getUnreadCount(userId);
        return { unreadCount: count };
    } catch (error) {
        throw new Error(`Failed to get unread count: ${error.message}`);
    }
}

async function createStreakNotification(userId, type, streakCount = 0) {
    try {
        const notification = await Notification.createStreakNotification(userId, type, streakCount);
        return notification;
    } catch (error) {
        throw new Error(`Failed to create streak notification: ${error.message}`);
    }
}

async function createMealReminder(userId, mealType, time) {
    try {
        const notification = await Notification.createMealReminder(userId, mealType, time);
        return notification;
    } catch (error) {
        throw new Error(`Failed to create meal reminder: ${error.message}`);
    }
}

async function createAchievementNotification(userId, achievement) {
    try {
        const notification = await Notification.createAchievementNotification(userId, achievement);
        return notification;
    } catch (error) {
        throw new Error(`Failed to create achievement notification: ${error.message}`);
    }
}

async function deleteOldNotifications(userId, daysOld = 30) {
    try {
        const result = await Notification.deleteOldNotifications(userId, daysOld);
        return result;
    } catch (error) {
        throw new Error(`Failed to delete old notifications: ${error.message}`);
    }
}

module.exports = {
    getNotifications,
    createNotification,
    deleteNotifications,
    markAsRead,
    getUnreadCount,
    createStreakNotification,
    createMealReminder,
    createAchievementNotification,
    deleteOldNotifications
};