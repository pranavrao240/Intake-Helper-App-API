const notificationService = require('../services/notifications.service.js');
const { checkAndNotifyInactiveUsers } = require('../services/notificationScheduler.js');

/**
 * GET /api/notifications
 * Get user's notifications with pagination and filtering
 */
const getNotifications = async (req, res) => {
    try {
        const userId = req.user.userId;
        if (!userId) {
            return res.status(401).json({ 
                success: false, 
                message: 'Unauthorized' 
            });
        }

        const {
            page = 1,
            limit = 20,
            isRead,
            type,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Convert string parameters to appropriate types
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sortBy,
            sortOrder
        };

        if (isRead !== undefined) {
            options.isRead = isRead === 'true';
        }

        if (type) {
            options.type = type;
        }

        const result = await notificationService.getNotifications(userId, options);

        return res.status(200).json({
            success: true,
            data: result.notifications,
            pagination: result.pagination
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch notifications'
        });
    }
};

/**
 * POST /api/notifications
 * Create a new notification
 */
const createNotification = async (req, res) => {
    try {
        const userId = req.user.userId;
        if (!userId) {
            return res.status(401).json({ 
                success: false, 
                message: 'Unauthorized' 
            });
        }

        const { title, message, type, priority, actionUrl, actionText, metadata } = req.body;

        // Basic validation
        if (!title || !message) {
            return res.status(400).json({
                success: false,
                message: 'Title and message are required'
            });
        }

        const notificationData = {
            title: title.trim(),
            message: message.trim(),
            type: type || 'system',
            priority: priority || 'medium',
            actionUrl,
            actionText,
            metadata: metadata || {}
        };

        const notification = await notificationService.createNotification(userId, notificationData);

        return res.status(201).json({
            success: true,
            message: 'Notification created successfully',
            data: notification
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to create notification'
        });
    }
};

/**
 * DELETE /api/notifications
 * Delete notifications (all or specific ones)
 */
const deleteNotifications = async (req, res) => {
    try {
        const userId = req.user.userId;
        if (!userId) {
            return res.status(401).json({ 
                success: false, 
                message: 'Unauthorized' 
            });
        }

        const { notificationIds } = req.body;

        let notificationIdArray = null;
        if (notificationIds) {
            if (!Array.isArray(notificationIds)) {
                return res.status(400).json({
                    success: false,
                    message: 'notificationIds must be an array'
                });
            }
            notificationIdArray = notificationIds;
        }

        const result = await notificationService.deleteNotifications(userId, notificationIdArray);

        return res.status(200).json({
            success: true,
            message: result.message,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete notifications'
        });
    }
};

/**
 * PUT /api/notifications/read
 * Mark notifications as read
 */
const markAsRead = async (req, res) => {
    try {
        const userId = req.user.userId;
        if (!userId) {
            return res.status(401).json({ 
                success: false, 
                message: 'Unauthorized' 
            });
        }

        const { notificationIds } = req.body;

        let notificationIdArray = null;
        if (notificationIds) {
            if (!Array.isArray(notificationIds)) {
                return res.status(400).json({
                    success: false,
                    message: 'notificationIds must be an array'
                });
            }
            notificationIdArray = notificationIds;
        }

        const result = await notificationService.markAsRead(userId, notificationIdArray);

        return res.status(200).json({
            success: true,
            message: result.message,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to mark notifications as read'
        });
    }
};

/**
 * GET /api/notifications/unread-count
 * Get unread notifications count
 */
const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.userId;
        if (!userId) {
            return res.status(401).json({ 
                success: false, 
                message: 'Unauthorized' 
            });
        }

        const result = await notificationService.getUnreadCount(userId);

        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to get unread count'
        });
    }
};

/**
 * POST /api/notifications/streak
 * Create streak notification
 */
const createStreakNotification = async (req, res) => {
    try {
        const userId = req.user.userId;
        if (!userId) {
            return res.status(401).json({ 
                success: false, 
                message: 'Unauthorized' 
            });
        }

        const { type, streakCount } = req.body;

        if (!type || !['milestone', 'warning', 'lost'].includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid streak notification type. Must be: milestone, warning, or lost'
            });
        }

        const notification = await notificationService.createStreakNotification(userId, type, streakCount || 0);

        return res.status(201).json({
            success: true,
            message: 'Streak notification created successfully',
            data: notification
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to create streak notification'
        });
    }
};

/**
 * POST /api/notifications/meal-reminder
 * Create meal reminder notification
 */
const createMealReminder = async (req, res) => {
    try {
        const userId = req.user.userId;
        if (!userId) {
            return res.status(401).json({ 
                success: false, 
                message: 'Unauthorized' 
            });
        }

        const { mealType, time } = req.body;

        if (!mealType || !time) {
            return res.status(400).json({
                success: false,
                message: 'mealType and time are required'
            });
        }

        const notification = await notificationService.createMealReminder(userId, mealType, new Date(time));

        return res.status(201).json({
            success: true,
            message: 'Meal reminder created successfully',
            data: notification
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to create meal reminder'
        });
    }
};

/**
 * DELETE /api/notifications/cleanup
 * Delete old read notifications
 */
const deleteOldNotifications = async (req, res) => {
    try {
        const userId = req.user.userId;
        if (!userId) {
            return res.status(401).json({ 
                success: false, 
                message: 'Unauthorized' 
            });
        }

        const { daysOld = 30 } = req.query;

        const result = await notificationService.deleteOldNotifications(userId, parseInt(daysOld));

        return res.status(200).json({
            success: true,
            message: result.message,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete old notifications'
        });
    }
};

/**
 * GET /api/notifications/trigger-inactive-check
 * Trigger the inactive user check manually
 */
const triggerInactiveCheck = async (req, res) => {
    try {
        const results = await checkAndNotifyInactiveUsers();
        return res.status(200).json({
            success: true,
            message: 'Inactive user notification check complete',
            data: results
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to trigger inactive check'
        });
    }
};

module.exports = {
    getNotifications,
    createNotification,
    deleteNotifications,
    markAsRead,
    getUnreadCount,
    createStreakNotification,
    createMealReminder,
    deleteOldNotifications,
    triggerInactiveCheck
};