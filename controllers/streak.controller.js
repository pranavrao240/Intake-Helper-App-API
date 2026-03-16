const streakService = require('../services/streak.service');

/**
 * GET /api/streak
 * Get the current user's streak data
 */
const getStreak = async (req, res) => {
    try {
        const userId = req.user.userId; // Fix: use userId instead of id/_id
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const streak = await streakService.getStreak(userId);

        return res.status(200).json({
            success: true,
            data: streak,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch streak',
        });
    }
};

const updateStreak = async (req, res) => {
    try {
        const userId = req.user.userId; // Fix: use userId instead of id/_id
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const { todosAdded = 0, todosCompleted = 0 } = req.body;

        // Basic validation
        if (typeof todosAdded !== 'number' || typeof todosCompleted !== 'number') {
            return res.status(400).json({
                success: false,
                message: 'todosAdded and todosCompleted must be numbers',
            });
        }

        if (todosAdded < 0 || todosCompleted < 0) {
            return res.status(400).json({
                success: false,
                message: 'todosAdded and todosCompleted cannot be negative',
            });
        }

        const streak = await streakService.updateStreak(userId, {
            todosAdded,
            todosCompleted,
        });

        return res.status(200).json({
            success: true,
            message: 'Streak updated successfully',
            data: streak,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to update streak',
        });
    }
};

const resetStreak = async (req, res) => {
    try {
        const userId = req.user.userId; // Fix: use userId instead of id/_id
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const result = await streakService.resetStreak(userId);

        return res.status(200).json({
            success: true,
            message: result.message,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to reset streak',
        });
    }
};

module.exports = {
    getStreak,
    updateStreak,
    resetStreak,
};